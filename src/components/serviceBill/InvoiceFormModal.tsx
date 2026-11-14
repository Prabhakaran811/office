import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Copy,
  Receipt,
  Building,
  Calendar,
  Percent,
  CheckCircle,
  FileCheck,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  ServiceInvoice,
  InvoiceItem,
  Customer,
  Project,
  DeliveryChallan,
  ServiceReport,
  CompanyProfile,
  UserRole,
} from '../../types';
import { Modal } from '../common/Modal';
import { INDUSTRIAL_SERVICES_CATALOG, ServicePreset } from '../../constants/presets';
import {
  getNextDocNumber,
  commitNextDocSequence,
  calculateGST,
  formatCurrency,
} from '../../services/numbering';

interface InvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceToEdit?: ServiceInvoice | null;
  prefilledChallan?: DeliveryChallan | null;
  prefilledReport?: ServiceReport | null;
  company: CompanyProfile;
  customers: Customer[];
  projects: Project[];
  challans: DeliveryChallan[];
  reports: ServiceReport[];
  currentRole: UserRole;
  onSave: (invoice: ServiceInvoice) => void;
}

export const InvoiceFormModal: React.FC<InvoiceFormModalProps> = ({
  isOpen,
  onClose,
  invoiceToEdit,
  prefilledChallan,
  prefilledReport,
  company,
  customers,
  projects,
  challans,
  reports,
  currentRole,
  onSave,
}) => {
  const isEditing = Boolean(invoiceToEdit);

  // Form State
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<any>('Unpaid');
  const [approvalStatus, setApprovalStatus] = useState<'Draft' | 'Approved' | 'Cancelled'>('Draft');

  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [customerState, setCustomerState] = useState('');
  const [customerStateCode, setCustomerStateCode] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [projectId, setProjectId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [poDate, setPoDate] = useState('');
  const [workOrderNumber, setWorkOrderNumber] = useState('');
  const [servicePeriod, setServicePeriod] = useState('');
  const [engineerName, setEngineerName] = useState('');
  const [siteLocation, setSiteLocation] = useState('');

  const [linkedChallanId, setLinkedChallanId] = useState('');
  const [linkedChallanNo, setLinkedChallanNo] = useState('');
  const [linkedServiceReportId, setLinkedServiceReportId] = useState('');
  const [linkedServiceReportNo, setLinkedServiceReportNo] = useState('');

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [gstRate, setGstRate] = useState<number>(18); // Default 18% for automation services

  const [notes, setNotes] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState(
    '1. Payment strictly due within 30 days of invoice date.\n2. In case of delayed payment, interest @ 18% p.a. will be levied.\n3. All disputes subject to Gandhinagar/Ahmedabad jurisdiction.'
  );

  const [newSeqNumber, setNewSeqNumber] = useState<number | null>(null);

  // Initialize
  useEffect(() => {
    if (!isOpen) return;

    if (invoiceToEdit) {
      setInvoiceNo(invoiceToEdit.invoiceNo);
      setInvoiceDate(invoiceToEdit.invoiceDate);
      setDueDate(invoiceToEdit.dueDate);
      setStatus(invoiceToEdit.status);
      setApprovalStatus(invoiceToEdit.approvalStatus);

      setCustomerId(invoiceToEdit.customerId);
      setCustomerName(invoiceToEdit.customerName);
      setBillingAddress(invoiceToEdit.billingAddress);
      setSiteAddress(invoiceToEdit.siteAddress);
      setCustomerGstin(invoiceToEdit.customerGstin);
      setCustomerState(invoiceToEdit.customerState);
      setCustomerStateCode(invoiceToEdit.customerStateCode);
      setContactPerson(invoiceToEdit.contactPerson);
      setEmail(invoiceToEdit.email);
      setPhone(invoiceToEdit.phone);

      setProjectId(invoiceToEdit.projectId || '');
      setProjectName(invoiceToEdit.projectName || '');
      setProjectCode(invoiceToEdit.projectCode || '');
      setPoNumber(invoiceToEdit.poNumber || '');
      setPoDate(invoiceToEdit.poDate || '');
      setWorkOrderNumber(invoiceToEdit.workOrderNumber || '');
      setServicePeriod(invoiceToEdit.servicePeriod || '');
      setEngineerName(invoiceToEdit.engineerName || '');
      setSiteLocation(invoiceToEdit.siteLocation || '');

      setLinkedChallanId(invoiceToEdit.linkedChallanId || '');
      setLinkedChallanNo(invoiceToEdit.linkedChallanNo || '');
      setLinkedServiceReportId(invoiceToEdit.linkedServiceReportId || '');
      setLinkedServiceReportNo(invoiceToEdit.linkedServiceReportNo || '');

      setItems(invoiceToEdit.items.map((i) => ({ ...i })));
      setDiscountPercentage(invoiceToEdit.discountPercentage || 0);
      setGstRate(invoiceToEdit.gstRate || 18);
      setNotes(invoiceToEdit.notes || '');
      setTermsAndConditions(invoiceToEdit.termsAndConditions || '');
      setNewSeqNumber(null);
    } else {
      const generated = getNextDocNumber('invoice');
      setInvoiceNo(generated.docNo);
      setNewSeqNumber(generated.newSequence);

      const today = new Date().toISOString().split('T')[0];
      setInvoiceDate(today);

      // Due date +30 days
      const due = new Date();
      due.setDate(due.getDate() + 30);
      setDueDate(due.toISOString().split('T')[0]);

      setStatus('Unpaid');
      setApprovalStatus('Draft');
      setDiscountPercentage(0);
      setGstRate(18);

      // Prefill from Delivery Challan if given (Module D)
      if (prefilledChallan) {
        setCustomerId(prefilledChallan.customerId);
        setCustomerName(prefilledChallan.customerName);
        setBillingAddress(prefilledChallan.customerAddress);
        setSiteAddress(prefilledChallan.deliveryLocation || prefilledChallan.customerAddress);
        setCustomerGstin(prefilledChallan.customerGstin);
        setCustomerState(prefilledChallan.customerState);
        setCustomerStateCode(prefilledChallan.customerStateCode);
        setContactPerson(prefilledChallan.contactPerson);
        setPhone(prefilledChallan.contactNumber);

        setProjectId(prefilledChallan.projectId || '');
        setProjectName(prefilledChallan.projectName || '');
        setProjectCode(prefilledChallan.projectCode || '');
        setPoNumber(prefilledChallan.poNumber || '');
        setPoDate(prefilledChallan.poDate || '');
        setEngineerName(prefilledChallan.engineerName);
        setSiteLocation(prefilledChallan.deliveryLocation);

        setLinkedChallanId(prefilledChallan.id);
        setLinkedChallanNo(prefilledChallan.challanNo);

        // Prepopulate service items based on delivery
        setItems([
          {
            id: 'invi-' + Date.now(),
            sNo: 1,
            serviceDescription: `Site Installation & Commissioning of items delivered on ${prefilledChallan.challanNo}`,
            sacCode: '998717',
            qty: 2,
            unit: 'Days',
            rate: 12000,
            amount: 24000,
          },
          {
            id: 'invi-' + (Date.now() + 1),
            sNo: 2,
            serviceDescription: 'PLC Programming, Hardware Config & On-Site IO Dry Runs',
            sacCode: '998313',
            qty: 16,
            unit: 'Hours',
            rate: 4500,
            amount: 72000,
          },
        ]);
        setNotes(`Service Bill raised against Delivery Challan ${prefilledChallan.challanNo}.`);
      }
      // Prefill from Service Report if given (Module C)
      else if (prefilledReport) {
        setCustomerId(prefilledReport.customerId);
        setCustomerName(prefilledReport.customerName);
        const matchedCust = customers.find((c) => c.id === prefilledReport.customerId);
        if (matchedCust) {
          setBillingAddress(matchedCust.billingAddress);
          setSiteAddress(matchedCust.siteAddress);
          setCustomerGstin(matchedCust.gstin);
          setCustomerState(matchedCust.state);
          setCustomerStateCode(matchedCust.stateCode);
          setContactPerson(matchedCust.contactPerson);
          setPhone(matchedCust.phone);
          setEmail(matchedCust.email);
        }

        setProjectId(prefilledReport.projectId || '');
        setProjectName(prefilledReport.projectName || '');
        setEngineerName(prefilledReport.engineerName);
        setSiteLocation(prefilledReport.siteLocation);

        setLinkedServiceReportId(prefilledReport.id);
        setLinkedServiceReportNo(prefilledReport.reportNo);

        if (prefilledReport.linkedChallanId) {
          setLinkedChallanId(prefilledReport.linkedChallanId);
          setLinkedChallanNo(prefilledReport.linkedChallanNo || '');
        }

        setItems([
          {
            id: 'invi-' + Date.now(),
            sNo: 1,
            serviceDescription: `Field Engineering Service: ${prefilledReport.equipmentDetails || 'Automation System'}`,
            sacCode: '998717',
            qty: 1,
            unit: 'Job',
            rate: 25000,
            amount: 25000,
          },
          {
            id: 'invi-' + (Date.now() + 1),
            sNo: 2,
            serviceDescription: 'Senior Field Service Engineer Travel & Site Accommodation Allowance',
            sacCode: '996421',
            qty: 1,
            unit: 'Days',
            rate: 6500,
            amount: 6500,
          },
        ]);
        setNotes(`Services certified as per Service Report ${prefilledReport.reportNo}.`);
      } else {
        setCustomerId('');
        setCustomerName('');
        setBillingAddress('');
        setSiteAddress('');
        setCustomerGstin('');
        setCustomerState('');
        setCustomerStateCode('');
        setContactPerson('');
        setEmail('');
        setPhone('');

        setProjectId('');
        setProjectName('');
        setProjectCode('');
        setPoNumber('');
        setPoDate('');
        setWorkOrderNumber('');
        setServicePeriod('');
        setEngineerName('Rohan Sharma');
        setSiteLocation('');

        setLinkedChallanId('');
        setLinkedChallanNo('');
        setLinkedServiceReportId('');
        setLinkedServiceReportNo('');

        setItems([
          {
            id: 'invi-' + Date.now(),
            sNo: 1,
            serviceDescription: 'PLC Programming & Logic Implementation (Siemens/Rockwell/Delta)',
            sacCode: '998313',
            qty: 10,
            unit: 'Hours',
            rate: 4500,
            amount: 45000,
          },
        ]);
        setNotes('Engineering automation services rendered as per agreed project schedule.');
      }
    }
  }, [isOpen, invoiceToEdit, prefilledChallan, prefilledReport]);

  // Customer handler
  const handleCustomerChange = (id: string) => {
    setCustomerId(id);
    const selected = customers.find((c) => c.id === id);
    if (selected) {
      setCustomerName(selected.name);
      setBillingAddress(selected.billingAddress);
      setSiteAddress(selected.siteAddress);
      setCustomerGstin(selected.gstin);
      setCustomerState(selected.state);
      setCustomerStateCode(selected.stateCode);
      setContactPerson(selected.contactPerson);
      setEmail(selected.email);
      setPhone(selected.phone);
    }
  };

  // Project handler
  const handleProjectChange = (id: string) => {
    setProjectId(id);
    const selected = projects.find((p) => p.id === id);
    if (selected) {
      setProjectName(selected.name);
      setProjectCode(selected.code);
      setPoNumber(selected.poNumber);
      setPoDate(selected.poDate);
      if (selected.siteLocation) setSiteLocation(selected.siteLocation);
      if (!customerId && selected.customerId) handleCustomerChange(selected.customerId);
    }
  };

  // Item Table handlers
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: 'invi-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      sNo: items.length + 1,
      serviceDescription: '',
      sacCode: '998313',
      qty: 1,
      unit: 'Hours',
      rate: 4500,
      amount: 4500,
    };
    setItems([...items, newItem]);
  };

  const handleQuickAddPreset = (preset: ServicePreset) => {
    const newItem: InvoiceItem = {
      id: 'invi-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      sNo: items.length + 1,
      serviceDescription: preset.description,
      sacCode: preset.sacCode,
      qty: 1,
      unit: preset.unit,
      rate: preset.defaultRate,
      amount: preset.defaultRate,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    const target = { ...updated[index], [field]: value };
    if (field === 'qty' || field === 'rate') {
      const q = field === 'qty' ? Number(value) || 0 : Number(target.qty) || 0;
      const r = field === 'rate' ? Number(value) || 0 : Number(target.rate) || 0;
      target.amount = Math.round(q * r * 100) / 100;
    }
    updated[index] = target;
    setItems(updated);
  };

  const handleDeleteItem = (index: number) => {
    if (items.length <= 1) return;
    const updated = items.filter((_, i) => i !== index).map((it, idx) => ({ ...it, sNo: idx + 1 }));
    setItems(updated);
  };

  const handleDuplicateItem = (index: number) => {
    const target = items[index];
    const dup: InvoiceItem = {
      ...target,
      id: 'invi-' + Date.now(),
      sNo: items.length + 1,
    };
    setItems([...items, dup]);
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const taxResults = calculateGST(
    subtotal,
    discountPercentage,
    gstRate,
    company.stateCode,
    customerStateCode
  );

  const handleSubmit = (targetApproval?: 'Draft' | 'Approved') => {
    if (!invoiceNo.trim()) {
      alert('Please enter an Invoice Number.');
      return;
    }
    if (!customerName.trim()) {
      alert('Please select or enter Customer Name.');
      return;
    }
    if (items.length === 0 || !items[0].serviceDescription.trim()) {
      alert('Please enter at least one service item.');
      return;
    }

    const currentTimestamp = new Date().toISOString();
    const finalApproval = targetApproval || approvalStatus;

    // Preserve previously paid amount if editing
    const currentPaid = invoiceToEdit ? invoiceToEdit.amountPaid : 0;
    const remainingBalance = Math.max(0, taxResults.grandTotal - currentPaid);
    const calculatedPaymentStatus =
      currentPaid >= taxResults.grandTotal && taxResults.grandTotal > 0
        ? 'Paid'
        : currentPaid > 0
        ? 'Partially Paid'
        : 'Unpaid';

    const payload: ServiceInvoice = {
      id: invoiceToEdit ? invoiceToEdit.id : 'inv-' + Date.now(),
      invoiceNo: invoiceNo.trim(),
      invoiceDate: invoiceDate || currentTimestamp.split('T')[0],
      dueDate: dueDate || invoiceDate,
      status: calculatedPaymentStatus,
      approvalStatus: finalApproval,

      customerId: customerId || 'cust-manual',
      customerName: customerName.trim(),
      billingAddress: billingAddress.trim(),
      siteAddress: siteAddress.trim(),
      customerGstin: customerGstin.trim(),
      customerState: customerState.trim(),
      customerStateCode: customerStateCode.trim(),
      contactPerson: contactPerson.trim(),
      email: email.trim(),
      phone: phone.trim(),

      projectId: projectId || undefined,
      projectName: projectName || undefined,
      projectCode: projectCode || undefined,
      poNumber: poNumber || undefined,
      poDate: poDate || undefined,
      workOrderNumber: workOrderNumber || undefined,
      servicePeriod: servicePeriod || undefined,
      engineerName: engineerName.trim() || undefined,
      siteLocation: siteLocation.trim() || undefined,

      linkedChallanId: linkedChallanId || undefined,
      linkedChallanNo: linkedChallanNo || undefined,
      linkedServiceReportId: linkedServiceReportId || undefined,
      linkedServiceReportNo: linkedServiceReportNo || undefined,

      items: items.map((it, idx) => ({
        ...it,
        sNo: idx + 1,
        qty: Number(it.qty) || 1,
        rate: Number(it.rate) || 0,
        amount: Math.round((Number(it.qty) || 1) * (Number(it.rate) || 0) * 100) / 100,
      })),

      subtotal,
      discountPercentage,
      discountAmount: taxResults.discountAmount,
      taxableValue: taxResults.taxableValue,

      gstRate,
      isInterState: taxResults.isInterState,
      cgstRate: taxResults.cgstRate,
      cgstAmount: taxResults.cgstAmount,
      sgstRate: taxResults.sgstRate,
      sgstAmount: taxResults.sgstAmount,
      igstRate: taxResults.igstRate,
      igstAmount: taxResults.igstAmount,
      totalTax: taxResults.totalTax,

      roundOff: taxResults.roundOff,
      grandTotal: taxResults.grandTotal,

      amountPaid: currentPaid,
      balanceAmount: remainingBalance,

      notes: notes.trim(),
      termsAndConditions: termsAndConditions.trim(),

      auditHistory: [
        ...(invoiceToEdit?.auditHistory || []),
        {
          timestamp: currentTimestamp,
          user: currentRole,
          role: currentRole,
          action: isEditing
            ? `Updated Service Bill (${finalApproval})`
            : `Created Service Bill ${invoiceNo} (${finalApproval})`,
        },
      ],
      createdAt: invoiceToEdit?.createdAt || currentTimestamp,
      updatedAt: currentTimestamp,
      createdBy: invoiceToEdit?.createdBy || currentRole,
    };

    if (!isEditing && newSeqNumber) {
      commitNextDocSequence('invoice', newSeqNumber);
    }

    onSave(payload);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Service Bill: ${invoiceNo}` : 'Create GST Service Bill / Invoice'}
      subtitle="Engineering and industrial automation service billing with automatic state-based GST calculation"
      size="2xl"
      footer={
        <div className="flex flex-wrap items-center justify-between w-full gap-2">
          <div className="text-xs text-slate-300">
            Grand Total:{' '}
            <strong className="text-amber-400 font-mono text-base font-bold">
              {formatCurrency(taxResults.grandTotal)}
            </strong>
            <span className="text-slate-500 text-[10px] ml-2">
              ({taxResults.isInterState ? `IGST ${taxResults.igstRate}%` : `CGST ${taxResults.cgstRate}% + SGST ${taxResults.sgstRate}%`})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('Draft')}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('Approved')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
            >
              <FileCheck className="w-4 h-4" /> Save & Final Approve
            </button>
          </div>
        </div>
      }
    >
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-5">
        {/* Row 1: Document Identifiers & Dates */}
        <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-2">
              <Receipt className="w-4 h-4" /> Invoice Details & References
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              Company GST State: {company.state} ({company.stateCode})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Invoice Number *
              </label>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-emerald-400 font-mono font-bold focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Invoice Date *
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Payment Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Approval Status
              </label>
              <select
                value={approvalStatus}
                onChange={(e) => setApprovalStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden focus:border-emerald-500 cursor-pointer"
              >
                <option value="Draft">Draft (Editable)</option>
                <option value="Approved">Approved (Final)</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* References: PO, Work Order, Linked DC, Linked SR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Ref Delivery Challan (Module D)
              </label>
              <select
                value={linkedChallanId}
                onChange={(e) => {
                  setLinkedChallanId(e.target.value);
                  const c = challans.find((ch) => ch.id === e.target.value);
                  setLinkedChallanNo(c ? c.challanNo : '');
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-cyan-400 font-mono focus:outline-hidden cursor-pointer"
              >
                <option value="">-- No Challan Link --</option>
                {challans.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.challanNo} ({c.customerName.substring(0, 20)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Ref Service Report (Module C)
              </label>
              <select
                value={linkedServiceReportId}
                onChange={(e) => {
                  setLinkedServiceReportId(e.target.value);
                  const r = reports.find((rep) => rep.id === e.target.value);
                  setLinkedServiceReportNo(r ? r.reportNo : '');
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-indigo-400 font-mono focus:outline-hidden cursor-pointer"
              >
                <option value="">-- No Report Link --</option>
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.reportNo} ({r.engineerName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                PO / Work Order Number
              </label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="PO-2026-..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Service Period
              </label>
              <input
                type="text"
                value={servicePeriod}
                onChange={(e) => setServicePeriod(e.target.value)}
                placeholder="e.g. 15-Apr to 20-Apr 2026"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Customer Details & GST State */}
        <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-2">
              <Building className="w-4 h-4" /> Customer & Billing Information
            </h4>
            <div className="text-[11px] text-amber-400 font-mono">
              {customerStateCode === company.stateCode
                ? `Intra-State: CGST (${gstRate / 2}%) + SGST (${gstRate / 2}%)`
                : `Inter-State: IGST (${gstRate}%)`}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Select Customer Preset
              </label>
              <select
                value={customerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden cursor-pointer"
              >
                <option value="">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.stateCode} - {c.state})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Link Project
              </label>
              <select
                value={projectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden cursor-pointer"
              >
                <option value="">-- Select Project --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.code}] {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Customer GSTIN
              </label>
              <input
                type="text"
                value={customerGstin}
                onChange={(e) => setCustomerGstin(e.target.value)}
                placeholder="24AAACT1234A1ZP"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white font-mono focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Billing Address
              </label>
              <input
                type="text"
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Customer State
                </label>
                <input
                  type="text"
                  value={customerState}
                  onChange={(e) => setCustomerState(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  State Code *
                </label>
                <input
                  type="text"
                  value={customerStateCode}
                  onChange={(e) => setCustomerStateCode(e.target.value)}
                  placeholder="24"
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-amber-300 font-mono font-bold focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Service Item Table */}
        <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-2">
                <Layers className="w-4 h-4" /> Service Item Table
              </h4>
              <p className="text-[11px] text-slate-400">
                PLC, HMI, SCADA programming, commissioning, VFD config, wiring, site visits
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                onChange={(e) => {
                  const idx = parseInt(e.target.value, 10);
                  if (!isNaN(idx) && INDUSTRIAL_SERVICES_CATALOG[idx]) {
                    handleQuickAddPreset(INDUSTRIAL_SERVICES_CATALOG[idx]);
                    e.target.value = '';
                  }
                }}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium cursor-pointer focus:outline-hidden"
                defaultValue=""
              >
                <option value="" disabled>
                  + Add Preset Service Catalog Item
                </option>
                {INDUSTRIAL_SERVICES_CATALOG.map((srv, idx) => (
                  <option key={idx} value={idx} className="bg-slate-900 text-white">
                    {srv.description} (SAC: {srv.sacCode})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Add Blank Row
              </button>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-2 py-2 w-8 text-center">#</th>
                  <th className="px-2 py-2 min-w-[240px]">Service Description *</th>
                  <th className="px-2 py-2 w-24">SAC Code</th>
                  <th className="px-2 py-2 w-20 text-right">Qty *</th>
                  <th className="px-2 py-2 w-24">Unit</th>
                  <th className="px-2 py-2 w-28 text-right">Rate (₹) *</th>
                  <th className="px-2 py-2 w-28 text-right">Amount (₹)</th>
                  <th className="px-2 py-2 w-16 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-800/40">
                    <td className="px-2 py-2 text-center font-mono text-slate-500">{index + 1}</td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={item.serviceDescription}
                        onChange={(e) => handleUpdateItem(index, 'serviceDescription', e.target.value)}
                        placeholder="e.g. PLC Commissioning & Dry Runs"
                        required
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-hidden focus:border-emerald-500"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={item.sacCode}
                        onChange={(e) => handleUpdateItem(index, 'sacCode', e.target.value)}
                        placeholder="998313"
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono focus:outline-hidden focus:border-emerald-500"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={item.qty}
                        onChange={(e) => handleUpdateItem(index, 'qty', e.target.value)}
                        required
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white text-right font-mono focus:outline-hidden focus:border-emerald-500"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <select
                        value={item.unit}
                        onChange={(e) => handleUpdateItem(index, 'unit', e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-hidden focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="Hours">Hours</option>
                        <option value="Days">Days</option>
                        <option value="Units">Units</option>
                        <option value="Points">Points</option>
                        <option value="Job">Job</option>
                        <option value="Visit">Visit</option>
                        <option value="Node">Node</option>
                        <option value="Sets">Sets</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min="0"
                        value={item.rate}
                        onChange={(e) => handleUpdateItem(index, 'rate', e.target.value)}
                        required
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white text-right font-mono focus:outline-hidden focus:border-emerald-500"
                      />
                    </td>
                    <td className="px-2 py-2 text-right font-mono font-bold text-white">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDuplicateItem(index)}
                          title="Duplicate row"
                          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(index)}
                          disabled={items.length <= 1}
                          title="Remove row"
                          className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-700 cursor-pointer disabled:opacity-30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Row 4: Calculation Summary & GST Logic */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Notes & Terms */}
          <div className="space-y-4">
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                Invoice Notes / Service Description Summary
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes shown on invoice..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-hidden"
              />
            </div>
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                Terms & Conditions
              </label>
              <textarea
                rows={3}
                value={termsAndConditions}
                onChange={(e) => setTermsAndConditions(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Amount Calculation Panel */}
          <div className="bg-slate-850 p-5 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
            <h4 className="font-mono uppercase tracking-wider text-amber-400 font-semibold border-b border-slate-800 pb-2">
              GST Tax Calculation Summary
            </h4>

            {/* Subtotal */}
            <div className="flex items-center justify-between text-slate-300">
              <span>Subtotal:</span>
              <span className="font-bold">{formatCurrency(subtotal)}</span>
            </div>

            {/* Discount */}
            <div className="flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-2">
                <span>Discount (%):</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(Number(e.target.value) || 0)}
                  className="w-16 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-center text-xs text-white"
                />
              </div>
              <span className="text-amber-400">-{formatCurrency(taxResults.discountAmount)}</span>
            </div>

            {/* Taxable Value */}
            <div className="flex items-center justify-between text-white font-semibold pt-2 border-t border-slate-800">
              <span>Taxable Value:</span>
              <span>{formatCurrency(taxResults.taxableValue)}</span>
            </div>

            {/* GST Rate Selector */}
            <div className="flex items-center justify-between text-slate-300 pt-1">
              <span>GST Rate:</span>
              <select
                value={gstRate}
                onChange={(e) => setGstRate(Number(e.target.value))}
                className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-amber-300 font-bold cursor-pointer"
              >
                <option value={0}>0% GST</option>
                <option value={5}>5% GST</option>
                <option value={12}>12% GST</option>
                <option value={18}>18% GST (Standard Automation)</option>
                <option value={28}>28% GST</option>
              </select>
            </div>

            {/* Tax Breakdown */}
            {taxResults.isInterState ? (
              <div className="flex items-center justify-between text-purple-400 bg-purple-950/30 p-2 rounded border border-purple-800/40">
                <span>IGST ({taxResults.igstRate}% - Inter-State):</span>
                <span>+{formatCurrency(taxResults.igstAmount)}</span>
              </div>
            ) : (
              <div className="space-y-1 bg-cyan-950/30 p-2 rounded border border-cyan-800/40">
                <div className="flex items-center justify-between text-cyan-400">
                  <span>CGST ({taxResults.cgstRate}% - Central):</span>
                  <span>+{formatCurrency(taxResults.cgstAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-cyan-400">
                  <span>SGST ({taxResults.sgstRate}% - State):</span>
                  <span>+{formatCurrency(taxResults.sgstAmount)}</span>
                </div>
              </div>
            )}

            {/* Round Off */}
            <div className="flex items-center justify-between text-slate-400">
              <span>Round Off:</span>
              <span>{taxResults.roundOff >= 0 ? `+${taxResults.roundOff}` : taxResults.roundOff}</span>
            </div>

            {/* Grand Total */}
            <div className="flex items-center justify-between text-white text-base font-bold pt-2 border-t-2 border-slate-700">
              <span>Grand Total:</span>
              <span className="text-amber-400">{formatCurrency(taxResults.grandTotal)}</span>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};
