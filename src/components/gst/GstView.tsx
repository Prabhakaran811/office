import React from 'react';
import {
  Percent,
  FileCheck,
  Building,
  TrendingUp,
  Download,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { ServiceInvoice, CompanyProfile } from '../../types';
import { formatCurrency } from '../../services/numbering';

interface GstViewProps {
  invoices: ServiceInvoice[];
  company: CompanyProfile;
}

export const GstView: React.FC<GstViewProps> = ({ invoices, company }) => {
  const activeInvoices = invoices.filter((i) => i.status !== 'Cancelled');

  const intraStateInvoices = activeInvoices.filter((i) => !i.isInterState);
  const interStateInvoices = activeInvoices.filter((i) => i.isInterState);

  const taxableIntra = intraStateInvoices.reduce((s, i) => s + i.taxableValue, 0);
  const cgstIntra = intraStateInvoices.reduce((s, i) => s + i.cgstAmount, 0);
  const sgstIntra = intraStateInvoices.reduce((s, i) => s + i.sgstAmount, 0);

  const taxableInter = interStateInvoices.reduce((s, i) => s + i.taxableValue, 0);
  const igstInter = interStateInvoices.reduce((s, i) => s + i.igstAmount, 0);

  const totalTaxable = taxableIntra + taxableInter;
  const totalTaxLiability = cgstIntra + sgstIntra + igstInter;

  // SAC code breakdown
  interface SacSummary {
    sacCode: string;
    description: string;
    taxableAmount: number;
    taxAmount: number;
  }

  const sacMap = new Map<string, SacSummary>();

  activeInvoices.forEach((inv) => {
    inv.items.forEach((item) => {
      const code = item.sacCode || '998313';
      const existing = sacMap.get(code) || {
        sacCode: code,
        description: item.serviceDescription,
        taxableAmount: 0,
        taxAmount: 0,
      };
      existing.taxableAmount += item.amount;
      existing.taxAmount += (item.amount * (inv.gstRate || 18)) / 100;
      sacMap.set(code, existing);
    });
  });

  const sacList = Array.from(sacMap.values());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              GST Tax Compliance & GSTR-1 Portal
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Statutory
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Automatic state-based GST classification, SAC code summary, and e-filing readiness
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
          Supplier GSTIN: <strong className="text-amber-400">{company.gstin}</strong> ({company.stateCode} - {company.state})
        </div>
      </div>

      {/* Tax Liability Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
          <span className="text-[10px] font-mono uppercase text-slate-400">Total Taxable Turnover</span>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            {formatCurrency(totalTaxable)}
          </div>
          <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-800">
            {activeInvoices.length} Registered B2B Invoices
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
          <span className="text-[10px] font-mono uppercase text-cyan-400">CGST (Central Tax)</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-2">
            {formatCurrency(cgstIntra)}
          </div>
          <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-800">
            Intra-State: Gujarat State (Code: 24)
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
          <span className="text-[10px] font-mono uppercase text-cyan-400">SGST (State Tax)</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-2">
            {formatCurrency(sgstIntra)}
          </div>
          <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-800">
            Intra-State: Gujarat State (Code: 24)
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
          <span className="text-[10px] font-mono uppercase text-purple-400">IGST (Integrated Tax)</span>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-2">
            {formatCurrency(igstInter)}
          </div>
          <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-800">
            Inter-State Supplies (Maharashtra, Tamil Nadu, etc.)
          </div>
        </div>
      </div>

      {/* Intra-State vs Inter-State Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Intra-state table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              Intra-State Supplies (CGST + SGST)
            </h3>
            <span className="text-xs font-mono text-cyan-400">{intraStateInvoices.length} Invoices</span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Taxable Value:</span>
              <span className="text-white font-bold">{formatCurrency(taxableIntra)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Central Tax (CGST 9%):</span>
              <span className="text-cyan-400">{formatCurrency(cgstIntra)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>State Tax (SGST 9%):</span>
              <span className="text-cyan-400">{formatCurrency(sgstIntra)}</span>
            </div>
            <div className="flex justify-between text-slate-200 pt-2 border-t border-slate-800 font-bold">
              <span>Total Intra-State Tax:</span>
              <span className="text-white">{formatCurrency(cgstIntra + sgstIntra)}</span>
            </div>
          </div>
        </div>

        {/* Inter-state table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              Inter-State Supplies (IGST)
            </h3>
            <span className="text-xs font-mono text-purple-400">{interStateInvoices.length} Invoices</span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Taxable Value:</span>
              <span className="text-white font-bold">{formatCurrency(taxableInter)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Integrated Tax (IGST 18%):</span>
              <span className="text-purple-400">{formatCurrency(igstInter)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Destination States:</span>
              <span className="text-slate-300">Maharashtra (27), Tamil Nadu (33)</span>
            </div>
            <div className="flex justify-between text-slate-200 pt-2 border-t border-slate-800 font-bold">
              <span>Total Inter-State Tax:</span>
              <span className="text-white">{formatCurrency(igstInter)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SAC Code Summary Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">HSN / SAC Code Summary (GSTR-1 Table 12)</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Services Accounting Code</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">SAC Code</th>
                <th className="px-4 py-3">Service Description</th>
                <th className="px-4 py-3 text-right">Taxable Value</th>
                <th className="px-4 py-3 text-right">Integrated Tax (IGST)</th>
                <th className="px-4 py-3 text-right">Central Tax (CGST)</th>
                <th className="px-4 py-3 text-right">State Tax (SGST)</th>
                <th className="px-4 py-3 text-right">Total Tax Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sacList.map((sac, idx) => (
                <tr key={idx} className="hover:bg-slate-850/60 font-mono">
                  <td className="px-4 py-3 text-amber-400 font-bold">{sac.sacCode}</td>
                  <td className="px-4 py-3 font-sans text-white">{sac.description}</td>
                  <td className="px-4 py-3 text-right text-slate-200 font-bold">{formatCurrency(sac.taxableAmount)}</td>
                  <td className="px-4 py-3 text-right text-purple-400">{formatCurrency(sac.taxAmount * 0.4)}</td>
                  <td className="px-4 py-3 text-right text-cyan-400">{formatCurrency(sac.taxAmount * 0.3)}</td>
                  <td className="px-4 py-3 text-right text-cyan-400">{formatCurrency(sac.taxAmount * 0.3)}</td>
                  <td className="px-4 py-3 text-right text-emerald-400 font-bold">{formatCurrency(sac.taxAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
