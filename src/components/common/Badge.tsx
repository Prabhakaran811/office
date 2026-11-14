import React from 'react';

interface BadgeProps {
  status: string;
  variant?: 'solid' | 'subtle';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, variant = 'subtle', size = 'sm' }) => {
  const getColors = () => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'delivered':
      case 'paid':
      case 'completed':
        return variant === 'solid'
          ? 'bg-emerald-600 text-white'
          : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30';
      case 'dispatched':
      case 'in progress':
      case 'partially paid':
      case 'partially delivered':
        return variant === 'solid'
          ? 'bg-amber-600 text-white'
          : 'bg-amber-950/80 text-amber-300 border border-amber-500/30';
      case 'draft':
      case 'open':
      case 'planned':
        return variant === 'solid'
          ? 'bg-slate-600 text-white'
          : 'bg-slate-800 text-slate-300 border border-slate-700';
      case 'returned':
      case 'commissioned':
      case 'billed':
        return variant === 'solid'
          ? 'bg-cyan-600 text-white'
          : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30';
      case 'unpaid':
      case 'overdue':
        return variant === 'solid'
          ? 'bg-rose-600 text-white'
          : 'bg-rose-950/80 text-rose-300 border border-rose-500/30';
      case 'cancelled':
      case 'on hold':
        return variant === 'solid'
          ? 'bg-red-800 text-white line-through'
          : 'bg-red-950/80 text-red-400 border border-red-500/40 line-through';
      default:
        return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  };

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full uppercase tracking-wider ${sizeClasses} ${getColors()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {status}
    </span>
  );
};
