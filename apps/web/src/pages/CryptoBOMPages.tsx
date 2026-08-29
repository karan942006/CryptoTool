import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Download,
  Search,
  Filter,
  Layers,
  Binary,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Code
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CryptoBOMComponent } from '../types';
import * as api from '../services/api';
import { useApp } from '../context/AppContext';

export const CryptoBOMPage: React.FC = () => {
  const { addNotification } = useApp();
  const [bom, setBom] = useState<CryptoBOMComponent[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPQC, setFilterPQC] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBOM = async () => {
      try {
        setIsLoading(true);
        const data = await api.fetchCryptoBOM();
        setBom(data);
      } catch (e) {
        addNotification('Error', 'Failed to load Crypto-BOM', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadBOM();
  }, []);

  const categories = Array.from(new Set(bom.map(c => c.category)));

  const filtered = bom.filter(c => {
    const matchesSearch =
      c.component_name.toLowerCase().includes(search.toLowerCase()) ||
      c.algorithm.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCategory === 'all' || c.category === filterCategory;
    const matchesPQC =
      filterPQC === 'all' ||
      (filterPQC === 'safe' && c.is_quantum_safe) ||
      (filterPQC === 'vulnerable' && !c.is_quantum_safe);
    return matchesSearch && matchesCat && matchesPQC;
  });

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CryptoTool-CryptoBOM-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    addNotification('Export Complete', 'Crypto-BOM exported as JSON', 'success');
  };

  const exportCSV = () => {
    window.open('/api/crypto-bom/export/csv', '_blank');
    addNotification('Export Complete', 'Crypto-BOM exported as CSV', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyan-400" />
            Enterprise Cryptographic Bill of Materials (Crypto-BOM)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Centralized inventory of cryptographic algorithms, keys, modes, and PQC readiness across systems.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={exportCSV} leftIcon={<FileSpreadsheet className="w-4 h-4" />}>
            Export CSV
          </Button>
          <Button variant="cyber" size="sm" onClick={exportJSON} leftIcon={<Download className="w-4 h-4" />}>
            Export JSON
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search component, algorithm, location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-700 bg-navy-900 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-700 bg-navy-900 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* PQC Filter */}
          <select
            value={filterPQC}
            onChange={e => setFilterPQC(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-700 bg-navy-900 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
          >
            <option value="all">All Quantum Tiers</option>
            <option value="safe">Quantum Resistant (PQC Safe)</option>
            <option value="vulnerable">Quantum Vulnerable (Shor)</option>
          </select>
        </div>
      </div>

      {/* BOM Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3">Component / Usage</th>
                <th className="pb-3">Algorithm</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Key / Mode</th>
                <th className="pb-3">PQC Relevance</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Source Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                    No components found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 font-sans font-semibold text-white max-w-[200px] truncate">
                      {c.component_name}
                    </td>
                    <td className="py-3.5 font-bold text-cyan-300">
                      {c.algorithm}
                    </td>
                    <td className="py-3.5 text-slate-400">
                      {c.category}
                    </td>
                    <td className="py-3.5 text-slate-300">
                      {c.key_size_or_curve}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                          c.is_quantum_safe
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {c.is_quantum_safe ? 'Quantum Resistant' : 'Quantum Vulnerable'}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                          c.security_status.includes('Recommended')
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {c.security_status}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-400 text-[11px] truncate max-w-xs">
                      {c.location}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export const CryptoInventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInv = async () => {
      try {
        setIsLoading(true);
        const data = await api.fetchCryptoInventory();
        setInventory(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadInv();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Binary className="w-6 h-6 text-brand-400" />
          Cryptographic Algorithm Matrix & Inventory
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Aggregated catalogue of unique cryptographic primitives deployed across the enterprise.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory.map((item, idx) => (
          <Card key={idx} hoverEffect className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">{item.category}</span>
                <h3 className="text-xl font-bold text-white font-mono mt-0.5 text-cyan-300">{item.algorithm}</h3>
              </div>
              <span className="text-2xl font-bold font-mono text-white">{item.count}</span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Security Baseline:</span>
              <span className={item.status === 'Broken' ? 'text-rose-400 font-bold' : (item.status === 'Deprecated' ? 'text-amber-400' : 'text-emerald-400')}>
                {item.status}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
