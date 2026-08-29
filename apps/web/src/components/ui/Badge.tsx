import React from 'react';
import { Severity, FindingStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'critical' | 'high' | 'medium' | 'low' | 'informational' | 'success' | 'outline' | 'purple' | 'cyan';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'informational', size = 'md', className = '' }) => {
  const styles: Record<string, string> = {
    critical: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
    high: 'bg-orange-500/10 text-orange-400 border border-orange-500/30',
    medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    low: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    informational: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
    cyan: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
    outline: 'bg-slate-800/60 text-slate-300 border border-slate-700/80',
  };

  const sizes: Record<string, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md font-mono transition-colors ${
        styles[variant] || styles.informational
      } ${sizes[size]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {children}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: Severity; size?: 'sm' | 'md' }> = ({ severity, size = 'md' }) => {
  return (
    <Badge variant={severity} size={size}>
      {severity.toUpperCase()}
    </Badge>
  );
};

export const StatusBadge: React.FC<{ status: FindingStatus; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => {
  const map: Record<FindingStatus, { variant: 'critical' | 'high' | 'medium' | 'low' | 'informational' | 'purple' | 'outline'; label: string }> = {
    open: { variant: 'critical', label: 'Open' },
    in_progress: { variant: 'medium', label: 'In Progress' },
    accepted_risk: { variant: 'outline', label: 'Accepted Risk' },
    resolved: { variant: 'informational', label: 'Resolved' },
    false_positive: { variant: 'outline', label: 'False Positive' },
  };

  const item = map[status] || { variant: 'outline', label: status };
  return (
    <Badge variant={item.variant} size={size}>
      {item.label}
    </Badge>
  );
};
