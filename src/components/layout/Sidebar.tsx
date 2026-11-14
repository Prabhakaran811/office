import React from 'react';
import {
  LayoutDashboard,
  Users,
  FolderGit2,
  Truck,
  Wrench,
  Receipt,
  CreditCard,
  AlertCircle,
  BarChart3,
  Percent,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { UserRole } from '../../types';

export type NavTab =
  | 'dashboard'
  | 'customers'
  | 'projects'
  | 'challans'
  | 'reports'
  | 'invoices'
  | 'payments'
  | 'outstanding'
  | 'analytics'
  | 'gst'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentRole: UserRole;
  counts: {
    challans: number;
    reports: number;
    invoices: number;
    unpaidInvoices: number;
    pendingDelivery: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  currentRole,
  counts,
}) => {
  interface NavItem {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
    allowedRoles?: UserRole[];
  }

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FolderGit2,
    },
    {
      id: 'challans',
      label: 'Delivery Challans',
      icon: Truck,
      badge: counts.pendingDelivery > 0 ? counts.pendingDelivery : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      allowedRoles: ['Admin', 'Manager', 'Engineer', 'Viewer'],
    },
    {
      id: 'reports',
      label: 'Service Reports',
      icon: Wrench,
      badge: counts.reports > 0 ? counts.reports : undefined,
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
      allowedRoles: ['Admin', 'Manager', 'Engineer', 'Viewer'],
    },
    {
      id: 'invoices',
      label: 'Service Bills',
      icon: Receipt,
      badge: counts.unpaidInvoices > 0 ? counts.unpaidInvoices : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
      allowedRoles: ['Admin', 'Manager', 'Accounts', 'Viewer'],
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      allowedRoles: ['Admin', 'Manager', 'Accounts', 'Viewer'],
    },
    {
      id: 'outstanding',
      label: 'Outstanding',
      icon: AlertCircle,
      badge: counts.unpaidInvoices > 0 ? 'Due' : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400',
      allowedRoles: ['Admin', 'Manager', 'Accounts', 'Viewer'],
    },
    {
      id: 'analytics',
      label: 'Reports & Ledger',
      icon: BarChart3,
      allowedRoles: ['Admin', 'Manager', 'Accounts', 'Viewer'],
    },
    {
      id: 'gst',
      label: 'GST Summary',
      icon: Percent,
      allowedRoles: ['Admin', 'Manager', 'Accounts', 'Viewer'],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      allowedRoles: ['Admin', 'Manager', 'Accounts', 'Viewer'],
    },
  ];

  // Filter based on user role
  const visibleNav = navItems.filter((item) => {
    if (!item.allowedRoles) return true;
    return item.allowedRoles.includes(currentRole);
  });

  return (
    <aside
      className={`no-print bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col shrink-0 select-none ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Navigation List */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {visibleNav.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer group ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive ? 'text-slate-950 stroke-[2.5]' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1 overflow-hidden">
                  <span className="truncate text-left">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono ${
                        isActive
                          ? 'bg-slate-950 text-amber-400'
                          : item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-2 border-t border-slate-800 flex items-center justify-between">
        {!collapsed && (
          <div className="px-2 text-[11px] text-slate-500 font-mono">
            Veyon ERP v2.6
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ml-auto"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
