import React, { useState, useEffect } from 'react';
import {
  X,
  Wrench,
  Building,
  User,
  Calendar,
  Clock,
  Cpu,
  FileCheck,
  CheckCircle,
} from 'lucide-react';
import {
  ServiceReport,
  Customer,
  Project,
  DeliveryChallan,
  UserRole,
} from '../../types';
import { Modal } from '../common/Modal';
import { getNextDocNumber, commitNextDocSequence } from '../../services/numbering';

interface ServiceReportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportToEdit?: ServiceReport | null;
  customers: Customer[];
  projects: Project[];
  challans: DeliveryChallan[];
  prefilledChallan?: DeliveryChallan | null;
  currentRole: UserRole;
  onSave: (report: ServiceReport) => void;
}

export const ServiceReportFormModal: React.FC<ServiceReportFormModalProps> = ({
  isOpen,
  onClose,
  reportToEdit,
  customers,
  projects,
  challans,
  prefilledChallan,
  currentRole,
  onSave,
}) => {
  const isEditing = Boolean(reportToEdit);

  const [reportNo, setReportNo] = useState('');
  const [date, setDate] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [engineerName, setEngineerName] = useState('');

  const [problemDescription, setProblemDescription] = useState('');
  const [workPerformed, setWorkPerformed] = useState('');
  const [materialsUsed, setMaterialsUsed] = useState('');
  const [equipmentDetails, setEquipmentDetails] = useState('');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('06:00 PM');
  const [customerRemarks, setCustomerRemarks] = useState('');
  const [customerSignatoryName, setCustomerSignatoryName] = useState('');

  const [linkedChallanId, setLinkedChallanId] = useState('');
  const [linkedChallanNo, setLinkedChallanNo] = useState('');
  const [status, setStatus] = useState<'Open' | 'In Progress' | 'Completed' | 'Billed'>('Completed');

  const [newSeqNumber, setNewSeqNumber] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (reportToEdit) {
      setReportNo(reportToEdit.reportNo);
      setDate(reportToEdit.date);
      setCustomerId(reportToEdit.customerId);
      setCustomerName(reportToEdit.customerName);
      setProjectId(reportToEdit.projectId || '');
      setProjectName(reportToEdit.projectName || '');
      setSiteLocation(reportToEdit.siteLocation);
      setEngineerName(reportToEdit.engineerName);
      setProblemDescription(reportToEdit.problemDescription);
      setWorkPerformed(reportToEdit.workPerformed);
      setMaterialsUsed(reportToEdit.materialsUsed);
      setEquipmentDetails(reportToEdit.equipmentDetails);
      setStartTime(reportToEdit.startTime);
      setEndTime(reportToEdit.endTime);
      setCustomerRemarks(reportToEdit.customerRemarks);
      setCustomerSignatoryName(reportToEdit.customerSignatoryName);
      setLinkedChallanId(reportToEdit.linkedChallanId || '');
      setLinkedChallanNo(reportToEdit.linkedChallanNo || '');
      setStatus(reportToEdit.status);
      setNewSeqNumber(null);
    } else {
      const generated = getNextDocNumber('report');
      setReportNo(generated.docNo);
      setNewSeqNumber(generated.newSequence);

      const today = new Date().toISOString().split('T')[0];
      setDate(today);

      if (prefilledChallan) {
        setCustomerId(prefilledChallan.customerId);
        setCustomerName(prefilledChallan.customerName);
        setProjectId(prefilledChallan.projectId || '');
        setProjectName(prefilledChallan.projectName || '');
        setSiteLocation(prefilledChallan.deliveryLocation || prefilledChallan.customerAddress);
        setEngineerName(prefilledChallan.engineerName || 'Rohan Sharma (Sr. Systems Engineer)');
        setLinkedChallanId(prefilledChallan.id);
        setLinkedChallanNo(prefilledChallan.challanNo);

        const materialSummary = prefilledChallan.items
          .map((i) => `${i.qty}x ${i.description}`)
          .join(', ');
        setMaterialsUsed(materialSummary);
        setEquipmentDetails(prefilledChallan.items[0]?.description || 'Industrial Automation Controller');
        setProblemDescription('On-site installation, wiring verification and commissioning of delivered hardware.');
        setWorkPerformed('1. Mounted hardware onto control rack. 2. Completed communication checks. 3. Verified IO logic and handed over to plant team.');
      } else {
        setCustomerId('');
        setCustomerName('');
        setProjectId('');
        setProjectName('');
        setSiteLocation('');
        setEngineerName('Rohan Sharma (Sr. Systems Engineer)');
        setProblemDescription('PLC IO Dry runs and communication link diagnosis with central SCADA system.');
        setWorkPerformed('1. Checked PROFINET cable continuity. 2. Loaded updated PLC ladder logic. 3. Fine-tuned VFD acceleration and deceleration ramp rates.');
        setMaterialsUsed('Nil / Client-supplied components');
        setEquipmentDetails('Siemens S7-1200 / ABB ACS580 Drive / Weintek Touch HMI');
        setLinkedChallanId('');
        setLinkedChallanNo('');
      }

      setStartTime('09:00 AM');
      setEndTime('06:00 PM');
      setCustomerRemarks('System tested in manual and auto mode. Working satisfactorily.');
      setCustomerSignatoryName('');
      setStatus('Completed');
    }
  }, [isOpen, reportToEdit, prefilledChallan]);

  const handleCustomerChange = (id: string) => {
    setCustomerId(id);
    const selected = customers.find((c) => c.id === id);
    if (selected) {
      setCustomerName(selected.name);
      setSiteLocation(selected.siteAddress || selected.billingAddress);
      setCustomerSignatoryName(selected.contactPerson);
    }
  };

  const handleProjectChange = (id: string) => {
    setProjectId(id);
    const selected = projects.find((p) => p.id === id);
    if (selected) {
      setProjectName(selected.name);
      if (selected.siteLocation) setSiteLocation(selected.siteLocation);
      if (!customerId && selected.customerId) handleCustomerChange(selected.customerId);
    }
  };

  const handleChallanChange = (id: string) => {
    setLinkedChallanId(id);
    const selected = challans.find((c) => c.id === id);
    if (selected) {
      setLinkedChallanNo(selected.challanNo);
      if (!customerName) {
        setCustomerId(selected.customerId);
        setCustomerName(selected.customerName);
      }
      if (!projectName && selected.projectId) {
        setProjectId(selected.projectId);
        setProjectName(selected.projectName || '');
      }
      if (!siteLocation) {
        setSiteLocation(selected.deliveryLocation || selected.customerAddress);
      }
    } else {
      setLinkedChallanNo('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Please choose or enter a customer.');
      return;
    }

    const currentTimestamp = new Date().toISOString();

    const payload: ServiceReport = {
      id: reportToEdit ? reportToEdit.id : 'sr-' + Date.now(),
      reportNo: reportNo.trim(),
      date,
      customerId: customerId || 'cust-manual',
      customerName: customerName.trim(),
      projectId: projectId || undefined,
      projectName: projectName || undefined,
      siteLocation: siteLocation.trim(),
      engineerName: engineerName.trim(),

      problemDescription: problemDescription.trim(),
      workPerformed: workPerformed.trim(),
      materialsUsed: materialsUsed.trim(),
      equipmentDetails: equipmentDetails.trim(),
      startTime,
      endTime,
      customerRemarks: customerRemarks.trim(),
      customerSignatoryName: customerSignatoryName.trim(),

      linkedChallanId: linkedChallanId || undefined,
      linkedChallanNo: linkedChallanNo || undefined,
      linkedInvoiceId: reportToEdit?.linkedInvoiceId,
      linkedInvoiceNo: reportToEdit?.linkedInvoiceNo,

      status,
      createdAt: reportToEdit?.createdAt || currentTimestamp,
      auditHistory: [
        ...(reportToEdit?.auditHistory || []),
        {
          timestamp: currentTimestamp,
          user: currentRole,
          role: currentRole,
          action: isEditing ? 'Updated Service Report' : `Created Service Report ${reportNo}`,
        },
      ],
    };

    if (!isEditing && newSeqNumber) {
      commitNextDocSequence('report', newSeqNumber);
    }

    onSave(payload);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Service Report: ${reportNo}` : 'New Site Service Work Report'}
      subtitle="Engineering documentation for site commissioning, PLC/HMI/VFD maintenance, and client sign-off"
      size="xl"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" /> Save Service Report
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1: Document Metadata */}
        <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Service Report No. *
              </label>
              <input
                type="text"
                value={reportNo}
                onChange={(e) => setReportNo(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-indigo-400 font-mono font-bold focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Service Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Link to Delivery Challan
              </label>
              <select
                value={linkedChallanId}
                onChange={(e) => handleChallanChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-cyan-400 font-mono focus:outline-hidden focus:border-indigo-500 cursor-pointer"
              >
                <option value="">-- No Linked DC --</option>
                {challans.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.challanNo} - {c.customerName.substring(0, 25)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden focus:border-indigo-500 cursor-pointer"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Billed">Billed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Customer, Project & Engineer */}
        <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Customer *
              </label>
              <select
                value={customerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden focus:border-indigo-500 cursor-pointer"
              >
                <option value="">-- Select Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Project (Optional)
              </label>
              <select
                value={projectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden focus:border-indigo-500 cursor-pointer"
              >
                <option value="">-- Select Project --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.code}] {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Service Engineer *
              </label>
              <input
                type="text"
                value={engineerName}
                onChange={(e) => setEngineerName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Plant / Site Location
              </label>
              <input
                type="text"
                value={siteLocation}
                onChange={(e) => setSiteLocation(e.target.value)}
                placeholder="e.g. Assembly Hall Gate 2, Sanand"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Start Time
                </label>
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="09:00 AM"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  End Time
                </label>
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="06:00 PM"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Engineering Findings & Work Done */}
        <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold mb-1">
              PLC / HMI / VFD Equipment Details
            </label>
            <input
              type="text"
              value={equipmentDetails}
              onChange={(e) => setEquipmentDetails(e.target.value)}
              placeholder="e.g. Siemens S7-1200 CPU 1214C, ABB ACS580 7.5kW Drive, Weintek cMT3102X HMI"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-amber-300 font-mono focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-1">
              Problem Description / Site Condition
            </label>
            <textarea
              rows={2}
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder="Describe customer complaint, site requirements, or breakdown symptoms..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-1">
              Work Performed / Solution Provided
            </label>
            <textarea
              rows={3}
              value={workPerformed}
              onChange={(e) => setWorkPerformed(e.target.value)}
              placeholder="Step-by-step description of technical work done, tests performed, and results..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-1">
              Materials Used / Replaced
            </label>
            <input
              type="text"
              value={materialsUsed}
              onChange={(e) => setMaterialsUsed(e.target.value)}
              placeholder="e.g. 1x Ethernet patch cord, 4x terminal blocks, or refer to DC/2026-27/0001"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Row 4: Client Remarks & Sign-off */}
        <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Customer Feedback / Remarks
              </label>
              <textarea
                rows={2}
                value={customerRemarks}
                onChange={(e) => setCustomerRemarks(e.target.value)}
                placeholder="e.g. Work completed satisfactorily. Production line running normally."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Customer Representative Signatory Name
              </label>
              <input
                type="text"
                value={customerSignatoryName}
                onChange={(e) => setCustomerSignatoryName(e.target.value)}
                placeholder="e.g. Suresh Menon (Plant Head)"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Acknowledges engineering service hours and site performance.
              </p>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};
