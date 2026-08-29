import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Sparkles,
  Bot,
  ShieldAlert,
  Play,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import * as api from '../../services/api';

interface TopNavProps {
  onOpenMobileSidebar: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onOpenMobileSidebar }) => {
  const {
    isDarkMode,
    toggleDarkMode,
    notifications,
    removeNotification,
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    addNotification,
    refreshAppData,
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isResettingDemo, setIsResettingDemo] = useState(false);

  // Derive breadcrumbs from path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentTitle = pathParts[0] ? pathParts[0].replace('-', ' ').toUpperCase() : 'DASHBOARD';

  const handleResetDemo = async () => {
    setIsResettingDemo(true);
    try {
      await api.resetDemoStore();
      await refreshAppData();
      addNotification('Demo Reset', 'Datastore restored to original SIH demonstration state', 'success');
      navigate('/dashboard');
    } catch (e) {
      addNotification('Reset Failed', 'Could not reset datastore', 'error');
    } finally {
      setIsResettingDemo(false);
    }
  };

  const searchablePages = [
    { title: 'Main Dashboard', path: '/dashboard', cat: 'Assessment' },
    { title: 'Assets & Systems', path: '/assets', cat: 'Inventory' },
    { title: 'Start New Scan (ZIP / HTTPS)', path: '/scans/new', cat: 'Action' },
    { title: 'Crypto-BOM (Bill of Materials)', path: '/crypto-bom', cat: 'Cryptography' },
    { title: 'Crypto Inventory Matrix', path: '/crypto-inventory', cat: 'Cryptography' },
    { title: 'Findings Explorer', path: '/findings', cat: 'Findings' },
    { title: 'Post-Quantum (PQC) Readiness', path: '/pqc', cat: 'Quantum' },
    { title: 'TLS & Certificate Health', path: '/certificates', cat: 'Network' },
    { title: 'AI Security Analyst', path: '/ai-analyst', cat: 'Intelligence' },
    { title: 'Assessment Reports (PDF)', path: '/reports', cat: 'Compliance' },
    { title: 'Audit Trail', path: '/audit-logs', cat: 'Security' },
    { title: 'CryptoTalk Reference App Showcase', path: '/demo/cryptotalk', cat: 'Demo' },
  ];

  const filteredSearch = searchQuery.trim()
    ? searchablePages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.cat.toLowerCase().includes(searchQuery.toLowerCase()))
    : searchablePages;

  return (
    <>
      <header className="h-16 border-b border-slate-800/80 bg-navy-950/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Mobile Toggle & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Open Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-slate-500">ECDAT</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-cyan-400 font-semibold">{currentTitle}</span>
          </div>
        </div>

        {/* Center: Search Trigger Bar */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            onClick={() => setIsGlobalSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl border border-slate-800 bg-navy-900/60 text-slate-400 text-xs hover:border-slate-700 hover:text-slate-300 transition-all shadow-inner"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Search algorithms, assets, findings, Crypto-BOM...</span>
            </span>
            <kbd className="font-mono text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, AI Quick Trigger, Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick AI Analyst shortcut */}
          <button
            onClick={() => navigate('/ai-analyst')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-500/10 text-brand-300 border border-brand-500/30 hover:bg-brand-500/20 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>AI Analyst</span>
          </button>

          {/* Reset Demo Button */}
          <button
            onClick={handleResetDemo}
            disabled={isResettingDemo}
            title="Reset datastore to default demonstration state"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResettingDemo ? 'animate-spin' : ''}`} />
            <span className="hidden xl:inline">Reset Demo</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(prev => !prev)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-navy-950" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-800 bg-navy-900 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
                  <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">System Alerts</h4>
                  <span className="text-[10px] font-mono text-slate-400">{notifications.length} unread</span>
                </div>

                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No active notifications</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => removeNotification(n.id)}
                        className="p-2.5 rounded-lg bg-navy-950 border border-slate-800 hover:border-slate-700 cursor-pointer text-xs space-y-1 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200">{n.title}</span>
                          <span className="text-[10px] text-slate-500">{n.timestamp}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-snug">{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-navy-950 font-mono shadow-md">
              CISO
            </div>
          </div>
        </div>
      </header>

      {/* Global Command / Search Palette Modal */}
      <Modal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        title={
          <span className="flex items-center gap-2 font-mono text-sm">
            <Search className="w-4 h-4 text-cyan-400" />
            Quick Navigation & Search
          </span>
        }
        maxWidth="lg"
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Type a page, algorithm (AES, RSA, PQC), or feature..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            autoFocus
            className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-navy-950 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
          />

          <div className="space-y-1 max-h-72 overflow-y-auto">
            {filteredSearch.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsGlobalSearchOpen(false);
                  navigate(item.path);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-800/80 text-left transition-colors text-xs"
              >
                <span className="font-medium text-slate-200">{item.title}</span>
                <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                  {item.cat}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
};
