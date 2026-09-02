import React, { useState, useEffect } from 'react';
import {
  Shield,
  Cpu,
  Flame,
  Layers,
  ArrowRight,
  Server,
  Cloud,
  Database,
  Smartphone,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  Sparkles,
  Info,
  ExternalLink,
  Sliders,
  DollarSign,
  Clock,
  Activity
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge, SeverityBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { DigitalTwinNode, DigitalTwinEdge, DigitalTwinGraph } from '../types';
import * as api from '../services/api';

export const DigitalTwinPage: React.FC = () => {
  const [graph, setGraph] = useState<DigitalTwinGraph | null>(null);
  const [selectedNode, setSelectedNode] = useState<DigitalTwinNode | null>(null);
  const [filterLayer, setFilterLayer] = useState<'all' | 'enterprise' | 'app' | 'crypto' | 'threat_pqc'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [threatSimActive, setThreatSimActive] = useState(true);

  useEffect(() => {
    const loadGraph = async () => {
      const data = await api.fetchDigitalTwin();
      setGraph(data);
      if (data.nodes && data.nodes.length > 1) {
        // Default select high-risk node
        const highRisk = data.nodes.find(n => n.id === 'node-app-payment') || data.nodes[1];
        setSelectedNode(highRisk);
      }
    };
    loadGraph();
  }, []);

  if (!graph) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm font-mono text-slate-400">Loading Enterprise Cryptographic Digital Twin...</p>
        </div>
      </div>
    );
  }

  const filteredNodes = graph.nodes.filter(n => {
    if (filterLayer === 'enterprise' && n.type !== 'enterprise') return false;
    if (filterLayer === 'app' && n.type !== 'app' && n.type !== 'server') return false;
    if (filterLayer === 'crypto' && n.type !== 'crypto') return false;
    if (filterLayer === 'threat_pqc' && n.type !== 'quantum_threat' && n.type !== 'pqc_solution') return false;
    if (searchQuery) {
      return (
        n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.details.algorithm?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'enterprise':
        return <Shield className="w-5 h-5 text-cyan-400" />;
      case 'app':
        return <Smartphone className="w-5 h-5 text-purple-400" />;
      case 'server':
        return <Server className="w-5 h-5 text-indigo-400" />;
      case 'cloud':
        return <Cloud className="w-5 h-5 text-sky-400" />;
      case 'crypto':
        return <Lock className="w-5 h-5 text-amber-400" />;
      case 'quantum_threat':
        return <Flame className="w-5 h-5 text-rose-400" />;
      case 'pqc_solution':
        return <Cpu className="w-5 h-5 text-emerald-400" />;
      default:
        return <Layers className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusBorder = (status: string) => {
    switch (status) {
      case 'critical':
        return 'border-rose-500/80 shadow-rose-500/20 bg-rose-950/30';
      case 'high':
        return 'border-amber-500/80 shadow-amber-500/20 bg-amber-950/30';
      case 'medium':
        return 'border-yellow-500/60 shadow-yellow-500/10 bg-yellow-950/20';
      case 'safe':
        return 'border-emerald-500/80 shadow-emerald-500/20 bg-emerald-950/30';
      case 'pqc_ready':
        return 'border-cyan-500/80 shadow-cyan-500/20 bg-cyan-950/30';
      default:
        return 'border-slate-800 bg-navy-900/60';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5 font-mono">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              Cryptographic Risk Digital Twin
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
              Live Interactive Twin
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual model of Enterprise Assets → Cryptographic Primitives → Quantum Threat Vector → Post-Quantum Migration Strategy.
          </p>
        </div>

        {/* Global Summary Pill */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-navy-900/90 border border-slate-800 flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-slate-400">Vulnerable:</span>
              <span className="font-bold text-rose-400">{graph.summary.vulnerable_nodes}</span>
            </div>
            <div className="w-px h-4 bg-slate-800" />
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-400">PQC Ready:</span>
              <span className="font-bold text-emerald-400">{graph.summary.pqc_ready_nodes}</span>
            </div>
          </div>

          <Button
            size="sm"
            variant={threatSimActive ? 'primary' : 'outline'}
            onClick={() => setThreatSimActive(!threatSimActive)}
            className="text-xs"
          >
            <Activity className="w-3.5 h-3.5 mr-1.5" />
            {threatSimActive ? 'Quantum Threat Pulse: ON' : 'Threat Pulse: OFF'}
          </Button>
        </div>
      </div>

      {/* Control Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-navy-900/60 border border-slate-800/80">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider mr-2">Layer:</span>
          {(['all', 'enterprise', 'app', 'crypto', 'threat_pqc'] as const).map(l => (
            <button
              key={l}
              onClick={() => setFilterLayer(l)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterLayer === l
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {l === 'all' && 'All Tiers'}
              {l === 'enterprise' && 'Enterprise Core'}
              {l === 'app' && 'Applications & APIs'}
              {l === 'crypto' && 'Crypto Primitives'}
              {l === 'threat_pqc' && 'Quantum Threat & PQC'}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search twin node or algorithm..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-navy-950/80 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 font-mono"
          />
        </div>
      </div>

      {/* Main Grid: Visual Twin Canvas & Deep Context Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Visual Twin Canvas (8 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 relative overflow-hidden bg-gradient-to-b from-navy-950 to-navy-900 border-slate-800/90 shadow-2xl">
            {/* Ambient Cyber Grid Background */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #00f2fe 1px, transparent 0)',
                backgroundSize: '24px 24px'
              }}
            />

            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-300">INTERACTIVE GRAPH TOPOLOGY</span>
                <span className="text-[10px] text-slate-500 font-mono">({filteredNodes.length} Nodes Rendered)</span>
              </div>
              <div className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Click node to inspect context
              </div>
            </div>

            {/* Nodes Stack */}
            <div className="space-y-6 relative z-10 py-2">
              {/* Layer 1: Enterprise Hub */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                  Tier 1 — Enterprise Hub
                </span>
                <div className="grid grid-cols-1 gap-3">
                  {filteredNodes
                    .filter(n => n.type === 'enterprise')
                    .map(node => (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer shadow-lg flex items-center justify-between ${getStatusBorder(
                          node.status
                        )} ${selectedNode?.id === node.id ? 'ring-2 ring-cyan-400 scale-[1.01]' : 'hover:scale-[1.005]'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-lg bg-navy-950/80 border border-slate-700">
                            {getNodeIcon(node.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white font-mono">{node.label}</span>
                              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-300">
                                {node.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
                              {node.details.recommended_pqc} • Est. Migration: {node.details.estimated_cost_inr}
                            </p>
                          </div>
                        </div>
                        <SeverityBadge severity={node.status === 'critical' ? 'critical' : node.status === 'high' ? 'high' : 'low'} />
                      </div>
                    ))}
                </div>
              </div>

              {/* Connecting Flow Indicator */}
              <div className="flex justify-center my-1">
                <div className="h-6 w-px bg-gradient-to-b from-cyan-500 to-purple-500" />
              </div>

              {/* Layer 2: Applications & APIs */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                  Tier 2 — Applications & Workloads
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {filteredNodes
                    .filter(n => n.type === 'app' || n.type === 'server')
                    .map(node => (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-md flex flex-col justify-between space-y-3 ${getStatusBorder(
                          node.status
                        )} ${selectedNode?.id === node.id ? 'ring-2 ring-cyan-400 scale-[1.02]' : 'hover:scale-[1.01]'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="p-2 rounded-lg bg-navy-950/80 border border-slate-800">
                            {getNodeIcon(node.type)}
                          </div>
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                              node.details.quantum_status === 'Vulnerable'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {node.details.quantum_status}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white font-mono leading-snug">{node.label}</h4>
                          <p className="text-[10px] text-cyan-300/80 font-mono mt-0.5">{node.details.algorithm || 'AES-GCM'}</p>
                        </div>
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>HNDL: {node.details.hndl_risk}</span>
                          <span className="font-bold text-white">{node.details.priority}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Connecting Flow Indicator */}
              <div className="flex justify-center my-1">
                <div className="h-6 w-px bg-gradient-to-b from-purple-500 to-amber-500" />
              </div>

              {/* Layer 3: Cryptographic Primitives */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                  Tier 3 — Cryptographic Primitives
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {filteredNodes
                    .filter(n => n.type === 'crypto')
                    .map(node => (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer shadow-md flex items-center gap-3 ${getStatusBorder(
                          node.status
                        )} ${selectedNode?.id === node.id ? 'ring-2 ring-cyan-400 scale-[1.02]' : 'hover:scale-[1.01]'}`}
                      >
                        <div className="p-2 rounded-lg bg-navy-950/80 border border-slate-800">
                          {getNodeIcon(node.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white font-mono truncate">{node.label}</h4>
                          <span className="text-[10px] text-slate-400 block truncate">{node.details.usage || node.category}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Connecting Flow Indicator */}
              <div className="flex justify-center my-1">
                <div className="h-6 w-px bg-gradient-to-b from-amber-500 to-rose-500" />
              </div>

              {/* Layer 4: Quantum Threat & PQC Solutions */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                  Tier 4 — Quantum Threat Vector & PQC Target Solutions
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {filteredNodes
                    .filter(n => n.type === 'quantum_threat' || n.type === 'pqc_solution')
                    .map(node => (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-md flex flex-col justify-between space-y-2 ${getStatusBorder(
                          node.status
                        )} ${selectedNode?.id === node.id ? 'ring-2 ring-cyan-400 scale-[1.02]' : 'hover:scale-[1.01]'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="p-1.5 rounded-lg bg-navy-950/80 border border-slate-800">
                            {getNodeIcon(node.type)}
                          </div>
                          <span className="text-[9px] font-mono font-bold text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/30">
                            {node.type === 'quantum_threat' ? 'Threat Horizon' : 'FIPS PQC Standard'}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white font-mono leading-tight">{node.label}</h4>
                          <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{node.details.usage || node.details.recommended_pqc}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Deep Context Decision-Support Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedNode ? (
            <Card className="p-6 border-cyan-500/30 shadow-2xl bg-navy-900/95 space-y-5 sticky top-20">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                      {selectedNode.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">ID: {selectedNode.id}</span>
                  </div>
                  <h3 className="text-lg font-black text-white font-mono tracking-tight">{selectedNode.label}</h3>
                </div>
                <div className="p-2.5 rounded-xl bg-navy-950 border border-slate-700">
                  {getNodeIcon(selectedNode.type)}
                </div>
              </div>

              {/* Context Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-navy-950/90 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Quantum Threat Status</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        selectedNode.details.quantum_status === 'Vulnerable'
                          ? 'bg-rose-500 animate-pulse'
                          : 'bg-emerald-400'
                      }`}
                    />
                    <span
                      className={`font-bold ${
                        selectedNode.details.quantum_status === 'Vulnerable' ? 'text-rose-400' : 'text-emerald-300'
                      }`}
                    >
                      {selectedNode.details.quantum_status}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-navy-950/90 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">HNDL Risk Index</span>
                  <span
                    className={`font-bold block ${
                      selectedNode.details.hndl_risk === 'CRITICAL'
                        ? 'text-rose-400'
                        : selectedNode.details.hndl_risk === 'HIGH'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {selectedNode.details.hndl_risk}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-navy-950/90 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Data Lifetime (X)</span>
                  <span className="font-bold text-white block">{selectedNode.details.data_lifetime_years} Years</span>
                </div>

                <div className="p-3 rounded-xl bg-navy-950/90 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Est. Migration Window (Y)</span>
                  <span className="font-bold text-white block">{selectedNode.details.migration_time_years} Years</span>
                </div>
              </div>

              {/* Context Breakdown */}
              <div className="space-y-3 text-xs font-mono">
                {selectedNode.details.algorithm && (
                  <div className="p-3 rounded-xl bg-navy-950/60 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Discovered Algorithm:</span>
                    <span className="font-bold text-cyan-300">{selectedNode.details.algorithm}</span>
                  </div>
                )}

                {selectedNode.details.usage && (
                  <div className="p-3 rounded-xl bg-navy-950/60 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Cryptographic Purpose:</span>
                    <span className="font-semibold text-slate-200">{selectedNode.details.usage}</span>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-purple-300">Recommended PQC Candidate</span>
                    <span className="text-[9px] font-mono bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">
                      FIPS Standardized
                    </span>
                  </div>
                  <p className="text-sm font-black text-white font-mono">{selectedNode.details.recommended_pqc}</p>
                  <p className="text-[11px] text-slate-300 font-sans mt-1">
                    Hybrid Candidate: <strong className="text-cyan-300">{selectedNode.details.hybrid_candidate}</strong>
                  </p>
                </div>

                {/* Financial & Priority Guidance */}
                <div className="p-3.5 rounded-xl bg-navy-950/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase text-slate-400 font-bold">Migration Complexity & ROI</span>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Priority {selectedNode.details.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400">Difficulty Level:</span>
                    <span className="font-bold text-white">{selectedNode.details.migration_difficulty}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Estimated Migration Budget:</span>
                    <span className="font-bold text-emerald-400">{selectedNode.details.estimated_cost_inr}</span>
                  </div>
                </div>

                {selectedNode.details.affected_files && selectedNode.details.affected_files.length > 0 && (
                  <div className="p-3 rounded-xl bg-navy-950/60 border border-slate-800 space-y-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Affected Source Artifacts:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNode.details.affected_files.map((f, i) => (
                        <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center gap-3">
                <Button
                  className="flex-1 text-xs"
                  onClick={() => alert(`Generated automated PQC migration ticket for: ${selectedNode.label}`)}
                >
                  Generate Remediation Plan
                </Button>
                <Button
                  variant="outline"
                  className="text-xs"
                  onClick={() => alert(`Exporting CBOM node descriptor for: ${selectedNode.id}`)}
                >
                  Export Node CBOM
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center text-slate-400 border-dashed border-slate-800">
              <Info className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-mono">Select any node on the Digital Twin canvas to inspect context & decision metrics.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
