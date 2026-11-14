import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  CheckCircle,
  Building,
  CreditCard,
} from 'lucide-react';
import { PaymentReceipt, CompanyProfile } from '../../types';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate, numberToWordsIndian } from '../../services/numbering';
import { exportElementToPdf, triggerPrint, generateWhatsAppLink } from '../../services/pdfExport';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: PaymentReceipt | null;
  company: CompanyProfile;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  receipt,
  company,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !receipt) return null;

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    await exportElementToPdf(
      'payment-receipt-a4',
      `Payment_Receipt_${receipt.receiptNo.replace(/\//g, '_')}`
    );
    setIsExporting(false);
  };

  const handleWhatsApp = () => {
    const link = generateWhatsAppLink(
      '',
      'Payment Receipt',
      receipt.receiptNo,
      receipt.customerName,
      `Received: ${formatCurrency(receipt.amount)} against Invoice ${receipt.invoiceNo} via ${receipt.paymentMode}`,
      formatDate(receipt.receiptDate)
    );
    window.open(link, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Payment Receipt Voucher: ${receipt.receiptNo}`}
      subtitle={`Customer: ${receipt.customerName} | Amount: ${formatCurrency(receipt.amount)}`}
      size="xl"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-700/60 text-emerald-300 hover:bg-emerald-900 text-xs font-medium cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" /> WhatsApp
          </button>
          <button
            onClick={triggerPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> {isExporting ? 'Generating...' : 'Download Receipt'}
          </button>
        </div>
      }
    >
      <div className="flex justify-center bg-slate-950 p-2 sm:p-4 rounded-xl border border-slate-800 overflow-x-auto">
        {/* Printable Payment Voucher Container */}
        <div
          id="payment-receipt-a4"
          className="w-[190mm] min-h-[140mm] bg-white text-slate-900 p-8 shadow-2xl flex flex-col justify-between text-[11px] font-sans print-container select-text rounded border-2 border-slate-300"
          style={{ boxSizing: 'border-box' }}
        >
          <div>
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
              <div>
                <div className="text-lg font-black uppercase text-slate-950 tracking-tight font-mono">
                  {company.name}
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5 leading-relaxed">
                  {company.address}
                </div>
                <div className="text-[10px] font-mono text-slate-800 mt-1">
                  <strong>GSTIN:</strong> {company.gstin} | <strong>PAN:</strong> {company.pan}
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-300 uppercase">
                  Official Payment Voucher
                </span>
                <div className="text-[9px] text-slate-500 font-mono mt-1">
                  Bank / Cash Inflow Record
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center my-3 bg-slate-900 text-white py-1 rounded font-mono font-bold text-xs tracking-widest uppercase">
              PAYMENT ACKNOWLEDGEMENT RECEIPT
            </div>

            {/* Receipt Details Grid */}
            <div className="grid grid-cols-2 gap-3 border border-slate-300 rounded p-3 bg-slate-50 mb-3 text-[10px]">
              <div>
                <div>
                  <span className="text-slate-500 font-mono">RECEIPT NUMBER:</span>{' '}
                  <strong className="font-mono text-slate-950 text-xs">{receipt.receiptNo}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-mono">RECEIPT DATE:</span>{' '}
                  <strong className="text-slate-900">{formatDate(receipt.receiptDate)}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-mono">AGAINST INVOICE:</span>{' '}
                  <strong className="text-emerald-800 font-mono">{receipt.invoiceNo}</strong>
                </div>
              </div>

              <div className="border-l border-slate-300 pl-3">
                <div>
                  <span className="text-slate-500 font-mono">PAYMENT MODE:</span>{' '}
                  <strong className="text-slate-900">{receipt.paymentMode}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-mono">TRANSACTION REF / UTR:</span>{' '}
                  <strong className="font-mono text-slate-950">{receipt.transactionRef}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-mono">DEPOSITED BANK:</span>{' '}
                  <span className="text-slate-800">{receipt.bankName || company.bankName}</span>
                </div>
              </div>
            </div>

            {/* Customer & Amount Acknowledged */}
            <div className="border border-slate-300 rounded p-4 mb-4 bg-white space-y-2">
              <div className="text-[11px] text-slate-700 leading-relaxed">
                Received with thanks from{' '}
                <strong className="text-slate-950 text-xs uppercase underline">
                  {receipt.customerName}
                </strong>
                , a sum of{' '}
                <strong className="text-slate-950 text-sm font-mono font-bold bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  {formatCurrency(receipt.amount)}
                </strong>{' '}
                towards settlement of Service Invoice{' '}
                <strong className="font-mono text-slate-950">{receipt.invoiceNo}</strong>.
              </div>

              <div className="pt-2 border-t border-slate-200 text-[10px]">
                <span className="font-mono text-slate-500 uppercase font-semibold">
                  Amount in words:
                </span>{' '}
                <span className="font-serif italic font-bold text-slate-900">
                  {numberToWordsIndian(receipt.amount)}
                </span>
              </div>

              {receipt.notes && (
                <div className="text-[10px] text-slate-600 italic pt-1">
                  Remarks: {receipt.notes}
                </div>
              )}
            </div>
          </div>

          {/* Signatures */}
          <div className="border-t-2 border-slate-900 pt-3 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[9px] text-slate-500 font-mono">
                  Cashier / Accounts Officer: <strong>{receipt.receivedBy}</strong>
                </div>
                <div className="text-[8px] text-slate-400 mt-0.5">
                  Subject to realization of Cheque / RTGS credit
                </div>
              </div>

              <div className="text-center w-56 border-t border-slate-400 pt-1 font-bold text-slate-900 text-[10px] uppercase">
                Authorized Signature
                <div className="text-[8px] text-slate-500 font-normal">
                  For {company.name}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
