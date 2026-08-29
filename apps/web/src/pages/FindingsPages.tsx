import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FileSearch,
  Filter,
  Search,
  Shield,
  Bot,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ExternalLink,
  Code
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, SeverityBadge, StatusBadge } from '../components/ui/Badge';
import { CodeViewer } from '../components/ui/CodeViewer';
import { CryptoFinding, Severity, FindingStatus } from '../types';
import * as api from '../services/api';
import { useApp } from '../context/AppContext';

export const FindingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const [findings, setFindings] = useState<CryptoFinding[]>([]);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFindings = async () => {
      try {
        setIsLoading(true);
        const data = await api.fetchFindings();
        setFindings(data);
      } catch (e) {
        addNotification('Error', 'Failed to load findings', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadFindings();
  }, []);

  const filtered = findings.filter(f => {
    const matchesSearch =
      f.algorithm.toLowerCase().includes(search.toLowerCase()) ||
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.file_path.toLowerCase().includes(search.toLowerCase());
    const matchesSev = severityFilter === 'all' || f.severity === severityFilter;
    const matchesStat = statusFilter === 'all' || f.status === statusFilter;
    return matchesSearch && matchesSev && matchesStat;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileSearch className="w-6 h-6 text-brand-400" />
            Cryptographic Findings Explorer
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Investigate discovered cryptographic algorithms, key lengths, insecure modes, and vulnerabilities.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search algorithm, title, or file..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-700 bg-navy-900 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          {/* Severity filter */}
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-700 bg-navy-900 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="informational">Informational</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-700 bg-navy-900 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="accepted_risk">Accepted Risk</option>
            <option value="resolved">Resolved</option>
            <option value="false_positive">False Positive</option>
          </select>
        </div>
      </div>

      {/* Findings Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3">Algorithm</th>
                <th className="pb-3">Finding Title</th>
                <th className="pb-3">Source Location</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">PQC Concern</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                    No findings match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map(f => (
                  <tr
                    key={f.id}
                    onClick={() => navigate(`/findings/${f.id}`)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 font-bold text-cyan-300">{f.algorithm}</td>
                    <td className="py-3.5 font-sans font-semibold text-white max-w-sm truncate">{f.title}</td>
                    <td className="py-3.5 text-slate-400 text-[11px] truncate max-w-xs">{f.file_path}:{f.line_number}</td>
                    <td className="py-3.5"><SeverityBadge severity={f.severity} size="sm" /></td>
                    <td className="py-3.5"><StatusBadge status={f.status} size="sm" /></td>
                    <td className="py-3.5">
                      <span className={`text-[10px] ${f.quantum_vulnerable ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                        {f.quantum_vulnerable ? 'Quantum Vulnerable' : 'Safe'}
                      </span>
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

export const FindingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useApp();

  const [finding, setFinding] = useState<CryptoFinding | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<FindingStatus>('open');
  const [justification, setJustification] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFinding = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await api.fetchFindingById(id);
        setFinding(data);
        setSelectedStatus(data.status);
        setJustification(data.status_justification || '');

        // Auto trigger AI explanation
        loadAI(data);
      } catch (e) {
        addNotification('Error', 'Failed to load finding details', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadFinding();
  }, [id]);

  const loadAI = async (f: CryptoFinding) => {
    try {
      setIsAiLoading(true);
      const aiRes = await api.analyzeFindingWithAI(f.id, f.asset_id);
      setAiAnalysis(aiRes);
    } catch (e) {
      console.warn('AI analysis fallback', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!id || !finding) return;
    try {
      setIsUpdatingStatus(true);
      const updated = await api.updateFindingStatus(id, selectedStatus, justification);
      setFinding(updated);
      addNotification('Status Updated', `Finding marked as ${selectedStatus.replace('_', ' ').toUpperCase()}`, 'success');
    } catch (e: any) {
      addNotification('Error', e.message, 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading || !finding) {
    return <div className="p-8 text-center text-slate-400">Loading finding details...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/findings')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              {finding.title}
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Rule ID: {finding.rule_id} • Detected in {finding.file_path}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SeverityBadge severity={finding.severity} size="md" />
          <StatusBadge status={finding.status} size="md" />
        </div>
      </div>

      {/* Code Snippet & Location */}
      <Card className="space-y-3">
        <CardHeader
          title="Verified Source Code Evidence"
          subtitle="Redacted code excerpt captured during deterministic AST inspection"
        />
        <CodeViewer
          code={finding.code_snippet_redacted}
          language={finding.language}
          lineNumber={finding.line_number}
          filePath={finding.file_path}
        />
      </Card>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Algorithm</span>
          <p className="text-sm font-bold text-cyan-300 font-mono mt-1">{finding.algorithm}</p>
        </Card>
        <Card className="p-4">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Category</span>
          <p className="text-sm font-bold text-white mt-1">{finding.category}</p>
        </Card>
        <Card className="p-4">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Key Size / Parameters</span>
          <p className="text-sm font-bold text-white font-mono mt-1">{finding.key_size_str || 'unknown'}</p>
        </Card>
        <Card className="p-4">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Post-Quantum Threat</span>
          <p className={`text-sm font-bold mt-1 ${finding.quantum_vulnerable ? 'text-amber-400' : 'text-emerald-400'}`}>
            {finding.quantum_vulnerable ? 'Shor Vulnerable' : 'Quantum Safe'}
          </p>
        </Card>
      </div>

      {/* Deterministic Remediation Section */}
      <Card className="space-y-3">
        <CardHeader
          title="Deterministic Remediation Guidance"
          subtitle="Direct technical instruction based on NIST SP 800-131A & FIPS standards"
        />
        <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
          {finding.remediation_deterministic}
        </div>
      </Card>

      {/* AI Security Analyst Deep Dive (Gemini API Integration) */}
      <Card glow="blue" className="space-y-4 border-brand-500/30">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              AI Security Analyst Deep Dive
            </h3>
          </div>
          {aiAnalysis?.is_live_ai && (
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Live Gemini Analysis
            </span>
          )}
        </div>

        {isAiLoading ? (
          <div className="py-6 text-center text-xs text-slate-400 font-mono animate-pulse">
            Consulting AI Cryptography Specialist...
          </div>
        ) : aiAnalysis ? (
          <div className="space-y-4 text-xs">
            <div>
              <p className="font-bold text-cyan-300 uppercase text-[10px] font-mono tracking-wider">Executive Summary</p>
              <p className="text-slate-200 mt-1 leading-relaxed">{aiAnalysis.executive_summary}</p>
            </div>

            <div>
              <p className="font-bold text-cyan-300 uppercase text-[10px] font-mono tracking-wider">Technical Impact Analysis</p>
              <p className="text-slate-300 mt-1 leading-relaxed">{aiAnalysis.technical_explanation}</p>
            </div>

            <div>
              <p className="font-bold text-cyan-300 uppercase text-[10px] font-mono tracking-wider">Business & Compliance Impact</p>
              <p className="text-slate-300 mt-1 leading-relaxed">{aiAnalysis.business_impact}</p>
            </div>

            <div>
              <p className="font-bold text-purple-400 uppercase text-[10px] font-mono tracking-wider">Post-Quantum Migration Horizon (NIST PQC)</p>
              <p className="text-slate-300 mt-1 leading-relaxed">{aiAnalysis.pqc_migration_path}</p>
            </div>
          </div>
        ) : null}
      </Card>

      {/* Finding Status Update Workflow */}
      <Card className="space-y-4">
        <CardHeader
          title="Triage & Status Management"
          subtitle="Authorized administrators can accept risk, mark resolved, or update investigation status"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
              Update Status
            </label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value as FindingStatus)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-navy-950 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
            >
              <option value="open">Open (Active Investigation)</option>
              <option value="in_progress">In Progress (Patching underway)</option>
              <option value="accepted_risk">Accepted Risk (Documented exception)</option>
              <option value="resolved">Resolved (Fix verified)</option>
              <option value="false_positive">False Positive</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
              Justification / Audit Note
            </label>
            <input
              type="text"
              value={justification}
              onChange={e => setJustification(e.target.value)}
              placeholder="e.g. Approved exception for legacy system migration by 2026-Q4"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-navy-950 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="cyber"
            size="sm"
            onClick={handleStatusUpdate}
            isLoading={isUpdatingStatus}
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
          >
            Save Status & Record in Audit Log
          </Button>
        </div>
      </Card>
    </div>
  );
};
