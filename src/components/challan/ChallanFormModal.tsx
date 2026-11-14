import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Copy,
  Sparkles,
  Truck,
  Building,
  User,
  Calendar,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import {
  DeliveryChallan,
  ChallanItem,
  ChallanType,
  ChallanStatus,
  Customer,
  Project,
  UserRole,
} from '../../types';
import { Modal } from '../common/Modal';
import { INDUSTRIAL_ITEMS_CATALOG, ItemPreset } from '../../constants/presets';
import { getNextDocNumber, commitNextDocSequence } from '../../services/numbering';

interface ChallanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  challanToEdit?: DeliveryChallan | null;
  customers: Customer[];
  projects: Project[];
  currentRole: UserRole;
  onSave: (challan: DeliveryChallan) => void;
}

export const ChallanFormModal: React.FC<ChallanFormModalProps> = ({
  isOpen,
  onClose,
  challanToEdit,
  customers,
  projects,
  currentRole,
  onSave,
}) => {
  const isEditing = Boolean(challanToEdit);

  // Form State
  const [challanNo, setChallanNo] = useState('');
  const [challanDate, setChallanDate] = useState('');
  const [challanType, setChallanType] = useState<ChallanType>('Supply / Delivery');
  const [status, setStatus] = useState<ChallanStatus>('Draft');

  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [customerState, setCustomerState] = useState('');
  const [customerStateCode, setCustomerStateCode] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const [projectId, setProjectId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [poDate, setPoDate] = useState('');

  const [engineerName, setEngineerName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [transporterName, setTransporterName] = useState('');
  const [ewayBillNo, setEwayBillNo] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [purposeOfDelivery, setPurposeOfDelivery] = useState('');

  const [items, setItems] = useState<ChallanItem[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState(
    '1. Materials delivered strictly against purchase order specifications.\n2. Any transit damage or discrepancy must be notified in writing within 48 hours of receipt.\n3. Goods received in good condition.'
  );

  const [newSeqNumber, setNewSeqNumber] = useState<number | null>(null);

  // Initialize or reset form
  useEffect(() => {
    if (!isOpen) return;

    if (challanToEdit) {
      setChallanNo(challanToEdit.challanNo);
      setChallanDate(challanToEdit.challanDate);
      setChallanType(challanToEdit.challanType);
      setStatus(challanToEdit.status);

      setCustomerId(challanToEdit.customerId);
      setCustomerName(challanToEdit.customerName);
      setCustomerAddress(challanToEdit.customerAddress);
      setCustomerGstin(challanToEdit.customerGstin);
      setCustomerState(challanToEdit.customerState);
      setCustomerStateCode(challanToEdit.customerStateCode);
      setContactPerson(challanToEdit.contactPerson);
      setContactNumber(challanToEdit.contactNumber);

      setProjectId(challanToEdit.projectId || '');
      setProjectName(challanToEdit.projectName || '');
      setProjectCode(challanToEdit.projectCode || '');
      setPoNumber(challanToEdit.poNumber || '');
      setPoDate(challanToEdit.poDate || '');

      setEngineerName(challanToEdit.engineerName);
      setVehicleNumber(challanToEdit.vehicleNumber);
      setTransporterName(challanToEdit.transporterName);
      setEwayBillNo(challanToEdit.ewayBillNo || '');
      setDeliveryLocation(challanToEdit.deliveryLocation);
      setPurposeOfDelivery(challanToEdit.purposeOfDelivery);

      setItems(challanToEdit.items.map((it) => ({ ...it })));
      setSpecialInstructions(challanToEdit.specialInstructions || '');
      setTermsAndConditions(challanToEdit.termsAndConditions || '');
      setNewSeqNumber(null);
    } else {
      const generated = getNextDocNumber('challan');
      setChallanNo(generated.docNo);
      setNewSeqNumber(generated.newSequence);

      const today = new Date().toISOString().split('T')[0];
      setChallanDate(today);
      setChallanType('Supply / Delivery');
      setStatus('Draft');

      setCustomerId('');
      setCustomerName('');
      setCustomerAddress('');
      setCustomerGstin('');
      setCustomerState('');
      setCustomerStateCode('');
      setContactPerson('');
      setContactNumber('');

      setProjectId('');
      setProjectName('');
      setProjectCode('');
      setPoNumber('');
      setPoDate('');

      setEngineerName('Rohan Sharma (Site Engineer)');
      setVehicleNumber('');
      setTransporterName('Direct Road Transport');
      setEwayBillNo('');
      setDeliveryLocation('');
      setPurposeOfDelivery('Supply of Industrial Automation Material');

      setItems([
        {
          id: 'item-' + Date.now(),
          sNo: 1,
          description: '',
          partNo: '',
          hsnSac: '85371090',
          qty: 1,
          unit: 'Nos',
          serialNo: '',
          remarks: 'New material in factory packaging',
        },
      ]);
      setSpecialInstructions('Handle with care. Protect from rain and physical impact.');
    }
  }, [isOpen, challanToEdit]);

  // Customer Select Handler
  const handleCustomerChange = (selectedId: string) => {
    setCustomerId(selectedId);
    const selected = customers.find((c) => c.id === selectedId);
    if (selected) {
      setCustomerName(selected.name);
      setCustomerAddress(selected.billingAddress);
      setCustomerGstin(selected.gstin);
      setCustomerState(selected.state);
      setCustomerStateCode(selected.stateCode);
      setContactPerson(selected.contactPerson);
      setContactNumber(selected.phone);
      if (!deliveryLocation) {
        setDeliveryLocation(selected.siteAddress || selected.billingAddress);
      }
    }
  };

  // Project Select Handler
  const handleProjectChange = (selectedId: string) => {
    setProjectId(selectedId);
    const selected = projects.find((p) => p.id === selectedId);
    if (selected) {
      setProjectName(selected.name);
      setProjectCode(selected.code);
      setPoNumber(selected.poNumber);
      setPoDate(selected.poDate);
      if (selected.siteLocation) {
        setDeliveryLocation(selected.siteLocation);
      }
      if (!customerId && selected.customerId) {
        handleCustomerChange(selected.customerId);
      }
    }
  };

  // Item Table Handlers
  const handleAddItem = () => {
    const newItem: ChallanItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      sNo: items.length + 1,
      description: '',
      partNo: '',
      hsnSac: '85371090',
      qty: 1,
      unit: 'Nos',
      serialNo: '',
      remarks: '',
    };
    setItems([...items, newItem]);
  };

  const handleQuickAddPreset = (preset: ItemPreset) => {
    const newItem: ChallanItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      sNo: items.length + 1,
      description: preset.description,
      partNo: preset.partNo,
      hsnSac: preset.hsnSac,
      qty: 1,
      unit: preset.unit,
      serialNo: 'SN-' + Math.floor(100000 + Math.random() * 900000),
      remarks: preset.defaultRemarks || '',
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (index: number, field: keyof ChallanItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleDeleteItem = (index: number) => {
    if (items.length <= 1) return;
    const updated = items.filter((_, i) => i !== index).map((it, idx) => ({ ...it, sNo: idx + 1 }));
    setItems(updated);
  };

  const handleDuplicateItem = (index: number) => {
    const target = items[index];
    const duplicated: ChallanItem = {
      ...target,
      id: 'item-' + Date.now(),
      sNo: items.length + 1,
      serialNo: '',
    };
    setItems([...items, duplicated]);
  };

  const totalQuantity = items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);

  // Form Submission
  const handleSubmit = (finalStatus?: ChallanStatus) => {
    if (!challanNo.trim()) {
      alert('Please enter a valid Challan Number.');
      return;
    }
    if (!customerName.trim()) {
      alert('Please select or enter a Customer Name.');
      return;
    }
    if (items.length === 0 || !items[0].description.trim()) {
      alert('Please add at least one item description.');
      return;
    }

    const currentTimestamp = new Date().toISOString();
    const effectiveStatus = finalStatus || status;

    const payload: DeliveryChallan = {
      id: challanToEdit ? challanToEdit.id : 'dc-' + Date.now(),
      challanNo: challanNo.trim(),
      challanDate: challanDate || currentTimestamp.split('T')[0],
      challanType,
      status: effectiveStatus,

      customerId: customerId || 'cust-manual',
      customerName: customerName.trim(),
      customerAddress: customerAddress.trim(),
      customerGstin: customerGstin.trim(),
      customerState: customerState.trim(),
      customerStateCode: customerStateCode.trim(),
      contactPerson: contactPerson.trim(),
      contactNumber: contactNumber.trim(),

      projectId: projectId || undefined,
      projectName: projectName || undefined,
      projectCode: projectCode || undefined,
      poNumber: poNumber || undefined,
      poDate: poDate || undefined,

      engineerName: engineerName.trim(),
      vehicleNumber: vehicleNumber.trim(),
      transporterName: transporterName.trim(),
      ewayBillNo: ewayBillNo.trim() || undefined,
      deliveryLocation: deliveryLocation.trim(),
      purposeOfDelivery: purposeOfDelivery.trim(),

      items: items.map((it, idx) => ({
        ...it,
        sNo: idx + 1,
        qty: Number(it.qty) || 1,
      })),
      totalQty: totalQuantity,

      specialInstructions: specialInstructions.trim(),
      termsAndConditions: termsAndConditions.trim(),
      receiverName: challanToEdit?.receiverName,
      receiverSignatureDate: challanToEdit?.receiverSignatureDate,

      linkedServiceReportId: challanToEdit?.linkedServiceReportId,
      linkedInvoiceId: challanToEdit?.linkedInvoiceId,

      auditHistory: [
        ...(challanToEdit?.auditHistory || []),
        {
          timestamp: currentTimestamp,
          user: currentRole,
          role: currentRole,
          action: isEditing
            ? `Updated Challan (Status: ${effectiveStatus})`
            : `Created Challan ${challanNo} (${effectiveStatus})`,
        },
      ],
      createdAt: challanToEdit?.createdAt || currentTimestamp,
      updatedAt: currentTimestamp,
      createdBy: challanToEdit?.createdBy || currentRole,
    };

    if (!isEditing && newSeqNumber) {
      commitNextDocSequence('challan', newSeqNumber);
    }

    onSave(payload);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Delivery Challan: ${challanNo}` : 'Create New Delivery Challan'}
      subtitle="GST-compliant consignment delivery documentation with industrial equipment tracking"
      size="2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-400">
            Total Items: <strong className="text-white font-mono">{items.length}</strong> | Total Qty:{' '}
            <strong className="text-amber-400 font-mono">{totalQuantity}</strong>
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
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('Approved')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              Save & Approve Challan
            </button>
          </div>
        </div>
      }
    >
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
        {/* Section 1: Numbering, Dates, Type & Status */}
        <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-2">
              <Truck className="w-4 h-4" /> Document & Challan Type
            </h4>
            <span className="text-[11px] font-mono text-slate-400">Financial Year 2026-27</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Delivery Challan No. *
              </label>
              <input
                type="text"
                value={challanNo}
                onChange={(e) => setChallanNo(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-cyan-400 font-mono font-bold focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Challan Date *
              </label>
              <input
                type="date"
                value={challanDate}
                onChange={(e) => setChallanDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Challan Type *
              </label>
              <select
                value={challanType}
                onChange={(e) => setChallanType(e.target.value as ChallanType)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-amber-300 font-medium focus:outline-hidden focus:border-cyan-500 cursor-pointer"
              >
                <option value="Supply / Delivery">1. Supply / Delivery</option>
                <option value="Returnable Material">2. Returnable Material</option>
                <option value="Non-Returnable Material">3. Non-Returnable Material</option>
                <option value="Material Sent for Service">4. Material Sent for Service</option>
                <option value="Material Sent for Repair">5. Material Sent for Repair</option>
                <option value="Material Sent for Testing">6. Material Sent for Testing</option>
                <option value="Project Site Material">7. Project Site Material</option>
                <option value="Replacement Material">8. Replacement Material</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ChallanStatus)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden focus:border-cyan-500 cursor-pointer"
              >
                <option value="Draft">Draft</option>
                <option value="Approved">Approved</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Delivered">Delivered</option>
                <option value="Partially Delivered">Partially Delivered</option>
                <option value="Returned">Returned</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Customer & Project Details */}
        <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-2">
              <Building className="w-4 h-4" /> Customer & Project Information
            </h4>
            <div className="text-[11px] text-slate-400">
              Select existing customer or project to auto-fill
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Customer Picker */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Select Customer Preset
              </label>
              <select
                value={customerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden focus:border-cyan-500 cursor-pointer"
              >
                <option value="">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.stateCode} - {c.state})
                  </option>
                ))}
              </select>
            </div>

            {/* Project Picker */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Link to Project (Optional)
              </label>
              <select
                value={projectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden focus:border-cyan-500 cursor-pointer"
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

          {/* Customer Details Row */}
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
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden focus:border-cyan-500"
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
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white font-mono focus:outline-hidden focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Customer Address / Plant Location
              </label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden focus:border-cyan-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={customerState}
                  onChange={(e) => setCustomerState(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  State Code
                </label>
                <input
                  type="text"
                  value={customerStateCode}
                  onChange={(e) => setCustomerStateCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-hidden focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Contact Number
              </label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                PO / Work Order Ref
              </label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="PO-2026-..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-hidden focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                PO Date
              </label>
              <input
                type="date"
                value={poDate}
                onChange={(e) => setPoDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Logistics & Transporter Details */}
        <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-2 border-b border-slate-800 pb-2">
            <User className="w-4 h-4" /> Logistics, Vehicle & Delivery Details
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Engineer / Responsible Person
              </label>
              <input
                type="text"
                value={engineerName}
                onChange={(e) => setEngineerName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Vehicle Number
              </label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="GJ-01-XX-0000"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white font-mono focus:outline-hidden focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Transporter Name
              </label>
              <input
                type="text"
                value={transporterName}
                onChange={(e) => setTransporterName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                E-Way Bill Number (Optional)
              </label>
              <input
                type="text"
                value={ewayBillNo}
                onChange={(e) => setEwayBillNo(e.target.value)}
                placeholder="241098234190"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white font-mono focus:outline-hidden focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Delivery Site Location
              </label>
              <input
                type="text"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                placeholder="e.g. Line 3 Receiving Bay"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Purpose of Delivery
              </label>
              <input
                type="text"
                value={purposeOfDelivery}
                onChange={(e) => setPurposeOfDelivery(e.target.value)}
                placeholder="e.g. Site Installation / Calibration"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Editable Item Table */}
        <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-2">
                <Truck className="w-4 h-4" /> Item Details Table
              </h4>
              <p className="text-[11px] text-slate-400">
                Support for PLCs, HMIs, VFDs, Sensors, Control panels, Gateways, Cables, Tools & Spares
              </p>
            </div>

            {/* Quick Catalog Presets Dropdown */}
            <div className="flex items-center gap-2">
              <select
                onChange={(e) => {
                  const idx = parseInt(e.target.value, 10);
                  if (!isNaN(idx) && INDUSTRIAL_ITEMS_CATALOG[idx]) {
                    handleQuickAddPreset(INDUSTRIAL_ITEMS_CATALOG[idx]);
                    e.target.value = '';
                  }
                }}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium cursor-pointer focus:outline-hidden"
                defaultValue=""
              >
                <option value="" disabled>
                  + Add from Industrial Catalog Preset
                </option>
                {INDUSTRIAL_ITEMS_CATALOG.map((item, idx) => (
                  <option key={idx} value={idx} className="bg-slate-900 text-white">
                    [{item.category}] {item.description.substring(0, 45)}...
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Add Blank Row
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-2 py-2 w-8 text-center">#</th>
                  <th className="px-2 py-2 min-w-[200px]">Item Description *</th>
                  <th className="px-2 py-2 w-28">Part No</th>
                  <th className="px-2 py-2 w-24">HSN/SAC</th>
                  <th className="px-2 py-2 w-16 text-right">Qty *</th>
                  <th className="px-2 py-2 w-20">Unit</th>
                  <th className="px-2 py-2 min-w-[150px]">Serial No. / Tag</th>
                  <th className="px-2 py-2 min-w-[140px]">Remarks</th>
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
                        value={item.description}
                        onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                        placeholder="e.g. Siemens S7-1200 CPU 1214C"
                        required
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-hidden focus:border-cyan-500"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={item.partNo}
                        onChange={(e) => handleUpdateItem(index, 'partNo', e.target.value)}
                        placeholder="6ES7214-..."
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono focus:outline-hidden focus:border-cyan-500"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={item.hsnSac}
                        onChange={(e) => handleUpdateItem(index, 'hsnSac', e.target.value)}
                        placeholder="85371090"
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono focus:outline-hidden focus:border-cyan-500"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => handleUpdateItem(index, 'qty', e.target.value)}
                        required
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white text-right font-mono focus:outline-hidden focus:border-cyan-500"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <select
                        value={item.unit}
                        onChange={(e) => handleUpdateItem(index, 'unit', e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-hidden focus:border-cyan-500 cursor-pointer"
                      >
                        <option value="Nos">Nos</option>
                        <option value="Sets">Sets</option>
                        <option value="Mtrs">Mtrs</option>
                        <option value="Pcs">Pcs</option>
                        <option value="Box">Box</option>
                        <option value="Lots">Lots</option>
                        <option value="Roll">Roll</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={item.serialNo}
                        onChange={(e) => handleUpdateItem(index, 'serialNo', e.target.value)}
                        placeholder="SN-10294, SN-10295"
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-amber-300 font-mono focus:outline-hidden focus:border-cyan-500"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={item.remarks}
                        onChange={(e) => handleUpdateItem(index, 'remarks', e.target.value)}
                        placeholder="e.g. Pre-programmed"
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 focus:outline-hidden focus:border-cyan-500"
                      />
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

        {/* Section 5: Special Instructions & Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
              Special Handling / Storage Instructions
            </label>
            <textarea
              rows={3}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Fragile electronic items. Store under controlled humidity."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500"
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
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
