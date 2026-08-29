import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'blue' | 'purple' | 'none';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glow = 'none',
  hoverEffect = false,
  ...props
}) => {
  const glowStyles = {
    none: 'border-slate-800/80 bg-navy-900/60',
    cyan: 'border-cyan-500/30 bg-navy-900/70 shadow-[0_0_25px_-5px_rgba(0,242,254,0.15)]',
    blue: 'border-brand-500/30 bg-navy-900/70 shadow-[0_0_25px_-5px_rgba(14,140,233,0.15)]',
    purple: 'border-purple-500/30 bg-navy-900/70 shadow-[0_0_25px_-5px_rgba(121,40,202,0.15)]',
  };

  const hoverClass = hoverEffect
    ? 'transition-all duration-300 hover:border-slate-700 hover:shadow-lg hover:-translate-y-0.5'
    : '';

  return (
    <div
      className={`rounded-xl border backdrop-blur-md p-5 text-slate-100 ${glowStyles[glow]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={`flex items-start justify-between gap-4 pb-4 border-b border-slate-800/60 mb-4 ${className}`}>
      <div>
        <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
          {title}
        </h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};
