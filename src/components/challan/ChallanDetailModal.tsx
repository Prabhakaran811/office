import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  FileText,
  Truck,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Clock,
  ShieldCheck,
  Building,
  History,
} from 'lucide-react';
import { DeliveryChallan, CompanyProfile, UserRole, ChallanStatus } from '../../types';
import { Modal } from '../common/Modal';
import { formatDate } from '../../services/numbering';
import { exportElementToPdf, triggerPrint, generateWhatsAppLink } from '../../services/pdfExport';
import { StatusBadge } from '../common/Badge';
import { QrCodeView } from '../common/QrCodeView';

interface ChallanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  challan: DeliveryChallan | null;
  company: CompanyProfile;
  currentRole: UserRole;
  onUpdateStatus: (challanId: string, newStatus: ChallanStatus, comment?: string) => void;
  onCreateServiceBill: (challan: DeliveryChallan) => void;
  onCreateServiceReport: (challan: DeliveryChallan) => void;
}

export const ChallanDetailModal: React.FC<ChallanDetailModalProps> = ({
  isOpen,
  onClose,
  challan,
  company,
  currentRole,
  onUpdateStatus,
  onCreateServiceBill,
  onCreateServiceReport,
}) => {
  const [copyType, setCopyType] = useState<'ORIGINAL FOR CONSIGNEE' | 'DUPLICATE FOR TRANSPORTER' | 'TRIPLICATE FOR CONSIGNOR'>(
    'ORIGINAL FOR CONSIGNEE'
  );
  const [activeTab, setActiveTab] = useState<'preview' | 'audit'>('preview');
  const [isExporting, setIsExporting] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);

  if (!isOpen || !challan) return null;

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    await exportElementToPdf('challan-a4-document', `Delivery_Challan_${challan.challanNo.replace(/\//g, '_')}`);
    setIsExporting(false);
  };

  const handleWhatsApp = () => {
    const link = generateWhatsAppLink(
      challan.contactNumber || '',
      'Delivery Challan',
      challan.challanNo,
      challan.customerName,
      `${challan.totalQty} Units (${challan.items.length} items)`,
      formatDate(challan.challanDate)
    );
    window.open(link, '_blank');
  };

  const handleCancelSubmit = () => {
    if (!cancelReason.trim()) {
      alert('Please enter a cancellation reason.');
      return;
    }
    onUpdateStatus(challan.id, 'Cancelled', `Document Cancelled: ${cancelReason}`);
    setShowCancelPrompt(false);
  };

  const canApprove = (currentRole === 'Admin' || currentRole === 'Manager') && challan.status === 'Draft';
  const canDispatch = (currentRole === 'Admin' || currentRole === 'Engineer' || currentRole === 'Manager') && challan.status === 'Approved';
  const canMarkDelivered = (currentRole === 'Admin' || currentRole === 'Engineer' || currentRole === 'Manager') && challan.status === 'Dispatched';
  const canMarkReturned = (currentRole === 'Admin' || currentRole === 'Engineer' || currentRole === 'Manager') && (challan.challanType.includes('Returnable') || challan.status === 'Delivered');
  const canCancel = (currentRole === 'Admin' || currentRole === 'Manager') && challan.status !== 'Cancelled';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Delivery Challan: ${challan.challanNo}`}
      subtitle={`Customer: ${challan.customerName} | Status: ${challan.status}`}
      size="2xl"
      footer={
        <div className="flex flex-wrap items-center justify-between w-full gap-2">
          {/* Status Workflow Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {canApprove && (
              <button
                onClick={() => onUpdateStatus(challan.id, 'Approved', 'Approved Challan for Dispatch')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Approve Challan
              </button>
            )}

            {canDispatch && (
              <button
                onClick={() => onUpdateStatus(challan.id, 'Dispatched', 'Consignment Dispatched')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold cursor-pointer"
              >
                <Truck className="w-3.5 h-3.5" /> Dispatch Consignment
              </button>
            )}

            {canMarkDelivered && (
              <button
                onClick={() => onUpdateStatus(challan.id, 'Delivered', 'Material Acknowledged Delivered at Site')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Mark Delivered
              </button>
            )}

            {canMarkReturned && challan.status !== 'Returned' && (
              <button
                onClick={() => onUpdateStatus(challan.id, 'Returned', 'Returnable Equipment received back')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Mark Returned
              </button>
            )}

            {/* Workflow Linking Buttons */}
            {challan.status !== 'Cancelled' && (
              <>
                <button
                  onClick={() => { onClose(); onCreateServiceReport(challan); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" /> + Service Report
                </button>

                <button
                  onClick={() => { onClose(); onCreateServiceBill(challan); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" /> Convert to Service Bill
                </button>
              </>
            )}

            {canCancel && (
              <button
                onClick={() => setShowCancelPrompt(true)}
                className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 text-xs font-medium cursor-pointer"
              >
                Cancel Challan
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
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
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
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
          <span className="text-xs text-slate-400 font-mono">Copy Type:</span>
          {(['ORIGINAL FOR CONSIGNEE', 'DUPLICATE FOR TRANSPORTER', 'TRIPLICATE FOR CONSIGNOR'] as const).map(
            (type) => (
              <button
                key={type}
                onClick={() => setCopyType(type)}
                className={`text-[10px] font-mono px-2 py-1 rounded transition-colors cursor-pointer ${
                  copyType === type
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {type.split(' ')[0]}
              </button>
            )
          )}
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
            <FileText className="w-3.5 h-3.5" /> A4 Document Preview
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" /> Audit Trail ({challan.auditHistory?.length || 1})
          </button>
        </div>
      </div>

      {/* Cancellation prompt modal if triggered */}
      {showCancelPrompt && (
        <div className="mb-4 p-4 bg-rose-950/80 border border-rose-600/60 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-400" /> Confirm Document Cancellation (Rule 3: Record is retained for audit)
          </div>
          <input
            type="text"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Reason for cancellation (e.g. Order revised by customer)..."
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
              Confirm Cancel
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: A4 DOCUMENT PREVIEW */}
      {activeTab === 'preview' && (
        <div className="flex justify-center bg-slate-950 p-2 sm:p-4 rounded-xl border border-slate-800 overflow-x-auto">
          {/* Printable A4 Container */}
          <div
            id="challan-a4-document"
            className="w-[210mm] min-h-[285mm] bg-white text-slate-900 p-8 shadow-2xl flex flex-col justify-between text-[11px] font-sans print-container select-text relative"
            style={{ boxSizing: 'border-box' }}
          >
            {/* Watermark for Cancelled status */}
            {challan.status === 'Cancelled' && (
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
                  GST RULE 55 DELIVERY VOUCHER
                </div>
                <div className="text-[10px] font-mono tracking-widest font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 border border-amber-300 rounded">
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
                <div className="shrink-0">
                  <QrCodeView
                    value={`CHALLAN:${challan.challanNo}|DATE:${challan.challanDate}|GSTIN:${company.gstin}|EWB:${challan.ewayBillNo || 'NA'}`}
                    size={80}
                    label="CONSIGNMENT QR"
                  />
                </div>
              </div>

              {/* Title Strip */}
              <div className="text-center my-3 bg-slate-900 text-white py-1.5 rounded uppercase font-mono tracking-widest font-bold text-sm">
                DELIVERY CHALLAN
              </div>

              {/* Challan & Logistics Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 border border-slate-300 rounded p-3 mb-3 bg-slate-50/70">
                <div className="space-y-1">
                  <div>
                    <span className="text-slate-500 font-mono text-[10px]">CHALLAN NUMBER:</span>{' '}
                    <strong className="font-mono text-slate-950 text-xs">{challan.challanNo}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono text-[10px]">CHALLAN DATE:</span>{' '}
                    <strong className="text-slate-900">{formatDate(challan.challanDate)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono text-[10px]">CHALLAN TYPE:</span>{' '}
                    <span className="font-bold text-amber-800 bg-amber-100/80 px-1 rounded text-[10px]">
                      {challan.challanType}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono text-[10px]">PURPOSE:</span>{' '}
                    <span className="text-slate-900 font-medium">{challan.purposeOfDelivery}</span>
                  </div>
                </div>

                <div className="space-y-1 border-l border-slate-300 pl-3">
                  <div>
                    <span className="text-slate-500 font-mono text-[10px]">PO / REF NUMBER:</span>{' '}
                    <strong className="font-mono text-slate-950">{challan.poNumber || 'N/A'}</strong>
                    {challan.poDate && (
                      <span className="text-slate-600 text-[10px]"> ({formatDate(challan.poDate)})</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono text-[10px]">PROJECT CODE:</span>{' '}
                    <span className="font-medium text-slate-900">
                      {challan.projectCode ? `[${challan.projectCode}] ${challan.projectName}` : 'Standard Automation Site'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono text-[10px]">VEHICLE NUMBER:</span>{' '}
                    <strong className="font-mono text-slate-950">{challan.vehicleNumber || 'Direct Hand Delivery'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono text-[10px]">TRANSPORTER:</span>{' '}
                    <span className="text-slate-800">{challan.transporterName}</span>
                    {challan.ewayBillNo && (
                      <span className="font-mono text-slate-900 font-semibold ml-2">
                        (E-Way: {challan.ewayBillNo})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Consignee & Delivery Address Section */}
              <div className="grid grid-cols-2 gap-3 border border-slate-300 rounded p-3 mb-4">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500 mb-1 border-b border-slate-200 pb-1">
                    CONSIGNEE (BILLED TO)
                  </div>
                  <div className="font-bold text-slate-950">{challan.customerName}</div>
                  <div className="text-slate-600 text-[10px] mt-0.5 leading-tight">{challan.customerAddress}</div>
                  <div className="mt-1.5 text-[10px] font-mono text-slate-800 space-y-0.5">
                    <div><strong>GSTIN:</strong> {challan.customerGstin || 'Unregistered'}</div>
                    <div><strong>State:</strong> {challan.customerState} (Code: {challan.customerStateCode})</div>
                    <div><strong>Contact:</strong> {challan.contactPerson} ({challan.contactNumber})</div>
                  </div>
                </div>

                <div className="border-l border-slate-300 pl-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500 mb-1 border-b border-slate-200 pb-1">
                    DELIVERY SITE (DISPATCHED TO)
                  </div>
                  <div className="font-bold text-slate-950">
                    {challan.deliveryLocation || challan.customerName}
                  </div>
                  <div className="text-slate-600 text-[10px] mt-0.5 leading-tight">
                    {challan.deliveryLocation || challan.customerAddress}
                  </div>
                  <div className="mt-2 text-[10px] text-slate-700">
                    <strong>Site Incharge / Engineer:</strong> {challan.engineerName}
                  </div>
                </div>
              </div>

              {/* Item Table */}
              <div className="border border-slate-300 rounded overflow-hidden mb-4">
                <table className="w-full text-left text-[10px]">
                  <thead className="bg-slate-100 text-slate-700 font-mono uppercase font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2 w-8 text-center">S.No</th>
                      <th className="p-2">Item Description</th>
                      <th className="p-2 w-28">Part No</th>
                      <th className="p-2 w-20">HSN/SAC</th>
                      <th className="p-2 w-16 text-right">Qty</th>
                      <th className="p-2 w-14">Unit</th>
                      <th className="p-2 min-w-[130px]">Serial Number(s)</th>
                      <th className="p-2">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {challan.items.map((item, index) => (
                      <tr key={item.id} className="align-top">
                        <td className="p-2 text-center font-mono font-medium text-slate-600">{index + 1}</td>
                        <td className="p-2">
                          <div className="font-semibold text-slate-950">{item.description}</div>
                        </td>
                        <td className="p-2 font-mono text-slate-800">{item.partNo || '—'}</td>
                        <td className="p-2 font-mono text-slate-800">{item.hsnSac || '—'}</td>
                        <td className="p-2 text-right font-mono font-bold text-slate-950">{item.qty}</td>
                        <td className="p-2 text-slate-700">{item.unit}</td>
                        <td className="p-2 font-mono text-[9px] text-amber-900 font-medium">
                          {item.serialNo || '—'}
                        </td>
                        <td className="p-2 text-slate-600 text-[9px]">{item.remarks || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100/80 font-mono font-bold border-t border-slate-300 text-slate-950">
                    <tr>
                      <td colSpan={4} className="p-2 text-right uppercase tracking-wider text-[10px]">
                        Total Quantity:
                      </td>
                      <td className="p-2 text-right text-xs">{challan.totalQty}</td>
                      <td colSpan={3} className="p-2 text-[10px] text-slate-600 font-sans">
                        {challan.items[0]?.unit || 'Units'} ({challan.items.length} line items)
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Special Instructions & Terms */}
              <div className="grid grid-cols-2 gap-3 text-[9px] mb-4">
                <div className="border border-slate-200 p-2.5 rounded bg-slate-50/50">
                  <div className="font-bold uppercase tracking-wider font-mono text-slate-700 mb-1">
                    Special Instructions
                  </div>
                  <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                    {challan.specialInstructions || 'Handle with extreme care. Keep away from water and magnetic fields.'}
                  </p>
                </div>
                <div className="border border-slate-200 p-2.5 rounded bg-slate-50/50">
                  <div className="font-bold uppercase tracking-wider font-mono text-slate-700 mb-1">
                    Terms & Conditions
                  </div>
                  <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                    {challan.termsAndConditions || '1. Materials delivered strictly as per approved specifications. 2. Any transit shortage must be registered within 48 hours.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Signatures */}
            <div className="border-t-2 border-slate-900 pt-3 mt-4">
              <div className="bg-slate-50 p-2 border border-slate-200 rounded text-center font-semibold text-slate-800 text-[10px] mb-4">
                “Received the above materials in good condition.”
              </div>

              <div className="grid grid-cols-2 gap-8 pt-4">
                {/* Receiver Signature Area */}
                <div className="text-center border border-dashed border-slate-300 rounded p-4">
                  <div className="h-12 flex items-center justify-center text-slate-400 italic text-[10px]">
                    {challan.receiverName ? (
                      <span className="font-serif text-slate-800 text-sm font-semibold">
                        {challan.receiverName}
                      </span>
                    ) : (
                      '(Signature & Site Rubber Stamp)'
                    )}
                  </div>
                  <div className="border-t border-slate-400 pt-1 font-bold text-slate-900 text-[10px] uppercase">
                    Customer / Receiver Signature & Date
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">
                    Name:{' '}
                    <span className="text-slate-800 font-medium">
                      {challan.receiverName || challan.contactPerson || 'Authorized Representative'}
                    </span>
                  </div>
                </div>

                {/* Company Authorized Signatory */}
                <div className="text-center border border-dashed border-slate-300 rounded p-4">
                  <div className="h-12 flex items-center justify-center font-serif text-slate-900 text-sm font-bold tracking-wider">
                    {company.authorizedSignatory}
                  </div>
                  <div className="border-t border-slate-400 pt-1 font-bold text-slate-900 text-[10px] uppercase">
                    For {company.name}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">
                    {company.signatoryDesignation} (Authorized Signatory)
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[8px] text-slate-400 font-mono mt-4 pt-2 border-t border-slate-200">
                <span>Generated by Veyon ERP System • Document: {challan.challanNo}</span>
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
              <History className="w-4 h-4 text-cyan-400" /> Document Audit & Revision History
            </h4>
            <span className="text-xs text-slate-400 font-mono">Rule 4 & Rule 3 Compliant</span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
            {challan.auditHistory?.map((entry, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-cyan-500 ring-4 ring-slate-850" />
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-xs">{entry.action}</span>
                    <span className="text-[10px] font-mono text-slate-400">{formatDate(entry.timestamp)} ({new Date(entry.timestamp).toLocaleTimeString()})</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Actor: <strong className="text-slate-200">{entry.user}</strong> ({entry.role})
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
