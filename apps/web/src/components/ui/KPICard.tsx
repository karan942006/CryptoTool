import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from './Card';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  glow?: 'cyan' | 'blue' | 'purple' | 'none';
  variant?: 'default' | 'critical' | 'warning' | 'success';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  glow = 'none',
  variant = 'default',
}) => {
  const variantStyles = {
    default: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
    critical: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    success: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  };

  return (
    <Card glow={glow} hoverEffect className="relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h4 className="text-2xl sm:text-3xl font-bold text-white mt-2 font-mono tracking-tight group-hover:text-cyan-400 transition-colors">
            {value}
          </h4>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}

          {trend && (
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`text-xs font-mono font-medium ${
                  trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-[10px] text-slate-500">vs last scan</span>
            </div>
          )}
        </div>

        <div className={`p-3 rounded-xl border ${variantStyles[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
};
