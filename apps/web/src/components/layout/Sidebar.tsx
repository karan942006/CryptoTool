import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Shield,
  Layers,
  FileSearch,
  Cpu,
  Flame,
  Bot,
  Binary,
  ScrollText,
  History,
  FileBarChart,
  Users,
  Settings,
  Activity,
  PlusCircle,
  PlayCircle,
  KeyRound,
  LucideIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
  highlight?: boolean;
  badge?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { organization } = useApp();
  const navigate = useNavigate();

  const navGroups: NavGroup[] = [
    {
      group: 'Core Assessment',
      items: [
        { name: 'Main Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Assets & Targets', path: '/assets', icon: Layers },
        { name: 'Start New Scan', path: '/scans/new', icon: PlayCircle, highlight: true },
        { name: 'Scan History', path: '/scans/history', icon: History },
      ]
    },
    {
      group: 'Cryptographic Analysis',
      items: [
        { name: 'Crypto-BOM', path: '/crypto-bom', icon: Shield },
        { name: 'Crypto Inventory', path: '/crypto-inventory', icon: Binary },
        { name: 'Findings Explorer', path: '/findings', icon: FileSearch },
        { name: 'Risk Analytics', path: '/risk', icon: Flame },
        { name: 'PQC Readiness', path: '/pqc', icon: Cpu, badge: 'NIST' },
        { name: 'TLS & Certificates', path: '/certificates', icon: KeyRound },
      ]
    },
    {
      group: 'Intelligence & Compliance',
      items: [
        { name: 'AI Security Analyst', path: '/ai-analyst', icon: Bot, badge: 'AI' },
        { name: 'Assessment Reports', path: '/reports', icon: FileBarChart },
        { name: 'Audit Trail', path: '/audit-logs', icon: Activity },
      ]
    },
    {
      group: 'Administration',
      items: [
        { name: 'Team & RBAC', path: '/team', icon: Users },
        { name: 'Settings & Integrations', path: '/settings', icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-navy-900/95 border-r border-slate-800/80 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80">
          <NavLink to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center text-navy-950 font-black shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-navy-950" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-wider text-white flex items-center gap-1 font-mono">
                CRYPTOTOOL
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-semibold block -mt-1">
                ECDAT • SIH26164
              </span>
            </div>
          </NavLink>
        </div>

        {/* Organization Badge / Switcher */}
        <div className="px-4 py-3 border-b border-slate-800/50 bg-navy-950/40">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="uppercase tracking-wider text-[10px] font-mono font-semibold">Tenant</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              Enterprise
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-200 truncate font-mono">
            {organization?.name || 'National Cyber Defense Agency'}
          </p>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <p className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2">
                {group.group}
              </p>
              {group.items.map((item, iIdx) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={iIdx}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-brand-600/20 text-cyan-300 border border-brand-500/30 shadow-sm font-semibold'
                          : item.highlight
                          ? 'text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Demo Scenario Quick Action */}
        <div className="p-3 border-t border-slate-800/80 bg-navy-950/60">
          <div className="p-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-cyan-300 font-mono flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                CryptoTalk Demo
              </span>
              <span className="text-[9px] font-mono uppercase text-cyan-400 bg-cyan-500/20 px-1 rounded">
                Ref App
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Analyze reference secure communications application in 1 click.
            </p>
            <button
              onClick={() => navigate('/demo/cryptotalk')}
              className="w-full py-1.5 text-xs font-semibold rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-colors"
            >
              Analyze CryptoTalk
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
