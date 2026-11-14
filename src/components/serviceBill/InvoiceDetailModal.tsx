import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  CreditCard,
  Building,
  CheckCircle,
  AlertTriangle,
  History,
  QrCode,
  FileText,
  Mail,
} from 'lucide-react';
import { ServiceInvoice, CompanyProfile, UserRole } from '../../types';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate, numberToWordsIndian } from '../../services/numbering';
import { exportElementToPdf, triggerPrint, generateWhatsAppLink } from '../../services/pdfExport';
import { StatusBadge } from '../common/Badge';
import { QrCodeView } from '../common/QrCodeView';

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: ServiceInvoice | null;
  company: CompanyProfile;
  currentRole: UserRole;
  onRecordPayment: (invoice: ServiceInvoice) => void;
  onCancelInvoice: (invoiceId: string, reason: string) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  isOpen,
  onClose,
  invoice,
  company,
  currentRole,
  onRecordPayment,
  onCancelInvoice,
}) => {
  const [copyType, setCopyType] = useState<'ORIGINAL FOR RECIPIENT' | 'DUPLICATE FOR SUPPLIER'>('ORIGINAL FOR RECIPIENT');
  const [activeTab, setActiveTab] = useState<'preview' | 'audit'>('preview');
  const [isExporting, setIsExporting] = useState(false);
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');

  if (!isOpen || !invoice) return null;

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    await exportElementToPdf('invoice-a4-document', `Invoice_${invoice.invoiceNo.replace(/\//g, '_')}`);
    setIsExporting(false);
  };

  const handleWhatsApp = () => {
    const link = generateWhatsAppLink(
      invoice.phone || '',
      'Tax Invoice',
      invoice.invoiceNo,
      invoice.customerName,
      `Amount: ${formatCurrency(invoice.grandTotal)} (Balance: ${formatCurrency(invoice.balanceAmount)})`,
      formatDate(invoice.invoiceDate)
    );
    window.open(link, '_blank');
  };

  const handleCancelSubmit = () => {
    if (!cancelReason.trim()) {
      alert('Please state a reason for cancelling this invoice.');
      return;
    }
    onCancelInvoice(invoice.id, cancelReason);
    setShowCancelPrompt(false);
  };

  const canRecordPayment =
    (currentRole === 'Admin' || currentRole === 'Accounts' || currentRole === 'Manager') &&
    invoice.balanceAmount > 0 &&
    invoice.status !== 'Cancelled';

  const canCancel = (currentRole === 'Admin' || currentRole === 'Manager') && invoice.status !== 'Cancelled';

  // UPI Payment String for QR: upi://pay?pa=...&pn=...&am=...&cu=INR
  const upiQrString = `upi://pay?pa=veyon.billing@hdfcbank&pn=${encodeURIComponent(company.name)}&am=${invoice.balanceAmount > 0 ? invoice.balanceAmount : invoice.grandTotal}&cu=INR&tn=${encodeURIComponent(invoice.invoiceNo)}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Tax Invoice: ${invoice.invoiceNo}`}
      subtitle={`Customer: ${invoice.customerName} | Total: ${formatCurrency(invoice.grandTotal)}`}
      size="2xl"
      footer={
        <div className="flex flex-wrap items-center justify-between w-full gap-2">
          {/* Status & Payment Button */}
          <div className="flex items-center gap-2">
            {canRecordPayment && (
              <button
                onClick={() => {
                  onClose();
                  onRecordPayment(invoice);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <CreditCard className="w-4 h-4" /> Record Payment (Balance: {formatCurrency(invoice.balanceAmount)})
              </button>
            )}

            {canCancel && (
              <button
                onClick={() => setShowCancelPrompt(true)}
                className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 text-xs font-medium cursor-pointer"
              >
                Cancel Invoice
              </button>
            )}
          </div>

          {/* Export & Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEmailRecipient(invoice.email || 'accounts@client.com');
                setEmailModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" /> Email
            </button>
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
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" /> {isExporting ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        </div>
      }
    >
      {/* Top Toolbar: Copy Type Selector & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Invoice Copy:</span>
          {(['ORIGINAL FOR RECIPIENT', 'DUPLICATE FOR SUPPLIER'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setCopyType(type)}
              className={`text-[10px] font-mono px-2 py-1 rounded transition-colors cursor-pointer ${
                copyType === type
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> A4 Tax Invoice Preview
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" /> Audit History ({invoice.auditHistory?.length || 1})
          </button>
        </div>
      </div>

      {/* Cancel Prompt Dialog */}
      {showCancelPrompt && (
        <div className="mb-4 p-4 bg-rose-950/80 border border-rose-600/60 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-400" /> Cancel Invoice (Rule 3: Document cannot be permanently deleted; marked as Cancelled for GST audit)
          </div>
          <input
            type="text"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Cancellation reason (e.g. Revised work scope / Customer requested cancellation)..."
            className="w-full px-3 py-1.5 bg-slate-950 border border-rose-700 rounded text-xs text-white"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowCancelPrompt(false)}
              className="px-3 py-1 bg-slate-800 text-xs rounded text-slate-300"
            >
              Dismiss
            </button>
            <button
              onClick={handleCancelSubmit}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-xs font-bold rounded text-white"
            >
              Confirm Cancellation
            </button>
          </div>
        </div>
      )}

      {/* Email Simulation Dialog */}
      {emailModalOpen && (
        <div className="mb-4 p-4 bg-slate-850 border border-slate-700 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-white font-semibold text-xs">
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-emerald-400" /> Send Tax Invoice PDF via Email
            </span>
            <button onClick={() => setEmailModalOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">To Email:</label>
              <input
                type="email"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Subject:</label>
              <input
                type="text"
                readOnly
                value={`Invoice ${invoice.invoiceNo} from Veyon Automation & Robotics Pvt. Ltd.`}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-400 font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                alert(`Invoice PDF successfully queued for delivery to ${emailRecipient}!`);
                setEmailModalOpen(false);
              }}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded shadow-sm"
            >
              Send Email
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: A4 TAX INVOICE PREVIEW */}
      {activeTab === 'preview' && (
        <div className="flex justify-center bg-slate-950 p-2 sm:p-4 rounded-xl border border-slate-800 overflow-x-auto">
          {/* Printable A4 Container */}
          <div
            id="invoice-a4-document"
            className="w-[210mm] min-h-[285mm] bg-white text-slate-900 p-8 shadow-2xl flex flex-col justify-between text-[11px] font-sans print-container select-text relative"
            style={{ boxSizing: 'border-box' }}
          >
            {/* Watermark for Cancelled status */}
            {invoice.status === 'Cancelled' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-15 rotate-[-30deg]">
                <span className="text-8xl font-black text-rose-700 border-8 border-rose-700 px-8 py-4 uppercase tracking-widest">
                  CANCELLED
                </span>
              </div>
            )}

            <div>
              {/* Top Banner: Copy Type */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-3">
                <div className="text-[10px] font-mono tracking-widest uppercase font-bold text-slate-700">
                  GST TAX INVOICE • SECTION 31 OF CGST ACT
                </div>
                <div className="text-[10px] font-mono tracking-widest font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-300 rounded">
                  {copyType}
                </div>
              </div>

              {/* Company Header */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-300 pb-4">
                <div className="flex-1">
                  <div className="text-xl font-black tracking-tight text-slate-950 uppercase font-mono">
                    {company.name}
                  </div>
                  <div className="text-[10px] text-slate-600 mt-1 max-w-lg leading-relaxed">
                    {company.address}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono font-medium text-slate-800">
                    <span><strong>GSTIN:</strong> {company.gstin}</span>
                    <span><strong>PAN:</strong> {company.pan}</span>
                    <span><strong>STATE:</strong> {company.state} (Code: {company.stateCode})</span>
                  </div>
                  <div className="text-[10px] text-slate-600 mt-0.5">
                    <strong>Phone:</strong> {company.phone} | <strong>Email:</strong> {company.email} | <strong>Web:</strong> {company.website}
                  </div>
                </div>

                {/* QR Code */}
                <div className="shrink-0 text-center">
                  <QrCodeView
                    value={upiQrString}
                    size={80}
                    label="SCAN TO PAY UPI"
                  />
                </div>
              </div>

              {/* Title Strip */}
              <div className="text-center my-3 bg-emerald-950 text-white py-1.5 rounded uppercase font-mono tracking-widest font-bold text-sm">
                TAX INVOICE / SERVICE BILL
              </div>

              {/* Invoice Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 border border-slate-300 rounded p-3 mb-3 bg-slate-50/70">
                <div className="space-y-1">
                  <div>
                    <span className="text-slate-500 font-mono text-[10px]">INVOICE NUMBER:</span>{' '}
                    <strong className="font-mono text-slate-950 text-xs">{invoice.invoiceNo}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono text-[10px]">INVOICE DATE:</span>{' '}
                    <strong className="text-slate-900">{formatDate(invoice.invoiceDate)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono text-[10px]">PAYMENT DUE DATE:</span>{' '}
                    <span className="font-semibold text-rose-800 font-mono">{formatDate(invoice.dueDate)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono text-[10px]">SERVICE PERIOD:</span>{' '}
                    <span className="text-slate-900 font-medium">{invoice.servicePeriod || 'As per project schedule'}</span>
                  </div>
                </div>

                <div className="space-y-1 border-l border-slate-300 pl-3">
                  <div>
                    <span className="text-slate-500 font-mono text-[10px]">PO / WORK ORDER:</span>{' '}
                    <strong className="font-mono text-slate-950">{invoice.poNumber || 'N/A'}</strong>
                    {invoice.poDate && (
                      <span className="text-slate-600 text-[10px]"> ({formatDate(invoice.poDate)})</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono text-[10px]">PROJECT CODE:</span>{' '}
                    <span className="font-medium text-slate-900">
                      {invoice.projectCode ? `[${invoice.projectCode}] ${invoice.projectName}` : 'Industrial Automation Service'}
                    </span>
                  </div>
                  {/* Linked Traceability references */}
                  <div>
                    <span className="text-slate-500 font-mono text-[10px]">LINKED CHALLAN:</span>{' '}
                    {invoice.linkedChallanNo ? (
                      <span className="font-mono font-bold text-cyan-900 bg-cyan-100 px-1 rounded text-[10px]">
                        {invoice.linkedChallanNo}
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono text-[10px]">LINKED SERVICE REPORT:</span>{' '}
                    {invoice.linkedServiceReportNo ? (
                      <span className="font-mono font-bold text-indigo-900 bg-indigo-100 px-1 rounded text-[10px]">
                        {invoice.linkedServiceReportNo}
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Billed-To and Site Shipped-To Details */}
              <div className="grid grid-cols-2 gap-3 border border-slate-300 rounded p-3 mb-4">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500 mb-1 border-b border-slate-200 pb-1">
                    BILLED TO (CUSTOMER DETAILS)
                  </div>
                  <div className="font-bold text-slate-950">{invoice.customerName}</div>
                  <div className="text-slate-600 text-[10px] mt-0.5 leading-tight">{invoice.billingAddress}</div>
                  <div className="mt-1.5 text-[10px] font-mono text-slate-800 space-y-0.5">
                    <div><strong>GSTIN:</strong> {invoice.customerGstin || 'Unregistered'}</div>
                    <div><strong>State:</strong> {invoice.customerState} (Code: {invoice.customerStateCode})</div>
                    <div><strong>Contact:</strong> {invoice.contactPerson} ({invoice.phone})</div>
                  </div>
                </div>

                <div className="border-l border-slate-300 pl-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500 mb-1 border-b border-slate-200 pb-1">
                    SERVICE SITE / SHIPPED TO
                  </div>
                  <div className="font-bold text-slate-950">
                    {invoice.siteLocation || invoice.customerName}
                  </div>
                  <div className="text-slate-600 text-[10px] mt-0.5 leading-tight">
                    {invoice.siteAddress || invoice.billingAddress}
                  </div>
                  <div className="mt-2 text-[10px] text-slate-700">
                    <strong>Service Engineer Incharge:</strong> {invoice.engineerName || 'Veyon Engineering Team'}
                  </div>
                </div>
              </div>

              {/* Service Item Table */}
              <div className="border border-slate-300 rounded overflow-hidden mb-3">
                <table className="w-full text-left text-[10px]">
                  <thead className="bg-slate-100 text-slate-700 font-mono uppercase font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2 w-8 text-center">S.No</th>
                      <th className="p-2">Service Description</th>
                      <th className="p-2 w-20">SAC Code</th>
                      <th className="p-2 w-16 text-right">Qty</th>
                      <th className="p-2 w-16">Unit</th>
                      <th className="p-2 w-24 text-right">Rate (₹)</th>
                      <th className="p-2 w-28 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {invoice.items.map((item, index) => (
                      <tr key={item.id} className="align-top">
                        <td className="p-2 text-center font-mono font-medium text-slate-600">{index + 1}</td>
                        <td className="p-2 font-medium text-slate-900">{item.serviceDescription}</td>
                        <td className="p-2 font-mono text-slate-700">{item.sacCode}</td>
                        <td className="p-2 text-right font-mono font-semibold text-slate-900">{item.qty}</td>
                        <td className="p-2 text-slate-700">{item.unit}</td>
                        <td className="p-2 text-right font-mono text-slate-800">{formatCurrency(item.rate)}</td>
                        <td className="p-2 text-right font-mono font-bold text-slate-950">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Financials: Bank Details & Amount Calculation */}
              <div className="grid grid-cols-2 gap-4 items-start mb-3">
                {/* Bank Details & Amount In Words */}
                <div className="space-y-3">
                  <div className="border border-slate-300 rounded p-2.5 bg-slate-50/70 text-[9px] font-mono">
                    <div className="font-bold uppercase tracking-wider text-slate-800 mb-1 border-b border-slate-200 pb-0.5">
                      Bank Payment Details (NEFT / RTGS)
                    </div>
                    <div className="space-y-0.5 text-slate-700">
                      <div><strong>Bank Name:</strong> {company.bankName}</div>
                      <div><strong>Account No:</strong> <span className="font-bold text-slate-950">{company.accountNumber}</span></div>
                      <div><strong>IFSC Code:</strong> {company.ifscCode}</div>
                      <div><strong>Branch:</strong> {company.branch}</div>
                    </div>
                  </div>

                  <div className="border border-slate-300 rounded p-2.5 bg-emerald-50/40">
                    <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-950 mb-0.5">
                      Amount in Words:
                    </div>
                    <div className="font-serif italic text-slate-900 text-[10px] leading-tight">
                      {numberToWordsIndian(invoice.grandTotal)}
                    </div>
                  </div>
                </div>

                {/* Tax Breakdown Table */}
                <div className="border border-slate-300 rounded overflow-hidden text-[10px]">
                  <table className="w-full text-right font-mono">
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-1.5 text-slate-600 bg-slate-50 font-sans">Subtotal:</td>
                        <td className="p-1.5 font-bold text-slate-950">{formatCurrency(invoice.subtotal)}</td>
                      </tr>
                      {invoice.discountAmount > 0 && (
                        <tr>
                          <td className="p-1.5 text-slate-600 bg-slate-50 font-sans">Discount ({invoice.discountPercentage}%):</td>
                          <td className="p-1.5 text-amber-700">-{formatCurrency(invoice.discountAmount)}</td>
                        </tr>
                      )}
                      <tr className="bg-slate-100/60 font-semibold">
                        <td className="p-1.5 text-slate-800 font-sans">Taxable Value:</td>
                        <td className="p-1.5 text-slate-950">{formatCurrency(invoice.taxableValue)}</td>
                      </tr>

                      {invoice.isInterState ? (
                        <tr className="text-purple-900 bg-purple-50/50">
                          <td className="p-1.5 font-sans">Integrated GST (IGST {invoice.igstRate}%):</td>
                          <td className="p-1.5 font-bold">+{formatCurrency(invoice.igstAmount)}</td>
                        </tr>
                      ) : (
                        <>
                          <tr className="text-cyan-950 bg-cyan-50/50">
                            <td className="p-1.5 font-sans">Central GST (CGST {invoice.cgstRate}%):</td>
                            <td className="p-1.5 font-bold">+{formatCurrency(invoice.cgstAmount)}</td>
                          </tr>
                          <tr className="text-cyan-950 bg-cyan-50/50">
                            <td className="p-1.5 font-sans">State GST (SGST {invoice.sgstRate}%):</td>
                            <td className="p-1.5 font-bold">+{formatCurrency(invoice.sgstAmount)}</td>
                          </tr>
                        </>
                      )}

                      {invoice.roundOff !== 0 && (
                        <tr>
                          <td className="p-1.5 text-slate-600 bg-slate-50 font-sans">Round Off:</td>
                          <td className="p-1.5 text-slate-700">
                            {invoice.roundOff > 0 ? `+${invoice.roundOff}` : invoice.roundOff}
                          </td>
                        </tr>
                      )}

                      <tr className="bg-slate-900 text-white font-bold text-xs">
                        <td className="p-2 font-sans uppercase tracking-wider">Grand Total:</td>
                        <td className="p-2 text-amber-400 font-mono text-sm">{formatCurrency(invoice.grandTotal)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Status Strip */}
              <div className="bg-slate-50 border border-slate-300 rounded p-2 flex items-center justify-between text-[10px] font-mono mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">PAYMENT STATUS:</span>
                  <StatusBadge status={invoice.status} />
                </div>
                <div>
                  <span className="text-slate-600">Amount Paid:</span>{' '}
                  <strong className="text-emerald-700">{formatCurrency(invoice.amountPaid)}</strong>
                  <span className="mx-2 text-slate-300">|</span>
                  <span className="text-slate-600">Balance Due:</span>{' '}
                  <strong className="text-rose-700 font-bold">{formatCurrency(invoice.balanceAmount)}</strong>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="border border-slate-200 p-2 rounded bg-slate-50/40 text-[9px] text-slate-600 mb-3">
                <div className="font-mono font-bold uppercase tracking-wider text-slate-800 mb-0.5">
                  Terms & Conditions
                </div>
                <p className="whitespace-pre-line leading-relaxed">{invoice.termsAndConditions}</p>
              </div>
            </div>

            {/* Signatures & Certification */}
            <div className="border-t-2 border-slate-900 pt-3 mt-4">
              <div className="grid grid-cols-2 gap-8">
                {/* Customer Acknowledgement */}
                <div className="text-center border border-dashed border-slate-300 rounded p-3">
                  <div className="h-10 flex items-center justify-center text-slate-400 italic text-[10px]">
                    (Customer Signature & Company Seal)
                  </div>
                  <div className="border-t border-slate-400 pt-1 font-bold text-slate-900 text-[9px] uppercase">
                    Customer Seal & Acceptance
                  </div>
                </div>

                {/* Company Authorized Signatory */}
                <div className="text-center border border-dashed border-slate-300 rounded p-3">
                  <div className="h-10 flex items-center justify-center font-serif text-slate-900 text-sm font-bold tracking-wider">
                    {company.authorizedSignatory}
                  </div>
                  <div className="border-t border-slate-400 pt-1 font-bold text-slate-900 text-[9px] uppercase">
                    For {company.name}
                  </div>
                  <div className="text-[8px] text-slate-500">
                    {company.signatoryDesignation} (Authorized Signatory)
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[8px] text-slate-400 font-mono mt-3 pt-2 border-t border-slate-200">
                <span>Computer Generated GST Tax Invoice • System Ref: {invoice.invoiceNo}</span>
                <span>Page 1 of 1</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT & REVISION HISTORY */}
      {activeTab === 'audit' && (
        <div className="bg-slate-850 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" /> Invoice Audit Trail & Compliance Log
            </h4>
            <span className="text-xs text-slate-400 font-mono">Rule 4 & Rule 5 Compliant</span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
            {invoice.auditHistory?.map((entry, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-slate-850" />
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-xs">{entry.action}</span>
                    <span className="text-[10px] font-mono text-slate-400">{formatDate(entry.timestamp)} ({new Date(entry.timestamp).toLocaleTimeString()})</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    User: <strong className="text-slate-200">{entry.user}</strong> ({entry.role})
                  </div>
                  {entry.details && (
                    <div className="text-xs text-amber-300/90 mt-1 bg-slate-950 p-2 rounded border border-slate-800">
                      {entry.details}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};
