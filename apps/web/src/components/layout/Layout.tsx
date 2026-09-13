import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { Shield } from 'lucide-react';

export const Layout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">

      <div className="flex-1 flex">
        {/* Fixed / Mobile Sidebar */}
        <Sidebar
          isOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          <TopNav onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            <Outlet />
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-800/60 bg-navy-950/80 backdrop-blur-md px-6 py-4 text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium shrink-0">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>CryptoTool (ECDAT)</span>
              </div>
              <span className="hidden sm:inline text-slate-600">•</span>
              <div className="text-slate-400 font-medium">
                <span className="text-slate-500">Made By </span>
                <span className="text-cyan-300 font-semibold">Shaila Mandkulkar</span>
                <span className="text-slate-500"> , </span>
                <span className="text-cyan-300 font-semibold">Ishwari Shinde</span>
                <span className="text-slate-500"> , </span>
                <span className="text-cyan-300 font-semibold">Karan Lingayat</span>
                <span className="text-slate-500"> , </span>
                <span className="text-cyan-300 font-semibold">Ketan Nimbare</span>
                <span className="text-slate-500"> , </span>
                <span className="text-cyan-300 font-semibold">Tapan Narvekar</span>
                <span className="text-slate-500"> , </span>
                <span className="text-cyan-300 font-semibold">Parth Kelaskar</span>
              </div>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500 shrink-0">
              <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300">NIST FIPS 203/204/205</span>
              <span className="px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40 text-cyan-400">Post-Quantum Ready</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
