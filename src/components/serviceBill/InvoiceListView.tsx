import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  CreditCard,
  Printer,
  Download,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { ServiceInvoice, UserRole, PaymentStatus } from '../../types';
import { formatCurrency, formatDate } from '../../services/numbering';
import { StatusBadge } from '../common/Badge';

interface InvoiceListViewProps {
  invoices: ServiceInvoice[];
  currentRole: UserRole;
  onNewInvoice: () => void;
  onViewInvoice: (invoice: ServiceInvoice) => void;
  onEditInvoice: (invoice: ServiceInvoice) => void;
  onRecordPayment: (invoice: ServiceInvoice) => void;
}

export const InvoiceListView: React.FC<InvoiceListViewProps> = ({
  invoices,
  currentRole,
  onNewInvoice,
  onViewInvoice,
  onEditInvoice,
  onRecordPayment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [approvalFilter, setApprovalFilter] = useState<string>('all');

  const filteredInvoices = invoices.filter((i) => {
    const matchesSearch =
      i.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.projectName && i.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (i.poNumber && i.poNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (i.linkedChallanNo && i.linkedChallanNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (i.linkedServiceReportNo && i.linkedServiceReportNo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    const matchesApproval = approvalFilter === 'all' || i.approvalStatus === approvalFilter;

    return matchesSearch && matchesStatus && matchesApproval;
  });

  const canCreate = currentRole === 'Admin' || currentRole === 'Accounts' || currentRole === 'Manager';
  const canRecordPayment = (inv: ServiceInvoice) =>
    (currentRole === 'Admin' || currentRole === 'Accounts' || currentRole === 'Manager') &&
    inv.balanceAmount > 0 &&
    inv.status !== 'Cancelled';

  // Overall metric totals
  const totalInvoiced = filteredInvoices.reduce((sum, i) => sum + (i.status !== 'Cancelled' ? i.grandTotal : 0), 0);
  const totalCollected = filteredInvoices.reduce((sum, i) => sum + (i.status !== 'Cancelled' ? i.amountPaid : 0), 0);
  const totalBalance = filteredInvoices.reduce((sum, i) => sum + (i.status !== 'Cancelled' ? i.balanceAmount : 0), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Service Bills & Invoices
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Module B
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            GST service tax invoices, state-based CGST/SGST/IGST automation, Challan & Service Report linked references
          </p>
        </div>

        {canCreate && (
          <button
            onClick={onNewInvoice}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            + New Service Bill
          </button>
        )}
      </div>

      {/* Financial Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Invoiced</div>
            <div className="text-lg font-bold font-mono text-white mt-0.5">{formatCurrency(totalInvoiced)}</div>
          </div>
          <Receipt className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">Total Collected</div>
            <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">{formatCurrency(totalCollected)}</div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-cyan-400" />
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-rose-400">Outstanding Balance</div>
            <div className="text-lg font-bold font-mono text-rose-400 mt-0.5">{formatCurrency(totalBalance)}</div>
          </div>
          <AlertTriangle className="w-5 h-5 text-rose-400" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search invoice no, customer, project, PO, linked DC/SR..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Payment Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Payment Statuses</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Approval Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Approvals</option>
              <option value="Approved">Approved</option>
              <option value="Draft">Draft</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Invoice Details</th>
                <th className="px-4 py-3">Customer & State</th>
                <th className="px-4 py-3">Project / PO Ref</th>
                <th className="px-4 py-3">Linked DC / SR</th>
                <th className="px-4 py-3 text-right">Taxable</th>
                <th className="px-4 py-3 text-right">GST Type</th>
                <th className="px-4 py-3 text-right">Grand Total</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    No service bills match the specified filters.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-850/60 transition-colors">
                    {/* Invoice No & Date */}
                    <td className="px-4 py-3">
                      <div
                        className="font-mono font-bold text-emerald-400 hover:underline cursor-pointer"
                        onClick={() => onViewInvoice(inv)}
                      >
                        {inv.invoiceNo}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 whitespace-nowrap">
                        {formatDate(inv.invoiceDate)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Due: {formatDate(inv.dueDate)}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-200 line-clamp-1">
                        {inv.customerName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {inv.customerState} ({inv.customerStateCode}) • GSTIN: {inv.customerGstin ? inv.customerGstin.substring(0, 8) + '...' : 'Unregistered'}
                      </div>
                    </td>

                    {/* Project & PO */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-300 line-clamp-1">
                        {inv.projectName || 'Direct Site Service'}
                      </div>
                      {inv.poNumber && (
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          PO: {inv.poNumber}
                        </div>
                      )}
                    </td>

                    {/* Linked DC / SR Traceability */}
                    <td className="px-4 py-3">
                      <div className="space-y-0.5 font-mono text-[10px]">
                        {inv.linkedChallanNo ? (
                          <div className="text-cyan-400">DC: {inv.linkedChallanNo}</div>
                        ) : null}
                        {inv.linkedServiceReportNo ? (
                          <div className="text-indigo-400">SR: {inv.linkedServiceReportNo}</div>
                        ) : null}
                        {!inv.linkedChallanNo && !inv.linkedServiceReportNo && (
                          <span className="text-slate-600">—</span>
                        )}
                      </div>
                    </td>

                    {/* Taxable Value */}
                    <td className="px-4 py-3 text-right font-mono text-slate-300">
                      {formatCurrency(inv.taxableValue)}
                    </td>

                    {/* GST Type & Rate */}
                    <td className="px-4 py-3 text-right">
                      <div className="font-mono text-[11px] font-medium text-slate-200">
                        {inv.isInterState ? (
                          <span className="text-purple-400">IGST ({inv.igstRate}%)</span>
                        ) : (
                          <span className="text-cyan-400">CGST+SGST ({inv.gstRate}%)</span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        +{formatCurrency(inv.totalTax)}
                      </div>
                    </td>

                    {/* Grand Total & Balance */}
                    <td className="px-4 py-3 text-right font-mono">
                      <div className="font-bold text-white text-xs whitespace-nowrap">
                        {formatCurrency(inv.grandTotal)}
                      </div>
                      {inv.balanceAmount > 0 && inv.status !== 'Cancelled' ? (
                        <div className="text-[10px] text-rose-400 font-medium whitespace-nowrap">
                          Bal: {formatCurrency(inv.balanceAmount)}
                        </div>
                      ) : (
                        <div className="text-[10px] text-emerald-400 whitespace-nowrap">
                          Settled
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={inv.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewInvoice(inv)}
                          title="Preview & Print A4 Tax Invoice"
                          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {inv.approvalStatus === 'Draft' && (
                          <button
                            onClick={() => onEditInvoice(inv)}
                            title="Edit Invoice"
                            className="p-1.5 rounded-md text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {canRecordPayment(inv) && (
                          <button
                            onClick={() => onRecordPayment(inv)}
                            title="Record Payment for this Invoice"
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] cursor-pointer shadow-xs transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> Pay
                          </button>
                        )}
                      </div>
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
