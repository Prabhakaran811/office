import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Building,
  Calendar,
  CheckCircle,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { ServiceInvoice, PaymentReceipt, Customer, UserRole } from '../../types';
import { Modal } from '../common/Modal';
import {
  getNextDocNumber,
  commitNextDocSequence,
  formatCurrency,
} from '../../services/numbering';

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetInvoice?: ServiceInvoice | null;
  invoices: ServiceInvoice[];
  customers: Customer[];
  currentRole: UserRole;
  onSavePayment: (payment: PaymentReceipt, updatedInvoice: ServiceInvoice) => void;
}

export const PaymentFormModal: React.FC<PaymentFormModalProps> = ({
  isOpen,
  onClose,
  targetInvoice,
  invoices,
  customers,
  currentRole,
  onSavePayment,
}) => {
  const [receiptNo, setReceiptNo] = useState('');
  const [receiptDate, setReceiptDate] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<
    'NEFT/RTGS' | 'Cheque' | 'UPI' | 'Net Banking' | 'Cash'
  >('NEFT/RTGS');
  const [transactionRef, setTransactionRef] = useState('');
  const [bankName, setBankName] = useState('HDFC Bank Ltd.');
  const [notes, setNotes] = useState('');
  const [newSeqNumber, setNewSeqNumber] = useState<number | null>(null);

  const activeInvoicesWithBalance = invoices.filter(
    (i) => i.balanceAmount > 0 && i.status !== 'Cancelled'
  );

  const currentInvoice =
    invoices.find((i) => i.id === selectedInvoiceId) || targetInvoice || null;

  useEffect(() => {
    if (!isOpen) return;

    const generated = getNextDocNumber('receipt');
    setReceiptNo(generated.docNo);
    setNewSeqNumber(generated.newSequence);

    const today = new Date().toISOString().split('T')[0];
    setReceiptDate(today);

    if (targetInvoice) {
      setSelectedInvoiceId(targetInvoice.id);
      setAmount(targetInvoice.balanceAmount);
      setNotes(`Payment received against ${targetInvoice.invoiceNo}`);
    } else if (activeInvoicesWithBalance.length > 0) {
      setSelectedInvoiceId(activeInvoicesWithBalance[0].id);
      setAmount(activeInvoicesWithBalance[0].balanceAmount);
      setNotes(`Payment received against ${activeInvoicesWithBalance[0].invoiceNo}`);
    } else {
      setSelectedInvoiceId('');
      setAmount(0);
      setNotes('');
    }

    setPaymentMode('NEFT/RTGS');
    setTransactionRef('');
  }, [isOpen, targetInvoice]);

  const handleInvoiceSelect = (id: string) => {
    setSelectedInvoiceId(id);
    const inv = invoices.find((i) => i.id === id);
    if (inv) {
      setAmount(inv.balanceAmount);
      setNotes(`Payment against ${inv.invoiceNo}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInvoice) {
      alert('Please select an invoice to record payment against.');
      return;
    }
    if (amount <= 0) {
      alert('Payment amount must be greater than zero.');
      return;
    }
    if (amount > currentInvoice.balanceAmount + 0.01) {
      alert(
        `Payment amount (₹${amount}) cannot exceed outstanding balance (₹${currentInvoice.balanceAmount}).`
      );
      return;
    }

    const currentTimestamp = new Date().toISOString();

    // 1. Create Receipt
    const receipt: PaymentReceipt = {
      id: 'pay-' + Date.now(),
      receiptNo: receiptNo.trim(),
      receiptDate,
      customerId: currentInvoice.customerId,
      customerName: currentInvoice.customerName,
      invoiceId: currentInvoice.id,
      invoiceNo: currentInvoice.invoiceNo,
      amount,
      paymentMode,
      transactionRef: transactionRef.trim() || 'N/A',
      bankName: bankName.trim(),
      notes: notes.trim(),
      receivedBy: currentRole,
      createdAt: currentTimestamp,
    };

    // 2. Compute updated Invoice
    const newPaidAmount = currentInvoice.amountPaid + amount;
    const newBalanceAmount = Math.max(0, currentInvoice.grandTotal - newPaidAmount);
    const newPaymentStatus =
      newBalanceAmount === 0 ? 'Paid' : newPaidAmount > 0 ? 'Partially Paid' : 'Unpaid';

    const updatedInvoice: ServiceInvoice = {
      ...currentInvoice,
      amountPaid: newPaidAmount,
      balanceAmount: newBalanceAmount,
      status: newPaymentStatus,
      paymentMode,
      transactionRef: transactionRef.trim(),
      paymentDate: receiptDate,
      updatedAt: currentTimestamp,
      auditHistory: [
        ...(currentInvoice.auditHistory || []),
        {
          timestamp: currentTimestamp,
          user: currentRole,
          role: currentRole,
          action: `Recorded ${paymentMode} Payment of ₹${amount} (${receiptNo})`,
          details: `Remaining balance: ₹${newBalanceAmount}. Status changed to ${newPaymentStatus}.`,
        },
      ],
    };

    if (newSeqNumber) {
      commitNextDocSequence('receipt', newSeqNumber);
    }

    onSavePayment(receipt, updatedInvoice);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Customer Payment Receipt"
      subtitle="Module I: Reduces customer outstanding and creates double-entry bank receipt ledger record"
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" /> Confirm & Issue Receipt
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Receipt Number & Date */}
        <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Receipt Number *
              </label>
              <input
                type="text"
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-amber-400 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Receipt Date *
              </label>
              <input
                type="date"
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Invoice Picker & Balance Card */}
        <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Select Outstanding Invoice *
          </label>
          <select
            value={selectedInvoiceId}
            onChange={(e) => handleInvoiceSelect(e.target.value)}
            required
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden cursor-pointer"
          >
            <option value="">-- Choose Invoice to Settle --</option>
            {activeInvoicesWithBalance.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.invoiceNo} — {inv.customerName} (Bal: {formatCurrency(inv.balanceAmount)})
              </option>
            ))}
          </select>

          {currentInvoice && (
            <div className="mt-3 p-3 bg-slate-900 rounded-lg border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">Total Invoiced</span>
                <span className="font-bold text-white">{formatCurrency(currentInvoice.grandTotal)}</span>
              </div>
              <div>
                <span className="text-cyan-400 block text-[10px]">Previously Paid</span>
                <span className="font-bold text-cyan-400">{formatCurrency(currentInvoice.amountPaid)}</span>
              </div>
              <div>
                <span className="text-rose-400 block text-[10px]">Current Balance</span>
                <span className="font-bold text-rose-400">{formatCurrency(currentInvoice.balanceAmount)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Payment Amount & Mode */}
        <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Payment Amount (₹) *
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono font-bold text-white focus:outline-hidden focus:border-amber-500"
              />
              {currentInvoice && (
                <button
                  type="button"
                  onClick={() => setAmount(currentInvoice.balanceAmount)}
                  className="text-[10px] text-amber-400 hover:underline mt-1 block cursor-pointer"
                >
                  Pay Full Balance ({formatCurrency(currentInvoice.balanceAmount)})
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Payment Mode *
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden cursor-pointer"
              >
                <option value="NEFT/RTGS">NEFT / RTGS</option>
                <option value="Cheque">Cheque / Demand Draft</option>
                <option value="UPI">UPI / QR Code</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Transaction Reference / UTR / Cheque No
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. UTR-HDFC90281923"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Deposited Bank / Branch
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Receipt Remarks / Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cleared via RTGS on 28-Apr-2026"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
