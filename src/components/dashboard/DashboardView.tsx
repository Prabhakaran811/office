import React from 'react';
import {
  Truck,
  Receipt,
  CreditCard,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  FolderGit2,
  ExternalLink,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import {
  DeliveryChallan,
  ServiceInvoice,
  ServiceReport,
  PaymentReceipt,
  Customer,
  Project,
  UserRole,
} from '../../types';
import { formatCurrency, formatDate } from '../../services/numbering';
import { StatusBadge } from '../common/Badge';

interface DashboardViewProps {
  challans: DeliveryChallan[];
  invoices: ServiceInvoice[];
  reports: ServiceReport[];
  payments: PaymentReceipt[];
  customers: Customer[];
  projects: Project[];
  currentRole: UserRole;
  onNavigate: (tab: any) => void;
  onNewChallan: () => void;
  onNewReport: () => void;
  onNewInvoice: () => void;
  onNewPayment: () => void;
  onViewChallan: (c: DeliveryChallan) => void;
  onViewInvoice: (inv: ServiceInvoice) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  challans,
  invoices,
  reports,
  payments,
  customers,
  projects,
  currentRole,
  onNavigate,
  onNewChallan,
  onNewReport,
  onNewInvoice,
  onNewPayment,
  onViewChallan,
  onViewInvoice,
}) => {
  // Challan Metrics
  const totalChallans = challans.length;
  const draftChallans = challans.filter((c) => c.status === 'Draft').length;
  const dispatchedChallans = challans.filter((c) => c.status === 'Dispatched').length;
  const deliveredChallans = challans.filter((c) => c.status === 'Delivered').length;
  const returnedChallans = challans.filter((c) => c.status === 'Returned').length;
  const pendingDelivery = challans.filter(
    (c) => c.status === 'Approved' || c.status === 'Dispatched'
  ).length;

  // Billing Metrics
  const activeInvoices = invoices.filter((i) => i.status !== 'Cancelled');
  const totalInvoices = activeInvoices.length;
  const totalBilling = activeInvoices.reduce((acc, curr) => acc + curr.grandTotal, 0);
  const paidAmount = activeInvoices.reduce((acc, curr) => acc + curr.amountPaid, 0);
  const pendingAmount = activeInvoices.reduce((acc, curr) => acc + curr.balanceAmount, 0);

  // Overdue calculation (due date before today and balance > 0)
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueAmount = activeInvoices
    .filter((i) => i.balanceAmount > 0 && i.dueDate && i.dueDate < todayStr)
    .reduce((acc, curr) => acc + curr.balanceAmount, 0);

  // Current Month Billing
  const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM
  const currentMonthBilling = activeInvoices
    .filter((i) => i.invoiceDate && i.invoiceDate.startsWith(currentMonthStr))
    .reduce((acc, curr) => acc + curr.grandTotal, 0);

  const recentChallans = [...challans].sort((a, b) => b.challanDate.localeCompare(a.challanDate)).slice(0, 5);
  const recentInvoices = [...invoices].sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate)).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                Industrial Automation ERP • Operations Control
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Logged in as: <strong className="text-white">{currentRole}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
              Delivery Challan & Service Billing Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Track dispatches, field commissioning reports, GST tax invoices, and customer receivables with end-to-end audit traceability.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {(currentRole === 'Admin' || currentRole === 'Engineer' || currentRole === 'Manager') && (
              <button
                onClick={onNewChallan}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                + New Delivery Challan
              </button>
            )}

            {(currentRole === 'Admin' || currentRole === 'Engineer' || currentRole === 'Manager') && (
              <button
                onClick={onNewReport}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                + New Service Report
              </button>
            )}

            {(currentRole === 'Admin' || currentRole === 'Accounts' || currentRole === 'Manager') && (
              <button
                onClick={onNewInvoice}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                + New Service Bill
              </button>
            )}

            {(currentRole === 'Admin' || currentRole === 'Accounts' || currentRole === 'Manager') && (
              <button
                onClick={onNewPayment}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                Record Payment
              </button>
            )}
          </div>
        </div>

        {/* Quick Navigate Strip */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span className="text-slate-500 font-mono">Jump to:</span>
          <button
            onClick={() => onNavigate('customers')}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer bg-slate-800/60 px-2.5 py-1 rounded"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" /> View Customers ({customers.length})
          </button>
          <button
            onClick={() => onNavigate('projects')}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer bg-slate-800/60 px-2.5 py-1 rounded"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" /> View Projects ({projects.length})
          </button>
          <button
            onClick={() => onNavigate('outstanding')}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer bg-slate-800/60 px-2.5 py-1 rounded"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> View Outstanding ({formatCurrency(pendingAmount)})
          </button>
          <button
            onClick={() => onNavigate('analytics')}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer bg-slate-800/60 px-2.5 py-1 rounded"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Customer Ledgers
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Billing */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Total Billing (FY 26-27)</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-3 font-mono">
            {formatCurrency(totalBilling)}
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>{totalInvoices} Invoices Issued</span>
            <span className="text-emerald-400 font-medium">Month: {formatCurrency(currentMonthBilling)}</span>
          </div>
        </div>

        {/* Paid / Realized */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Amount Collected</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-3 font-mono text-cyan-400">
            {formatCurrency(paidAmount)}
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Collection Rate</span>
            <span className="text-white font-semibold">
              {totalBilling > 0 ? Math.round((paidAmount / totalBilling) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Pending & Overdue */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Pending Receivables</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-3 font-mono">
            {formatCurrency(pendingAmount)}
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Overdue Amount</span>
            <span className="text-rose-400 font-semibold">{formatCurrency(overdueAmount)}</span>
          </div>
        </div>

        {/* Delivery Challans */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Delivery Challans</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-3 font-mono">
            {totalChallans} <span className="text-xs font-sans text-slate-400 font-normal">challans</span>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Pending Delivery</span>
            <span className="text-amber-400 font-semibold">{pendingDelivery} in transit</span>
          </div>
        </div>
      </div>

      {/* MODULE E DETAILED STATS BARS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Challan Status Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-semibold text-white">Delivery Challan Pipeline</h2>
            </div>
            <button
              onClick={() => onNavigate('challans')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Draft</div>
              <div className="text-xl font-bold text-slate-200 mt-1">{draftChallans}</div>
            </div>
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 text-center">
              <div className="text-xs text-amber-400">Dispatched</div>
              <div className="text-xl font-bold text-amber-400 mt-1">{dispatchedChallans}</div>
            </div>
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 text-center">
              <div className="text-xs text-emerald-400">Delivered</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">{deliveredChallans}</div>
            </div>
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 text-center">
              <div className="text-xs text-cyan-400">Returned</div>
              <div className="text-xl font-bold text-cyan-400 mt-1">{returnedChallans}</div>
            </div>
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 text-center col-span-3 sm:col-span-1">
              <div className="text-xs text-rose-400">Pending Delivery</div>
              <div className="text-xl font-bold text-rose-400 mt-1">{pendingDelivery}</div>
            </div>
          </div>

          {/* Workflow guide note */}
          <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Rule 8:</strong> Delivery Challans track materials & equipment movement without creating revenue accounting entries until invoiced.
            </span>
          </div>
        </div>

        {/* Industrial Traceability Workflow Diagram */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-semibold text-white">Industrial Automation Lifecycle</h2>
            </div>
            <span className="text-xs font-mono text-slate-400">Module D Traceability</span>
          </div>

          <div className="flex items-center justify-between gap-1 overflow-x-auto py-3 text-center">
            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 min-w-[90px]">
              <Truck className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <div className="text-[11px] font-semibold text-white">1. Challan</div>
              <div className="text-[9px] text-slate-400 font-mono">DC/...</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 min-w-[90px]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <div className="text-[11px] font-semibold text-white">2. Delivery</div>
              <div className="text-[9px] text-slate-400">Site Stores</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 min-w-[90px]">
              <Clock className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
              <div className="text-[11px] font-semibold text-white">3. Report</div>
              <div className="text-[9px] text-slate-400 font-mono">SR/...</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 min-w-[90px]">
              <Receipt className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <div className="text-[11px] font-semibold text-white">4. Invoice</div>
              <div className="text-[9px] text-slate-400 font-mono">INV/...</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 min-w-[90px]">
              <CreditCard className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <div className="text-[11px] font-semibold text-white">5. Receipt</div>
              <div className="text-[9px] text-slate-400 font-mono">REC/...</div>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Linked Documents Active:</span>
            <span className="font-mono text-amber-400 font-semibold">
              {reports.filter((r) => r.linkedChallanId).length} SR linked to DC • {invoices.filter((i) => i.linkedServiceReportId).length} Bills linked to SR
            </span>
          </div>
        </div>
      </div>

      {/* RECENT CHALLANS & SERVICE BILLS TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Delivery Challans */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Recent Delivery Challans</h3>
            </div>
            <button
              onClick={() => onNavigate('challans')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
            >
              View all ({challans.length})
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-2.5">Challan No</th>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Customer / Project</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Items</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentChallans.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => onViewChallan(c)}
                    className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-amber-400">
                      {c.challanNo}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {formatDate(c.challanDate)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-200 line-clamp-1">{c.customerName}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{c.projectName || c.purposeOfDelivery}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300">
                      {c.items.length} ({c.totalQty} {c.items[0]?.unit || 'Nos'})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Service Bills */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Recent Service Bills</h3>
            </div>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
            >
              View all ({invoices.length})
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-2.5">Invoice No</th>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Customer</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                  <th className="px-4 py-2.5 text-right">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => onViewInvoice(inv)}
                    className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-emerald-400">
                      {inv.invoiceNo}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {formatDate(inv.invoiceDate)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-200 line-clamp-1">{inv.customerName}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">
                        {inv.isInterState ? 'Inter-state IGST' : 'Intra-state CGST+SGST'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-white whitespace-nowrap">
                      {formatCurrency(inv.grandTotal)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <StatusBadge status={inv.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
