import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Cpu, Lock, Key, ArrowRight } from 'lucide-react';
import { CryptoBOMComponent } from '../../types';

interface DependencyGraphProps {
  appName: string;
  components: CryptoBOMComponent[];
  onSelectComponent?: (comp: CryptoBOMComponent) => void;
}

export const DependencyGraph: React.FC<DependencyGraphProps> = ({
  appName,
  components,
  onSelectComponent,
}) => {
  const [selectedComp, setSelectedComp] = useState<CryptoBOMComponent | null>(components[0] || null);

  const categories = Array.from(new Set(components.map(c => c.category)));

  const handleNodeClick = (comp: CryptoBOMComponent) => {
    setSelectedComp(comp);
    if (onSelectComponent) onSelectComponent(comp);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-navy-950/70 p-6">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Graph Canvas Tree */}
        <div className="flex-1 w-full space-y-6">
          {/* Root Application Node */}
          <div className="flex items-center gap-3 p-4 rounded-xl border border-brand-500/40 bg-brand-500/10 shadow-lg shadow-brand-500/5 max-w-sm">
            <div className="p-2.5 rounded-lg bg-brand-600 text-white">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase text-brand-400 font-semibold tracking-wider">Root Application</p>
              <h4 className="text-sm font-bold text-white tracking-tight">{appName}</h4>
            </div>
          </div>

          {/* Connection Lines & Category Groups */}
          <div className="pl-6 border-l-2 border-dashed border-slate-800 space-y-6">
            {categories.map(category => {
              const catItems = components.filter(c => c.category === category);
              return (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    {category} ({catItems.length})
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4">
                    {catItems.map(item => {
                      const isSelected = selectedComp?.id === item.id;
                      const isWeak = item.risk_level === 'Critical' || item.risk_level === 'High';
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNodeClick(item)}
                          className={`flex items-start justify-between p-3.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                              : isWeak
                              ? 'border-rose-500/40 bg-rose-500/5 hover:border-rose-400'
                              : 'border-slate-800 bg-navy-900/60 hover:border-slate-700'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              {isWeak ? (
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              ) : (
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              )}
                              <span className="text-xs font-bold text-white font-mono">{item.algorithm}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{item.component_name}</p>
                          </div>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              item.is_quantum_safe
                                ? 'text-emerald-400 bg-emerald-500/10'
                                : 'text-amber-400 bg-amber-500/10'
                            }`}
                          >
                            {item.is_quantum_safe ? 'PQC Safe' : 'Q-Vuln'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Node Inspector Panel */}
        {selectedComp && (
          <div className="w-full lg:w-80 rounded-xl border border-slate-800 bg-navy-900/90 p-5 space-y-4 shadow-xl shrink-0 animate-in fade-in duration-200">
            <div className="pb-3 border-b border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider">Node Details</span>
              <h4 className="text-base font-bold text-white mt-1 flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                {selectedComp.algorithm}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">{selectedComp.component_name}</p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-500">Security Status:</span>
                <p className="font-semibold text-slate-200 mt-0.5">{selectedComp.security_status}</p>
              </div>

              <div>
                <span className="text-slate-500">Post-Quantum Relevance:</span>
                <p className={`font-semibold mt-0.5 ${selectedComp.is_quantum_safe ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {selectedComp.pqc_relevance}
                </p>
              </div>

              <div>
                <span className="text-slate-500">Source Location:</span>
                <p className="font-mono text-slate-300 mt-0.5 break-all">{selectedComp.location}</p>
              </div>

              <div>
                <span className="text-slate-500">Evidence Call:</span>
                <div className="mt-1 p-2 rounded bg-navy-950 border border-slate-800 font-mono text-[11px] text-cyan-300 break-all">
                  {selectedComp.evidence}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
