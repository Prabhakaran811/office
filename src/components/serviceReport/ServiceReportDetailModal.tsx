import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  FileText,
  Wrench,
  CheckCircle,
  Truck,
  Building,
  User,
  Clock,
  Cpu,
} from 'lucide-react';
import { ServiceReport, CompanyProfile, UserRole } from '../../types';
import { Modal } from '../common/Modal';
import { formatDate } from '../../services/numbering';
import { exportElementToPdf, triggerPrint, generateWhatsAppLink } from '../../services/pdfExport';
import { StatusBadge } from '../common/Badge';

interface ServiceReportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ServiceReport | null;
  company: CompanyProfile;
  currentRole: UserRole;
  onCreateServiceBill: (report: ServiceReport) => void;
}

export const ServiceReportDetailModal: React.FC<ServiceReportDetailModalProps> = ({
  isOpen,
  onClose,
  report,
  company,
  currentRole,
  onCreateServiceBill,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !report) return null;

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    await exportElementToPdf(
      'service-report-a4',
      `Service_Report_${report.reportNo.replace(/\//g, '_')}`
    );
    setIsExporting(false);
  };

  const handleWhatsApp = () => {
    const link = generateWhatsAppLink(
      '',
      'Service Report',
      report.reportNo,
      report.customerName,
      `Engineer: ${report.engineerName} (${report.equipmentDetails || 'Automation Service'})`,
      formatDate(report.date)
    );
    window.open(link, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Service Report: ${report.reportNo}`}
      subtitle={`Customer: ${report.customerName} | Status: ${report.status}`}
      size="2xl"
      footer={
        <div className="flex flex-wrap items-center justify-between w-full gap-2">
          {/* Action to create invoice */}
          <div>
            {(currentRole === 'Admin' || currentRole === 'Accounts' || currentRole === 'Manager') && (
              <button
                onClick={() => {
                  onClose();
                  onCreateServiceBill(report);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4" /> Create Service Bill (Module C)
              </button>
            )}
          </div>

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
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" /> {isExporting ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        </div>
      }
    >
      <div className="flex justify-center bg-slate-950 p-2 sm:p-4 rounded-xl border border-slate-800 overflow-x-auto">
        {/* Printable A4 Container */}
        <div
          id="service-report-a4"
          className="w-[210mm] min-h-[285mm] bg-white text-slate-900 p-8 shadow-2xl flex flex-col justify-between text-[11px] font-sans print-container select-text"
          style={{ boxSizing: 'border-box' }}
        >
          <div>
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-3 mb-3 flex items-start justify-between">
              <div>
                <div className="text-xl font-black uppercase text-slate-950 tracking-tight font-mono">
                  {company.name}
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5 max-w-lg leading-relaxed">
                  {company.address}
                </div>
                <div className="text-[10px] font-mono text-slate-800 mt-1">
                  <strong>GSTIN:</strong> {company.gstin} | <strong>STATE CODE:</strong> {company.stateCode}
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-900 border border-indigo-200 uppercase">
                  Service Engineering Wing
                </span>
                <div className="text-[9px] text-slate-500 font-mono mt-1">
                  ISO 9001:2015 Industrial Automation
                </div>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="bg-indigo-950 text-white text-center py-2 rounded font-mono font-bold text-sm tracking-widest uppercase mb-4">
              SERVICE WORK & COMMISSIONING REPORT
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 border border-slate-300 rounded p-3 bg-slate-50/80 mb-3">
              <div className="space-y-1">
                <div>
                  <span className="text-slate-500 font-mono text-[10px]">REPORT NUMBER:</span>{' '}
                  <strong className="font-mono text-slate-950 text-xs">{report.reportNo}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-mono text-[10px]">SERVICE DATE:</span>{' '}
                  <strong className="text-slate-900">{formatDate(report.date)}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-mono text-[10px]">SERVICE TIMING:</span>{' '}
                  <span className="font-mono font-medium text-slate-900">
                    {report.startTime} to {report.endTime}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-mono text-[10px]">SERVICE ENGINEER:</span>{' '}
                  <strong className="text-slate-950">{report.engineerName}</strong>
                </div>
              </div>

              <div className="space-y-1 border-l border-slate-300 pl-3">
                <div>
                  <span className="text-slate-500 font-mono text-[10px]">CUSTOMER NAME:</span>{' '}
                  <strong className="text-slate-950">{report.customerName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-mono text-[10px]">SITE LOCATION:</span>{' '}
                  <span className="text-slate-800">{report.siteLocation}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-mono text-[10px]">PROJECT CODE:</span>{' '}
                  <span className="text-slate-800 font-medium">
                    {report.projectName || 'General Automation Service'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-mono text-[10px]">LINKED CHALLAN:</span>{' '}
                  {report.linkedChallanNo ? (
                    <span className="font-mono font-bold text-cyan-800 bg-cyan-100 px-1 rounded text-[10px]">
                      {report.linkedChallanNo}
                    </span>
                  ) : (
                    <span className="text-slate-500 font-mono">None</span>
                  )}
                </div>
              </div>
            </div>

            {/* Equipment Details Card */}
            <div className="border border-slate-300 rounded p-3 mb-3 bg-white">
              <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> PLC / HMI / VFD / Automation System Details
              </div>
              <div className="font-mono text-[11px] font-bold text-slate-900 bg-slate-100/70 p-2 rounded border border-slate-200">
                {report.equipmentDetails || 'Industrial Control System'}
              </div>
            </div>

            {/* Problem Description */}
            <div className="border border-slate-300 rounded p-3 mb-3">
              <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-700 mb-1">
                Problem Description / Site Scope
              </div>
              <p className="text-slate-800 leading-relaxed whitespace-pre-line text-[10px]">
                {report.problemDescription || 'Site commissioning and program verification.'}
              </p>
            </div>

            {/* Work Performed */}
            <div className="border border-slate-300 rounded p-3 mb-3 bg-slate-50/50">
              <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-900 mb-1">
                Engineering Work Carried Out & Tests Executed
              </div>
              <p className="text-slate-800 leading-relaxed whitespace-pre-line text-[10px] font-sans">
                {report.workPerformed}
              </p>
            </div>

            {/* Materials Used */}
            <div className="border border-slate-300 rounded p-3 mb-3">
              <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-700 mb-1">
                Materials & Components Used / Tested
              </div>
              <p className="text-slate-800 text-[10px]">
                {report.materialsUsed || 'Standard site engineering consumables.'}
              </p>
            </div>

            {/* Customer Remarks */}
            <div className="border border-slate-300 rounded p-3 mb-4 bg-emerald-50/40">
              <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-950 mb-1">
                Customer Site Incharge Feedback / Remarks
              </div>
              <p className="text-slate-800 text-[10px] italic">
                “{report.customerRemarks || 'Work carried out satisfactorily.'}”
              </p>
            </div>
          </div>

          {/* Footer & Signatures */}
          <div className="border-t-2 border-slate-900 pt-4 mt-6">
            <div className="grid grid-cols-2 gap-8">
              {/* Customer Signatory */}
              <div className="text-center border border-dashed border-slate-300 rounded p-4">
                <div className="h-12 flex items-center justify-center font-serif text-slate-900 text-sm font-semibold">
                  {report.customerSignatoryName || '(Customer Representative Stamp)'}
                </div>
                <div className="border-t border-slate-400 pt-1 font-bold text-slate-900 text-[10px] uppercase">
                  Customer Sign-Off & Acceptance
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">
                  Name: {report.customerSignatoryName || 'Authorized Signatory'}
                </div>
              </div>

              {/* Service Engineer Signature */}
              <div className="text-center border border-dashed border-slate-300 rounded p-4">
                <div className="h-12 flex items-center justify-center font-serif text-slate-900 text-sm font-bold">
                  {report.engineerName}
                </div>
                <div className="border-t border-slate-400 pt-1 font-bold text-slate-900 text-[10px] uppercase">
                  Service Engineer Signature
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">
                  For {company.name}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[8px] text-slate-400 font-mono mt-4 pt-2 border-t border-slate-200">
              <span>Veyon Field Engineering Service Log • {report.reportNo}</span>
              <span>Page 1 of 1</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
