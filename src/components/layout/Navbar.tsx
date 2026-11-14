import React, { useState } from 'react';
import {
  Cpu,
  Shield,
  Plus,
  FileText,
  Truck,
  Wrench,
  CreditCard,
  ChevronDown,
  RefreshCw,
  Building,
} from 'lucide-react';
import { UserRole, CompanyProfile } from '../../types';

interface NavbarProps {
  company: CompanyProfile;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onNewChallan: () => void;
  onNewReport: () => void;
  onNewInvoice: () => void;
  onNewPayment: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  company,
  currentRole,
  onRoleChange,
  onNewChallan,
  onNewReport,
  onNewInvoice,
  onNewPayment,
  onResetData,
}) => {
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roles: { role: UserRole; desc: string; badge: string }[] = [
    { role: 'Admin', desc: 'Full Enterprise Access', badge: 'bg-indigo-500/20 text-indigo-300' },
    { role: 'Manager', desc: 'Approvals, Billing & Analytics', badge: 'bg-emerald-500/20 text-emerald-300' },
    { role: 'Accounts', desc: 'Service Bills, Payments & Ledger', badge: 'bg-amber-500/20 text-amber-300' },
    { role: 'Engineer', desc: 'Delivery Challans & Service Reports', badge: 'bg-cyan-500/20 text-cyan-300' },
    { role: 'Viewer', desc: 'Read-only Inspection Mode', badge: 'bg-slate-500/20 text-slate-300' },
  ];

  return (
    <header className="no-print h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Brand & Company */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/40">
          <Cpu className="w-6 h-6 text-slate-950 font-bold" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-wide text-white font-mono">
              {company.name || 'VEYON AUTOMATION'}
            </span>
            <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              FY 2026-27
            </span>
            <span className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700">
              GSTIN: {company.gstin}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
            Industrial Automation Delivery Challan & Service Billing ERP
          </p>
        </div>
      </div>

      {/* Actions & Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick + Action Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">New Document</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {showQuickMenu && (
            <div
              className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              onClick={() => setShowQuickMenu(false)}
            >
              <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 mb-1">
                Create New Document
              </div>
              <button
                onClick={onNewChallan}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800 text-xs text-left cursor-pointer transition-colors"
              >
                <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium">Delivery Challan</div>
                  <div className="text-[10px] text-slate-400">Dispatch / Site Delivery</div>
                </div>
              </button>
              <button
                onClick={onNewReport}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800 text-xs text-left cursor-pointer transition-colors"
              >
                <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium">Service Report</div>
                  <div className="text-[10px] text-slate-400">Engineer Site Visit Log</div>
                </div>
              </button>
              <button
                onClick={onNewInvoice}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800 text-xs text-left cursor-pointer transition-colors"
              >
                <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium">Service Bill / Invoice</div>
                  <div className="text-[10px] text-slate-400">GST Service Tax Invoice</div>
                </div>
              </button>
              <button
                onClick={onNewPayment}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800 text-xs text-left cursor-pointer transition-colors border-t border-slate-800 mt-1 pt-2"
              >
                <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium">Record Payment</div>
                  <div className="text-[10px] text-slate-400">Bank / Cheque / NEFT receipt</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* User Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 cursor-pointer transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <div className="text-left hidden md:block">
              <span className="text-[10px] text-slate-400 block leading-none">Role</span>
              <span className="font-semibold text-white">{currentRole}</span>
            </div>
            <span className="md:hidden font-semibold text-white">{currentRole}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div
              className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              onClick={() => setShowRoleMenu(false)}
            >
              <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 mb-1 flex items-center justify-between">
                <span>Switch ERP User Role</span>
                <span className="text-[10px] lowercase text-amber-400">Module J</span>
              </div>
              {roles.map((r) => (
                <button
                  key={r.role}
                  onClick={() => onRoleChange(r.role)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                    currentRole === r.role
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-semibold flex items-center gap-1.5">
                      {r.role}
                      {currentRole === r.role && (
                        <span className="text-[9px] px-1 py-0.2 bg-amber-500 text-slate-950 font-bold rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">{r.desc}</div>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${r.badge}`}>
                    {r.role}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset Demo Data Button */}
        <button
          onClick={onResetData}
          title="Reset to fresh sample industrial data"
          className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
