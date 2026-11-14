import React, { useState } from 'react';
import {
  AlertTriangle,
  CreditCard,
  Share2,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { ServiceInvoice, Customer, UserRole } from '../../types';
import { formatCurrency, formatDate } from '../../services/numbering';
import { generateWhatsAppLink } from '../../services/pdfExport';
import { StatusBadge } from '../common/Badge';

interface OutstandingViewProps {
  invoices: ServiceInvoice[];
  customers: Customer[];
  currentRole: UserRole;
  onRecordPayment: (invoice: ServiceInvoice) => void;
  onViewInvoice: (invoice: ServiceInvoice) => void;
}

export const OutstandingView: React.FC<OutstandingViewProps> = ({
  invoices,
  customers,
  currentRole,
  onRecordPayment,
  onViewInvoice,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('all');

  const unpaidInvoices = invoices.filter(
    (i) => i.balanceAmount > 0 && i.status !== 'Cancelled'
  );

  const filteredInvoices = unpaidInvoices.filter(
    (i) => selectedCustomerId === 'all' || i.customerId === selectedCustomerId
  );

  // Today reference for aging
  const today = new Date();

  // Aging calculation
  const getDaysOverdue = (dueDateStr: string): number => {
    try {
      const due = new Date(dueDateStr);
      const diffTime = today.getTime() - due.getTime();
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  const bucket0to30 = unpaidInvoices.filter((i) => {
    const days = getDaysOverdue(i.dueDate);
    return days <= 30;
  });
  const bucket31to60 = unpaidInvoices.filter((i) => {
    const days = getDaysOverdue(i.dueDate);
    return days > 30 && days <= 60;
  });
  const bucket60plus = unpaidInvoices.filter((i) => {
    const days = getDaysOverdue(i.dueDate);
    return days > 60;
  });

  const totalOutstanding = unpaidInvoices.reduce((sum, i) => sum + i.balanceAmount, 0);
  const total0to30 = bucket0to30.reduce((sum, i) => sum + i.balanceAmount, 0);
  const total31to60 = bucket31to60.reduce((sum, i) => sum + i.balanceAmount, 0);
  const total60plus = bucket60plus.reduce((sum, i) => sum + i.balanceAmount, 0);

  const handleSendReminder = (inv: ServiceInvoice) => {
    const message = `*PAYMENT REMINDER - VEYON AUTOMATION*\n\n` +
      `Dear ${inv.contactPerson || inv.customerName},\n` +
      `This is a gentle reminder regarding payment for Invoice *${inv.invoiceNo}* dated *${formatDate(inv.invoiceDate)}*.\n` +
      `Total Amount: ${formatCurrency(inv.grandTotal)}\n` +
      `Balance Due: *${formatCurrency(inv.balanceAmount)}*\n` +
      `Due Date: ${formatDate(inv.dueDate)}\n\n` +
      `Kindly arrange the RTGS/NEFT payment at your earliest convenience.\n` +
      `Thank you!`;
    const link = `https://wa.me/${inv.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(link, '_blank');
  };

  const canRecordPayment = currentRole === 'Admin' || currentRole === 'Accounts' || currentRole === 'Manager';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Receivables & Aging Analysis
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
              Module E & I
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Monitor client payment cycles, overdue invoices, and aging breakdown buckets
          </p>
        </div>

        {/* Customer Filter */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Customers</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Aging Bucket Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Outstanding */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-400">
            <span>Total Outstanding</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-2 font-mono">
            {formatCurrency(totalOutstanding)}
          </div>
          <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-800">
            Across {unpaidInvoices.length} unpaid / partial invoice(s)
          </div>
        </div>

        {/* 0-30 Days */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-emerald-400">
            <span>0 - 30 Days (Current)</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
            {formatCurrency(total0to30)}
          </div>
          <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-800">
            {bucket0to30.length} invoice(s) within normal credit period
          </div>
        </div>

        {/* 31-60 Days */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-amber-400">
            <span>31 - 60 Days</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2 font-mono">
            {formatCurrency(total31to60)}
          </div>
          <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-800">
            {bucket31to60.length} invoice(s) approaching overdue
          </div>
        </div>

        {/* 60+ Days Overdue */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-rose-500">
            <span>&gt; 60 Days (Critical)</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-rose-500 mt-2 font-mono">
            {formatCurrency(total60plus)}
          </div>
          <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-800">
            {bucket60plus.length} invoice(s) overdue
          </div>
        </div>
      </div>

      {/* Outstanding Invoices Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-semibold text-white">Pending Invoice Receivables List</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Showing {filteredInvoices.length} invoices
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Invoice No</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Invoice Date</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3 text-right">Invoiced Amount</th>
                <th className="px-4 py-3 text-right">Amount Paid</th>
                <th className="px-4 py-3 text-right">Balance Due</th>
                <th className="px-4 py-3 text-center">Aging Days</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-emerald-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-80" />
                    All invoices are fully settled! Zero outstanding.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const days = getDaysOverdue(inv.dueDate);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-850/60 transition-colors">
                      <td
                        className="px-4 py-3 font-mono font-bold text-emerald-400 hover:underline cursor-pointer"
                        onClick={() => onViewInvoice(inv)}
                      >
                        {inv.invoiceNo}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white line-clamp-1">
                          {inv.customerName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {inv.contactPerson} ({inv.phone})
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {formatDate(inv.invoiceDate)}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300 whitespace-nowrap">
                        {formatDate(inv.dueDate)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-300">
                        {formatCurrency(inv.grandTotal)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-cyan-400">
                        {formatCurrency(inv.amountPaid)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-rose-400 text-sm whitespace-nowrap">
                        {formatCurrency(inv.balanceAmount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                            days > 60
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : days > 30
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}
                        >
                          {days > 0 ? `${days}d overdue` : `${Math.abs(days)}d left`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSendReminder(inv)}
                            title="Send WhatsApp Payment Reminder"
                            className="p-1.5 rounded-md text-emerald-400 hover:text-white hover:bg-emerald-950/60 transition-colors cursor-pointer"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          {canRecordPayment && (
                            <button
                              onClick={() => onRecordPayment(inv)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-xs"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Pay
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
