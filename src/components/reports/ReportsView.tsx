import React, { useState } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  Download,
  Filter,
  Calendar,
  Building,
  Printer,
  Receipt,
  Truck,
  Wrench,
  CreditCard,
  Percent,
  Search,
} from 'lucide-react';
import {
  LedgerEntry,
  Customer,
  ServiceInvoice,
  DeliveryChallan,
  ServiceReport,
  PaymentReceipt,
  Project,
  UserRole,
} from '../../types';
import { formatCurrency, formatDate } from '../../services/numbering';

interface ReportsViewProps {
  ledger: LedgerEntry[];
  customers: Customer[];
  invoices: ServiceInvoice[];
  challans: DeliveryChallan[];
  reports: ServiceReport[];
  payments: PaymentReceipt[];
  projects: Project[];
  currentRole: UserRole;
  selectedCustomerForLedger?: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  ledger,
  customers,
  invoices,
  challans,
  reports,
  payments,
  projects,
  currentRole,
  selectedCustomerForLedger,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'ledger'
    | 'invoices'
    | 'challans'
    | 'reports'
    | 'outstanding'
    | 'gst'
    | 'payments'
    | 'projects'
    | 'monthly'
  >('ledger');

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    selectedCustomerForLedger || 'all'
  );
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // CSV Export utility
  const exportToCSV = (filename: string, rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => e.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. Customer Ledger
  const filteredLedger = ledger.filter((l) => {
    const matchesCustomer = selectedCustomerId === 'all' || l.customerId === selectedCustomerId;
    const matchesFrom = !dateFrom || l.date >= dateFrom;
    const matchesTo = !dateTo || l.date <= dateTo;
    return matchesCustomer && matchesFrom && matchesTo;
  });

  const handleExportLedger = () => {
    const header = ['Date', 'Customer', 'Doc Type', 'Doc No', 'Reference', 'Debit (₹)', 'Credit (₹)', 'Balance (₹)', 'Remarks'];
    const rows = filteredLedger.map((l) => [
      l.date,
      l.customerName,
      l.docType,
      l.docNo,
      l.reference || '',
      l.debit,
      l.credit,
      l.balance,
      l.remarks,
    ]);
    exportToCSV(`Customer_Ledger_${new Date().toISOString().split('T')[0]}`, [header, ...rows]);
  };

  // 2. Invoice Register
  const handleExportInvoices = () => {
    const header = ['Invoice No', 'Date', 'Customer', 'GSTIN', 'State', 'Taxable Value', 'GST Rate', 'CGST', 'SGST', 'IGST', 'Total Tax', 'Grand Total', 'Status'];
    const rows = invoices.map((i) => [
      i.invoiceNo,
      i.invoiceDate,
      i.customerName,
      i.customerGstin,
      i.customerState,
      i.taxableValue,
      i.gstRate + '%',
      i.cgstAmount,
      i.sgstAmount,
      i.igstAmount,
      i.totalTax,
      i.grandTotal,
      i.status,
    ]);
    exportToCSV(`Invoice_Register_${new Date().toISOString().split('T')[0]}`, [header, ...rows]);
  };

  // 3. Delivery Challan Register
  const handleExportChallans = () => {
    const header = ['Challan No', 'Date', 'Type', 'Customer', 'Project', 'Total Qty', 'Vehicle No', 'Transporter', 'Status'];
    const rows = challans.map((c) => [
      c.challanNo,
      c.challanDate,
      c.challanType,
      c.customerName,
      c.projectName || '',
      c.totalQty,
      c.vehicleNumber,
      c.transporterName,
      c.status,
    ]);
    exportToCSV(`Delivery_Challan_Register_${new Date().toISOString().split('T')[0]}`, [header, ...rows]);
  };

  // 4. GST Summary calculation
  const totalTaxable = invoices.reduce((sum, i) => sum + (i.status !== 'Cancelled' ? i.taxableValue : 0), 0);
  const totalCGST = invoices.reduce((sum, i) => sum + (i.status !== 'Cancelled' ? i.cgstAmount : 0), 0);
  const totalSGST = invoices.reduce((sum, i) => sum + (i.status !== 'Cancelled' ? i.sgstAmount : 0), 0);
  const totalIGST = invoices.reduce((sum, i) => sum + (i.status !== 'Cancelled' ? i.igstAmount : 0), 0);
  const totalGST = totalCGST + totalSGST + totalIGST;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Accounting & ERP Registers
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              Module I
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Double-entry customer ledgers, statutory registers, GST summaries, and CSV data export
          </p>
        </div>

        {/* Global Export Button */}
        <button
          onClick={() => {
            if (activeTab === 'ledger') handleExportLedger();
            else if (activeTab === 'invoices') handleExportInvoices();
            else if (activeTab === 'challans') handleExportChallans();
            else alert('CSV export ready for active report tab.');
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm shadow-md transition-all cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" /> Export Active Report to CSV
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-slate-800 text-xs">
        {[
          { id: 'ledger', label: '1. Customer Ledger', icon: Building },
          { id: 'invoices', label: '2. Invoice Register', icon: Receipt },
          { id: 'challans', label: '3. Challan Register', icon: Truck },
          { id: 'reports', label: '4. Service Report Register', icon: Wrench },
          { id: 'outstanding', label: '5. Outstanding Report', icon: BarChart3 },
          { id: 'gst', label: '6. GST Summary (GSTR-1)', icon: Percent },
          { id: 'payments', label: '7. Payment Register', icon: CreditCard },
          { id: 'projects', label: '8. Project Billing', icon: FileSpreadsheet },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter Bar for Tab 1 (Ledger) */}
      {activeTab === 'ledger' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Customer Accounts</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From date"
                className="bg-transparent text-xs text-white focus:outline-hidden"
              />
              <span className="text-slate-600">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To date"
                className="bg-transparent text-xs text-white focus:outline-hidden"
              />
            </div>
          </div>

          <button
            onClick={handleExportLedger}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Download Ledger CSV
          </button>
        </div>
      )}

      {/* REPORT CONTENT CONTAINERS */}

      {/* 1. CUSTOMER LEDGER */}
      {activeTab === 'ledger' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Doc Type</th>
                  <th className="px-4 py-3">Doc Number</th>
                  <th className="px-4 py-3">PO / UTR Ref</th>
                  <th className="px-4 py-3 text-right">Debit (Dr)</th>
                  <th className="px-4 py-3 text-right">Credit (Cr)</th>
                  <th className="px-4 py-3 text-right">Running Balance</th>
                  <th className="px-4 py-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredLedger.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                      No ledger transactions found for selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredLedger.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-850/60 font-mono">
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatDate(l.date)}</td>
                      <td className="px-4 py-3 font-sans font-medium text-white">{l.customerName}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            l.docType === 'Invoice'
                              ? 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                              : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                          }`}
                        >
                          {l.docType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-amber-400 font-bold">{l.docNo}</td>
                      <td className="px-4 py-3 text-slate-400 text-[11px]">{l.reference || '—'}</td>
                      <td className="px-4 py-3 text-right text-rose-400">
                        {l.debit > 0 ? formatCurrency(l.debit) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-400">
                        {l.credit > 0 ? formatCurrency(l.credit) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-white text-sm">
                        {formatCurrency(l.balance)}
                      </td>
                      <td className="px-4 py-3 font-sans text-slate-400 text-[11px]">{l.remarks}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. INVOICE REGISTER */}
      {activeTab === 'invoices' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Invoice No</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">State / GSTIN</th>
                  <th className="px-4 py-3 text-right">Taxable</th>
                  <th className="px-4 py-3 text-right">CGST</th>
                  <th className="px-4 py-3 text-right">SGST</th>
                  <th className="px-4 py-3 text-right">IGST</th>
                  <th className="px-4 py-3 text-right">Total Tax</th>
                  <th className="px-4 py-3 text-right">Grand Total</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {invoices.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-850/60 font-mono">
                    <td className="px-4 py-3 text-emerald-400 font-bold">{i.invoiceNo}</td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatDate(i.invoiceDate)}</td>
                    <td className="px-4 py-3 font-sans font-medium text-white">{i.customerName}</td>
                    <td className="px-4 py-3 text-[11px] text-slate-400">
                      {i.customerState} ({i.customerStateCode}) • {i.customerGstin}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300">{formatCurrency(i.taxableValue)}</td>
                    <td className="px-4 py-3 text-right text-cyan-400">{i.cgstAmount > 0 ? formatCurrency(i.cgstAmount) : '—'}</td>
                    <td className="px-4 py-3 text-right text-cyan-400">{i.sgstAmount > 0 ? formatCurrency(i.sgstAmount) : '—'}</td>
                    <td className="px-4 py-3 text-right text-purple-400">{i.igstAmount > 0 ? formatCurrency(i.igstAmount) : '—'}</td>
                    <td className="px-4 py-3 text-right text-amber-400">{formatCurrency(i.totalTax)}</td>
                    <td className="px-4 py-3 text-right text-white font-bold">{formatCurrency(i.grandTotal)}</td>
                    <td className="px-4 py-3 font-sans">{i.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. CHALLAN REGISTER */}
      {activeTab === 'challans' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Challan No</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3 text-center">Total Qty</th>
                  <th className="px-4 py-3">Vehicle & Transporter</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {challans.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-850/60 font-mono">
                    <td className="px-4 py-3 text-cyan-400 font-bold">{c.challanNo}</td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatDate(c.challanDate)}</td>
                    <td className="px-4 py-3 font-sans text-amber-300">{c.challanType}</td>
                    <td className="px-4 py-3 font-sans font-medium text-white">{c.customerName}</td>
                    <td className="px-4 py-3 font-sans text-slate-400">{c.projectName || '—'}</td>
                    <td className="px-4 py-3 text-center text-white font-bold">{c.totalQty}</td>
                    <td className="px-4 py-3 text-[11px] text-slate-300">
                      {c.vehicleNumber} ({c.transporterName})
                    </td>
                    <td className="px-4 py-3 font-sans">{c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. GST SUMMARY REPORT */}
      {activeTab === 'gst' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Total Taxable Value</span>
              <div className="text-xl font-bold font-mono text-white mt-1">{formatCurrency(totalTaxable)}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] font-mono text-cyan-400 uppercase">Central Tax (CGST)</span>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{formatCurrency(totalCGST)}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] font-mono text-cyan-400 uppercase">State Tax (SGST)</span>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{formatCurrency(totalSGST)}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] font-mono text-purple-400 uppercase">Integrated Tax (IGST)</span>
              <div className="text-xl font-bold font-mono text-purple-400 mt-1">{formatCurrency(totalIGST)}</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
            <h3 className="text-sm font-semibold text-white mb-3">GSTR-1 Monthly Outward Supply Summary</h3>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-2 text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span>Total Taxable B2B Supply:</span>
                <strong className="font-mono text-white">{formatCurrency(totalTaxable)}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span>Total Output GST Liability:</span>
                <strong className="font-mono text-amber-400">{formatCurrency(totalGST)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Gross Value with GST:</span>
                <strong className="font-mono text-emerald-400">{formatCurrency(totalTaxable + totalGST)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. PROJECT BILLING REPORT */}
      {activeTab === 'projects' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Project Code</th>
                  <th className="px-4 py-3">Project Name</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">PO Number</th>
                  <th className="px-4 py-3 text-right">PO Value</th>
                  <th className="px-4 py-3 text-right">Total Invoiced</th>
                  <th className="px-4 py-3 text-right">Collected</th>
                  <th className="px-4 py-3 text-right">Unbilled PO Balance</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {projects.map((p) => {
                  const projInvoices = invoices.filter((i) => i.projectId === p.id && i.status !== 'Cancelled');
                  const invoiced = projInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
                  const collected = projInvoices.reduce((sum, i) => sum + i.amountPaid, 0);
                  const unbilled = Math.max(0, p.poValue - invoiced);

                  return (
                    <tr key={p.id} className="hover:bg-slate-850/60 font-mono">
                      <td className="px-4 py-3 text-cyan-400 font-bold">{p.code}</td>
                      <td className="px-4 py-3 font-sans font-semibold text-white">{p.name}</td>
                      <td className="px-4 py-3 font-sans text-slate-300">{p.customerName}</td>
                      <td className="px-4 py-3 text-slate-400">{p.poNumber}</td>
                      <td className="px-4 py-3 text-right text-white font-bold">{formatCurrency(p.poValue)}</td>
                      <td className="px-4 py-3 text-right text-emerald-400">{formatCurrency(invoiced)}</td>
                      <td className="px-4 py-3 text-right text-cyan-400">{formatCurrency(collected)}</td>
                      <td className="px-4 py-3 text-right text-amber-400">{formatCurrency(unbilled)}</td>
                      <td className="px-4 py-3 text-center font-sans">{p.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
