import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Eye,
  Printer,
  Download,
  Share2,
  Calendar,
  Building,
  CheckCircle,
} from 'lucide-react';
import { PaymentReceipt, UserRole } from '../../types';
import { formatCurrency, formatDate } from '../../services/numbering';

interface PaymentListViewProps {
  payments: PaymentReceipt[];
  currentRole: UserRole;
  onNewPayment: () => void;
  onViewReceipt: (receipt: PaymentReceipt) => void;
}

export const PaymentListView: React.FC<PaymentListViewProps> = ({
  payments,
  currentRole,
  onNewPayment,
  onViewReceipt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPayments = payments.filter((p) => {
    return (
      p.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.transactionRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.paymentMode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalCollected = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const canRecord = currentRole === 'Admin' || currentRole === 'Accounts' || currentRole === 'Manager';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Customer Payments & Receipts
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Module B & I
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            NEFT, RTGS, Cheque & UPI bank receipt tracking with automatic customer ledger reconciliation
          </p>
        </div>

        {canRecord && (
          <button
            onClick={onNewPayment}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            + Record Payment
          </button>
        )}
      </div>

      {/* Stats and Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search receipt no, invoice no, customer, UTR / transaction ref..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2">
          <span className="text-xs text-slate-400 font-mono">Total Collected:</span>
          <span className="text-sm font-bold font-mono text-emerald-400">
            {formatCurrency(totalCollected)}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Receipt No</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Against Invoice</th>
                <th className="px-4 py-3">Payment Mode & Ref</th>
                <th className="px-4 py-3 text-right">Amount Received</th>
                <th className="px-4 py-3">Received By</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No payment receipts found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-amber-400 hover:underline cursor-pointer" onClick={() => onViewReceipt(p)}>
                      {p.receiptNo}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {formatDate(p.receiptDate)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-200">
                      {p.customerName}
                    </td>
                    <td className="px-4 py-3 font-mono text-emerald-400 font-semibold">
                      {p.invoiceNo}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {p.paymentMode}
                      </span>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {p.transactionRef}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400 text-sm whitespace-nowrap">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {p.receivedBy}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onViewReceipt(p)}
                        title="View / Print Receipt Voucher"
                        className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
