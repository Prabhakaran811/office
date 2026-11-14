import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  FileText,
  Printer,
  ChevronRight,
  RotateCcw,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { DeliveryChallan, ChallanStatus, ChallanType, UserRole } from '../../types';
import { formatDate } from '../../services/numbering';
import { StatusBadge } from '../common/Badge';

interface ChallanListViewProps {
  challans: DeliveryChallan[];
  currentRole: UserRole;
  onNewChallan: () => void;
  onViewChallan: (challan: DeliveryChallan) => void;
  onEditChallan: (challan: DeliveryChallan) => void;
  onCreateServiceBillFromChallan: (challan: DeliveryChallan) => void;
}

export const ChallanListView: React.FC<ChallanListViewProps> = ({
  challans,
  currentRole,
  onNewChallan,
  onViewChallan,
  onEditChallan,
  onCreateServiceBillFromChallan,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const challanTypes: ChallanType[] = [
    'Supply / Delivery',
    'Returnable Material',
    'Non-Returnable Material',
    'Material Sent for Service',
    'Material Sent for Repair',
    'Material Sent for Testing',
    'Project Site Material',
    'Replacement Material',
  ];

  const statuses: ChallanStatus[] = [
    'Draft',
    'Approved',
    'Dispatched',
    'Delivered',
    'Partially Delivered',
    'Returned',
    'Cancelled',
  ];

  const filteredChallans = challans.filter((c) => {
    const matchesSearch =
      c.challanNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.projectName && c.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.poNumber && c.poNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.vehicleNumber && c.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.items.some(
        (i) =>
          i.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.partNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.serialNo.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesType = typeFilter === 'all' || c.challanType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const canCreate = currentRole === 'Admin' || currentRole === 'Engineer' || currentRole === 'Manager';
  const canEdit = (c: DeliveryChallan) =>
    (currentRole === 'Admin' || currentRole === 'Engineer' || currentRole === 'Manager') &&
    c.status !== 'Cancelled';

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Delivery Challans
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Module A
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            GST-compliant delivery documentation, serial number tracking, and site dispatch management
          </p>
        </div>

        {canCreate && (
          <button
            onClick={onNewChallan}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            + New Delivery Challan
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by DC No, Customer, Project, PO, Item Part No, Serial..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s} className="bg-slate-900 text-white">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <Truck className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Challan Types</option>
              {challanTypes.map((t) => (
                <option key={t} value={t} className="bg-slate-900 text-white">
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Challans Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Challan Details</th>
                <th className="px-4 py-3">Challan Type</th>
                <th className="px-4 py-3">Customer & Site</th>
                <th className="px-4 py-3">Project / PO Ref</th>
                <th className="px-4 py-3">Vehicle & Transporter</th>
                <th className="px-4 py-3 text-center">Qty / Items</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredChallans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No delivery challans match your criteria.
                  </td>
                </tr>
              ) : (
                filteredChallans.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-850/60 transition-colors group"
                  >
                    {/* DC No & Date */}
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-cyan-400 hover:underline cursor-pointer" onClick={() => onViewChallan(c)}>
                        {c.challanNo}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 whitespace-nowrap">
                        {formatDate(c.challanDate)}
                      </div>
                    </td>

                    {/* Challan Type */}
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                        c.challanType.includes('Returnable')
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {c.challanType}
                      </span>
                      {c.ewayBillNo && (
                        <div className="text-[10px] font-mono text-slate-400 mt-1">
                          EWB: {c.ewayBillNo}
                        </div>
                      )}
                    </td>

                    {/* Customer & Site */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-200 line-clamp-1">
                        {c.customerName}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">
                        {c.deliveryLocation || c.customerAddress}
                      </div>
                    </td>

                    {/* Project & PO */}
                    <td className="px-4 py-3">
                      {c.projectName ? (
                        <div className="font-medium text-slate-300 line-clamp-1">
                          {c.projectName}
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                      {c.poNumber && (
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          PO: {c.poNumber}
                        </div>
                      )}
                    </td>

                    {/* Vehicle & Transporter */}
                    <td className="px-4 py-3">
                      <div className="text-slate-300 font-mono text-[11px]">
                        {c.vehicleNumber || '—'}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">
                        {c.transporterName}
                      </div>
                    </td>

                    {/* Items & Qty */}
                    <td className="px-4 py-3 text-center">
                      <div className="font-mono font-semibold text-white">
                        {c.totalQty} {c.items[0]?.unit || 'Nos'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {c.items.length} line item(s)
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewChallan(c)}
                          title="Preview & Print A4 Challan"
                          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {canEdit(c) && (
                          <button
                            onClick={() => onEditChallan(c)}
                            title="Edit Challan"
                            className="p-1.5 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Create Service Bill button (Module D) */}
                        {(currentRole === 'Admin' || currentRole === 'Accounts' || currentRole === 'Manager') && (
                          <button
                            onClick={() => onCreateServiceBillFromChallan(c)}
                            title="Create Service Bill from this Delivery Challan (Module D)"
                            className="p-1.5 rounded-md text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filteredChallans.length} of {challans.length} delivery challans</span>
          <span className="font-mono text-cyan-400">
            {challans.filter((c) => c.status === 'Delivered').length} Delivered • {challans.filter((c) => c.status === 'Dispatched').length} In Transit
          </span>
        </div>
      </div>
    </div>
  );
};
