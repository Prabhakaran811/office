import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  FileText,
  Clock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { ServiceReport, UserRole } from '../../types';
import { formatDate } from '../../services/numbering';
import { StatusBadge } from '../common/Badge';

interface ServiceReportListViewProps {
  reports: ServiceReport[];
  currentRole: UserRole;
  onNewReport: () => void;
  onViewReport: (report: ServiceReport) => void;
  onEditReport: (report: ServiceReport) => void;
  onCreateInvoiceFromReport: (report: ServiceReport) => void;
}

export const ServiceReportListView: React.FC<ServiceReportListViewProps> = ({
  reports,
  currentRole,
  onNewReport,
  onViewReport,
  onEditReport,
  onCreateInvoiceFromReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.reportNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.projectName && r.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      r.engineerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.workPerformed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.equipmentDetails.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const canCreate = currentRole === 'Admin' || currentRole === 'Engineer' || currentRole === 'Manager';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Service Work Reports
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              Module C
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Field service engineering logs, PLC/HMI calibration, problem resolution, and direct bill generation
          </p>
        </div>

        {canCreate && (
          <button
            onClick={onNewReport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            + New Service Report
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search report no, engineer, customer, PLC/VFD equipment, tasks performed..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-xs text-slate-300 focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Billed">Billed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Report Details</th>
                <th className="px-4 py-3">Customer & Site</th>
                <th className="px-4 py-3">Engineer / Hours</th>
                <th className="px-4 py-3">Equipment Serviced</th>
                <th className="px-4 py-3">Linked Challan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No service reports found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-850/60 transition-colors">
                    {/* Report No & Date */}
                    <td className="px-4 py-3">
                      <div
                        className="font-mono font-bold text-indigo-400 hover:underline cursor-pointer"
                        onClick={() => onViewReport(r)}
                      >
                        {r.reportNo}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 whitespace-nowrap">
                        {formatDate(r.date)}
                      </div>
                    </td>

                    {/* Customer & Site */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-200 line-clamp-1">{r.customerName}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{r.siteLocation}</div>
                      {r.projectName && (
                        <div className="text-[10px] text-amber-400 font-mono line-clamp-1 mt-0.5">
                          {r.projectName}
                        </div>
                      )}
                    </td>

                    {/* Engineer & Hours */}
                    <td className="px-4 py-3">
                      <div className="text-slate-300 font-medium">{r.engineerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {r.startTime} — {r.endTime}
                      </div>
                    </td>

                    {/* Equipment Details */}
                    <td className="px-4 py-3">
                      <div className="text-slate-300 font-mono text-[11px] line-clamp-1">
                        {r.equipmentDetails || 'Industrial System'}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {r.problemDescription}
                      </div>
                    </td>

                    {/* Linked Challan */}
                    <td className="px-4 py-3">
                      {r.linkedChallanNo ? (
                        <span className="font-mono text-cyan-400 text-[11px] bg-cyan-950/60 border border-cyan-800/80 px-2 py-0.5 rounded">
                          {r.linkedChallanNo}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewReport(r)}
                          title="View / Print Service Report"
                          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onEditReport(r)}
                          title="Edit Report"
                          className="p-1.5 rounded-md text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Create Service Bill Action */}
                        {(currentRole === 'Admin' || currentRole === 'Accounts' || currentRole === 'Manager') && (
                          <button
                            onClick={() => onCreateInvoiceFromReport(r)}
                            title="Create Service Bill from this Report (Module C)"
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] cursor-pointer shadow-xs transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" /> Create Bill
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
      </div>
    </div>
  );
};
