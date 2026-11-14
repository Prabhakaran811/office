import React, { useState } from 'react';
import {
  Settings,
  Building,
  Hash,
  Save,
  RotateCcw,
  Download,
  Upload,
  CheckCircle,
  Shield,
  CreditCard,
  FileText,
} from 'lucide-react';
import { CompanyProfile, NumberingConfig, UserRole } from '../../types';
import { INDIAN_STATES } from '../../constants/presets';

interface SettingsViewProps {
  company: CompanyProfile;
  numbering: NumberingConfig;
  currentRole: UserRole;
  onSaveCompany: (company: CompanyProfile) => void;
  onSaveNumbering: (numbering: NumberingConfig) => void;
  onResetAllData: () => void;
  onExportBackup: () => void;
  onImportBackup: (jsonStr: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  company,
  numbering,
  currentRole,
  onSaveCompany,
  onSaveNumbering,
  onResetAllData,
  onExportBackup,
  onImportBackup,
}) => {
  // Company state
  const [name, setName] = useState(company.name);
  const [logoUrl, setLogoUrl] = useState(company.logoUrl);
  const [address, setAddress] = useState(company.address);
  const [gstin, setGstin] = useState(company.gstin);
  const [pan, setPan] = useState(company.pan);
  const [phone, setPhone] = useState(company.phone);
  const [email, setEmail] = useState(company.email);
  const [website, setWebsite] = useState(company.website);
  const [state, setState] = useState(company.state);
  const [stateCode, setStateCode] = useState(company.stateCode);

  const [bankName, setBankName] = useState(company.bankName);
  const [accountNumber, setAccountNumber] = useState(company.accountNumber);
  const [ifscCode, setIfscCode] = useState(company.ifscCode);
  const [branch, setBranch] = useState(company.branch);
  const [authorizedSignatory, setAuthorizedSignatory] = useState(company.authorizedSignatory);
  const [signatoryDesignation, setSignatoryDesignation] = useState(company.signatoryDesignation);

  // Numbering state
  const [fy, setFy] = useState(numbering.fy);
  const [challanPrefix, setChallanPrefix] = useState(numbering.challanPrefix);
  const [challanNextNum, setChallanNextNum] = useState(numbering.challanNextNum);
  const [invoicePrefix, setInvoicePrefix] = useState(numbering.invoicePrefix);
  const [invoiceNextNum, setInvoiceNextNum] = useState(numbering.invoiceNextNum);
  const [reportPrefix, setReportPrefix] = useState(numbering.reportPrefix);
  const [reportNextNum, setReportNextNum] = useState(numbering.reportNextNum);
  const [receiptPrefix, setReceiptPrefix] = useState(numbering.receiptPrefix);
  const [receiptNextNum, setReceiptNextNum] = useState(numbering.receiptNextNum);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleStateChange = (codeVal: string) => {
    setStateCode(codeVal);
    const matched = INDIAN_STATES.find((s) => s.code === codeVal);
    if (matched) setState(matched.name);
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedCompany: CompanyProfile = {
      name,
      logoUrl,
      address,
      gstin: gstin.toUpperCase(),
      pan: pan.toUpperCase(),
      phone,
      email,
      website,
      state,
      stateCode,
      bankName,
      accountNumber,
      ifscCode,
      branch,
      authorizedSignatory,
      signatoryDesignation,
    };
    onSaveCompany(updatedCompany);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveNumbering = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedConfig: NumberingConfig = {
      fy,
      challanPrefix,
      challanNextNum: Number(challanNextNum) || 1,
      invoicePrefix,
      invoiceNextNum: Number(invoiceNextNum) || 1,
      reportPrefix,
      reportNextNum: Number(reportNextNum) || 1,
      receiptPrefix,
      receiptNextNum: Number(receiptNextNum) || 1,
    };
    onSaveNumbering(updatedConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) onImportBackup(content);
      };
      reader.readAsText(file);
    }
  };

  const canEdit = currentRole === 'Admin' || currentRole === 'Manager';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Enterprise Settings & Company Profile
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Module 1 & G
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Configure statutory company tax parameters, banking instructions, and financial year document series
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-medium animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> Settings updated successfully!
          </div>
        )}
      </div>

      {/* Grid: Company Profile Form */}
      <form onSubmit={handleSaveCompany} className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-md space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-semibold text-white">Company Statutory Profile (1. Company Profile)</h3>
          </div>
          {canEdit && (
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Company Profile
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1">Company Legal Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-semibold focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Company Logo URL / Asset</label>
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://... (or leave blank for brand badge)"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Company Registered Address *</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Company GSTIN *</label>
            <input
              type="text"
              value={gstin}
              onChange={(e) => {
                setGstin(e.target.value);
                if (e.target.value.length >= 2) {
                  const p = e.target.value.substring(0, 2);
                  if (!isNaN(Number(p))) handleStateChange(p);
                }
              }}
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono font-bold text-amber-300 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Company PAN *</label>
            <input
              type="text"
              value={pan}
              onChange={(e) => setPan(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">GST State</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">State Code (2 Digits) *</label>
            <input
              type="text"
              value={stateCode}
              onChange={(e) => handleStateChange(e.target.value)}
              required
              placeholder="24"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono font-bold text-amber-300 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Billing Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Official Website</label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Bank & Signatory details */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Bank Account & Authorized Signatory Details
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white font-bold focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">IFSC Code</label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Branch Name</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Authorized Signatory Name</label>
              <input
                type="text"
                value={authorizedSignatory}
                onChange={(e) => setAuthorizedSignatory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-semibold focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Signatory Designation</label>
              <input
                type="text"
                value={signatoryDesignation}
                onChange={(e) => setSignatoryDesignation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Grid: Document Numbering Configuration (Module G) */}
      <form onSubmit={handleSaveNumbering} className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-md space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-semibold text-white">Document Numbering & Sequences (MODULE G)</h3>
          </div>
          {canEdit && (
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Numbering Config
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Financial Year (FY)</label>
            <input
              type="text"
              value={fy}
              onChange={(e) => setFy(e.target.value)}
              placeholder="2026-27"
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono font-bold text-amber-300 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Challan Prefix</label>
            <input
              type="text"
              value={challanPrefix}
              onChange={(e) => setChallanPrefix(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-cyan-400 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Challan Next #</label>
            <input
              type="number"
              min="1"
              value={challanNextNum}
              onChange={(e) => setChallanNextNum(Number(e.target.value) || 1)}
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Invoice Prefix</label>
            <input
              type="text"
              value={invoicePrefix}
              onChange={(e) => setInvoicePrefix(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-emerald-400 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Invoice Next #</label>
            <input
              type="number"
              min="1"
              value={invoiceNextNum}
              onChange={(e) => setInvoiceNextNum(Number(e.target.value) || 1)}
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block font-mono text-[10px]">Sample Challan No:</span>
            <span className="font-mono text-cyan-400 font-bold">{`${challanPrefix}/${fy}/000${challanNextNum}`}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-mono text-[10px]">Sample Invoice No:</span>
            <span className="font-mono text-emerald-400 font-bold">{`${invoicePrefix}/${fy}/000${invoiceNextNum}`}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-mono text-[10px]">Sample Service Report:</span>
            <span className="font-mono text-indigo-400 font-bold">{`${reportPrefix}/${fy}/000${reportNextNum}`}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-mono text-[10px]">Sample Receipt No:</span>
            <span className="font-mono text-amber-400 font-bold">{`${receiptPrefix}/${fy}/000${receiptNextNum}`}</span>
          </div>
        </div>
      </form>

      {/* Backup, Restore & Reset */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-md space-y-4">
        <h3 className="text-base font-semibold text-white">System Data Maintenance</h3>
        <p className="text-xs text-slate-400">
          Export full JSON snapshot of all customers, projects, challans, reports, invoices, and ledgers or restore from file.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onExportBackup}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Export JSON Backup
          </button>

          <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer">
            <Upload className="w-4 h-4 text-cyan-400" /> Import JSON Backup
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all ERP database to default sample industrial dataset?')) {
                onResetAllData();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 text-xs font-medium cursor-pointer ml-auto"
          >
            <RotateCcw className="w-4 h-4" /> Reset Database to Factory Presets
          </button>
        </div>
      </div>
    </div>
  );
};
