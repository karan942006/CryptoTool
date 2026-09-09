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
          <footer className="border-t border-slate-800/60 bg-navy-950/60 px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>CryptoTool (ECDAT) — Enterprise Cryptographic Discovery & Assessment Platform</span>
            </div>
            <div className="flex items-center gap-4 font-mono text-[11px]">
              <span>NIST FIPS 203/204/205 Compliant</span>
              <span>Post-Quantum Ready</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
