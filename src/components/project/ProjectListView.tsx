import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  Search,
  Eye,
  Edit2,
  Receipt,
  Truck,
  Wrench,
  CreditCard,
  Building,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import {
  Project,
  Customer,
  DeliveryChallan,
  ServiceReport,
  ServiceInvoice,
  PaymentReceipt,
  UserRole,
} from '../../types';
import { formatCurrency, formatDate } from '../../services/numbering';
import { StatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';

interface ProjectListViewProps {
  projects: Project[];
  customers: Customer[];
  challans: DeliveryChallan[];
  reports: ServiceReport[];
  invoices: ServiceInvoice[];
  payments: PaymentReceipt[];
  currentRole: UserRole;
  onSaveProject: (project: Project) => void;
  onViewChallansForProject: (projectId: string) => void;
  onViewInvoicesForProject: (projectId: string) => void;
}

export const ProjectListView: React.FC<ProjectListViewProps> = ({
  projects,
  customers,
  challans,
  reports,
  invoices,
  payments,
  currentRole,
  onSaveProject,
  onViewChallansForProject,
  onViewInvoicesForProject,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [poDate, setPoDate] = useState('');
  const [poValue, setPoValue] = useState<number>(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<any>('In Progress');
  const [siteLocation, setSiteLocation] = useState('');
  const [notes, setNotes] = useState('');

  const openNewProjectModal = () => {
    setProjectToEdit(null);
    setCode('PRJ-2026-0' + (projects.length + 1));
    setName('');
    setCustomerId(customers[0]?.id || '');
    setCustomerName(customers[0]?.name || '');
    setPoNumber('');
    setPoDate(new Date().toISOString().split('T')[0]);
    setPoValue(500000);
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setStatus('In Progress');
    setSiteLocation('');
    setNotes('');
    setModalOpen(true);
  };

  const openEditModal = (p: Project) => {
    setProjectToEdit(p);
    setCode(p.code);
    setName(p.name);
    setCustomerId(p.customerId);
    setCustomerName(p.customerName);
    setPoNumber(p.poNumber);
    setPoDate(p.poDate);
    setPoValue(p.poValue);
    setStartDate(p.startDate);
    setEndDate(p.endDate);
    setStatus(p.status);
    setSiteLocation(p.siteLocation);
    setNotes(p.notes || '');
    setModalOpen(true);
  };

  const handleCustomerChange = (id: string) => {
    setCustomerId(id);
    const selected = customers.find((c) => c.id === id);
    if (selected) {
      setCustomerName(selected.name);
      if (!siteLocation) setSiteLocation(selected.siteAddress);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: Project = {
      id: projectToEdit ? projectToEdit.id : 'proj-' + Date.now(),
      code: code.trim(),
      name: name.trim(),
      customerId,
      customerName,
      poNumber: poNumber.trim(),
      poDate,
      poValue: Number(poValue) || 0,
      startDate,
      endDate,
      status,
      siteLocation: siteLocation.trim(),
      notes: notes.trim(),
    };

    onSaveProject(payload);
    setModalOpen(false);
  };

  const filteredProjects = projects.filter((p) => {
    return (
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.poNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const canEdit = currentRole === 'Admin' || currentRole === 'Manager' || currentRole === 'Engineer';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Engineering Projects
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Module F
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Automation project tracking, purchase orders, milestone billing, and site dispatch history
          </p>
        </div>

        {canEdit && (
          <button
            onClick={openNewProjectModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            + New Project
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
            placeholder="Search project by name, code, customer, PO number..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* Projects Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredProjects.map((p) => {
          const projChallans = challans.filter((c) => c.projectId === p.id);
          const projReports = reports.filter((r) => r.projectId === p.id);
          const projInvoices = invoices.filter((i) => i.projectId === p.id && i.status !== 'Cancelled');
          const totalInvoiced = projInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
          const totalCollected = projInvoices.reduce((sum, i) => sum + i.amountPaid, 0);
          const billingProgress = p.poValue > 0 ? Math.min(100, Math.round((totalInvoiced / p.poValue) * 100)) : 0;

          return (
            <div
              key={p.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/80">
                        {p.code}
                      </span>
                      <StatusBadge status={p.status} />
                    </div>
                    <h3 className="font-bold text-base text-white mt-1 leading-snug">
                      {p.name}
                    </h3>
                  </div>

                  {canEdit && (
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="mt-2 text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{p.customerName}</span>
                </div>

                {p.notes && (
                  <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed bg-slate-950/60 p-2 rounded border border-slate-800">
                    {p.notes}
                  </p>
                )}

                {/* PO Financial Progress Bar */}
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">
                      PO: <strong>{p.poNumber}</strong> ({formatDate(p.poDate)})
                    </span>
                    <span className="text-white font-bold">{formatCurrency(p.poValue)}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${billingProgress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>
                      Invoiced: <strong className="text-emerald-400">{formatCurrency(totalInvoiced)}</strong> ({billingProgress}%)
                    </span>
                    <span>
                      Collected: <strong className="text-cyan-400">{formatCurrency(totalCollected)}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Linked Documents Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-cyan-400" /> {projChallans.length} DC
                  </span>
                  <span className="flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-indigo-400" /> {projReports.length} SR
                  </span>
                  <span className="flex items-center gap-1">
                    <Receipt className="w-3.5 h-3.5 text-emerald-400" /> {projInvoices.length} Bills
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewChallansForProject(p.id)}
                    className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                  >
                    View Challans
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    onClick={() => onViewInvoicesForProject(p.id)}
                    className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                  >
                    View Bills
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Project Form Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={projectToEdit ? `Edit Project: ${projectToEdit.code}` : 'Create New Automation Project'}
        subtitle="Track customer purchase order values, site locations, and linked dispatches"
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
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md cursor-pointer"
            >
              Save Project
            </button>
          </div>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Project Code *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-cyan-400 focus:outline-hidden"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Line 3 Conveyor Automation & SCADA"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Customer *
              </label>
              <select
                value={customerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden cursor-pointer"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Project Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-hidden cursor-pointer"
              >
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Commissioned">Commissioned</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Customer PO Number
              </label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="PO-2026-..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-hidden"
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
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                PO Value (₹) *
              </label>
              <input
                type="number"
                min="0"
                value={poValue}
                onChange={(e) => setPoValue(Number(e.target.value) || 0)}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Project Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Project End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Site Location
              </label>
              <input
                type="text"
                value={siteLocation}
                onChange={(e) => setSiteLocation(e.target.value)}
                placeholder="e.g. Sanand Assembly Line 3"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Project Scope & Engineering Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 4 KUKA robots synchronization with Siemens PLC and redundant SCADA"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
