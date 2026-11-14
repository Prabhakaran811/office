import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Building,
  Phone,
  Mail,
  Receipt,
  ArrowRight,
} from 'lucide-react';
import { Customer, ServiceInvoice, Project, UserRole } from '../../types';
import { formatCurrency } from '../../services/numbering';
import { Modal } from '../common/Modal';

interface CustomerListViewProps {
  customers: Customer[];
  invoices: ServiceInvoice[];
  projects: Project[];
  currentRole: UserRole;
  onSaveCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onViewLedgerForCustomer: (customerId: string) => void;
}

export const CustomerListView: React.FC<CustomerListViewProps> = ({
  customers,
  invoices,
  projects,
  currentRole,
  onSaveCustomer,
  onDeleteCustomer,
  onViewLedgerForCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [gstin, setGstin] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [state, setState] = useState('Gujarat');
  const [stateCode, setStateCode] = useState('24');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const openNewCustomerModal = () => {
    setCustomerToEdit(null);
    setCode('CUST-' + Math.floor(1000 + Math.random() * 9000));
    setName('');
    setGstin('');
    setBillingAddress('');
    setSiteAddress('');
    setState('Gujarat');
    setStateCode('24');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setModalOpen(true);
  };

  const openEditCustomerModal = (c: Customer) => {
    setCustomerToEdit(c);
    setCode(c.code);
    setName(c.name);
    setGstin(c.gstin);
    setBillingAddress(c.billingAddress);
    setSiteAddress(c.siteAddress);
    setState(c.state);
    setStateCode(c.stateCode);
    setContactPerson(c.contactPerson);
    setPhone(c.phone);
    setEmail(c.email);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: Customer = {
      id: customerToEdit ? customerToEdit.id : 'cust-' + Date.now(),
      code: code.trim(),
      name: name.trim(),
      gstin: gstin.trim().toUpperCase(),
      billingAddress: billingAddress.trim(),
      siteAddress: siteAddress.trim() || billingAddress.trim(),
      state: state.trim(),
      stateCode: stateCode.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      createdAt: customerToEdit ? customerToEdit.createdAt : new Date().toISOString(),
    };

    onSaveCustomer(payload);
    setModalOpen(false);
  };

  const filteredCustomers = customers.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.gstin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.billingAddress.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const canEdit = currentRole === 'Admin' || currentRole === 'Manager' || currentRole === 'Accounts';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Customers Management
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Module F
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Client directory, GSTIN state configurations, billing addresses, and outstanding balance tracking
          </p>
        </div>

        {canEdit && (
          <button
            onClick={openNewCustomerModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            + New Customer
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customer by name, code, GSTIN, contact person, city..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Grid of Customer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => {
          const custInvoices = invoices.filter((i) => i.customerId === cust.id && i.status !== 'Cancelled');
          const custBalance = custInvoices.reduce((sum, i) => sum + i.balanceAmount, 0);
          const custProjects = projects.filter((p) => p.customerId === cust.id);

          return (
            <div
              key={cust.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md hover:border-slate-700 transition-colors flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {cust.code}
                    </span>
                    <h3 className="font-bold text-base text-white mt-1 leading-snug line-clamp-1">
                      {cust.name}
                    </h3>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => openEditCustomerModal(cust)}
                      className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {cust.billingAddress}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-slate-500">GSTIN:</span>
                    <span className="text-amber-400 font-bold">{cust.gstin || 'Unregistered'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">State:</span>
                    <span className="text-slate-300">{cust.state} (Code: {cust.stateCode})</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Contact:</span>
                    <span className="text-slate-300">{cust.contactPerson}</span>
                  </div>
                </div>
              </div>

              {/* Financial & Project Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Outstanding Due</div>
                  <div className={`font-mono font-bold text-sm ${custBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {formatCurrency(custBalance)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewLedgerForCustomer(cust.id)}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium cursor-pointer"
                  >
                    Ledger <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Form Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={customerToEdit ? `Edit Customer: ${customerToEdit.name}` : 'Add New Customer Profile'}
        subtitle="Customer records are used to auto-populate Delivery Challans and GST Service Bills"
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
            >
              Save Customer
            </button>
          </div>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Customer Code *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-amber-400 focus:outline-hidden"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Company / Customer Legal Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Tata Motors Passenger Vehicles Ltd."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                GSTIN (15 Digits)
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => {
                  setGstin(e.target.value);
                  if (e.target.value.length >= 2) {
                    const prefix = e.target.value.substring(0, 2);
                    if (!isNaN(Number(prefix))) {
                      setStateCode(prefix);
                    }
                  }
                }}
                placeholder="24AAACT1234A1ZP"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white uppercase focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                GST State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                State Code (2 Digits) *
              </label>
              <input
                type="text"
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
                required
                placeholder="24"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-amber-300 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Billing Address
            </label>
            <input
              type="text"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              placeholder="Head office or billing address"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Site Address (Plant / Delivery Location)
            </label>
            <input
              type="text"
              value={siteAddress}
              onChange={(e) => setSiteAddress(e.target.value)}
              placeholder="Plant / Factory / Receiving store location"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
