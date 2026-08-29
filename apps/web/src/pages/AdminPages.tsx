import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Settings,
  Activity,
  Shield,
  Bot,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  Lock,
  ArrowRight,
  Server,
  FileCode
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AuditLogEntry } from '../types';
import * as api from '../services/api';
import { useApp } from '../context/AppContext';

export const TeamUsersPage: React.FC = () => {
  const { user, organization } = useApp();

  const members = [
    { name: user?.full_name || 'Chief Security Officer', email: user?.email || 'admin@cryptotool.internal', role: 'Owner / Administrator', lastActive: 'Now' },
    { name: 'Dr. A. Sharma', email: 'sharma.crypto@authority.gov.in', role: 'Security Analyst', lastActive: '2 hours ago' },
    { name: 'PQC Migration Lead', email: 'pqc.audit@authority.gov.in', role: 'Security Analyst', lastActive: '1 day ago' },
    { name: 'Compliance Auditor', email: 'auditor@gov.in', role: 'Viewer', lastActive: '3 days ago' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-brand-400" />
          Enterprise Team & Role-Based Access Control (RBAC)
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage organizational members, security analyst authorizations, and tenant isolation policies.
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3">Member Name</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3">Assigned Role</th>
                <th className="pb-3">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {members.map((m, i) => (
                <tr key={i}>
                  <td className="py-3.5 font-sans font-semibold text-white">{m.name}</td>
                  <td className="py-3.5 text-slate-300">{m.email}</td>
                  <td className="py-3.5">
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-brand-500/10 text-cyan-300 border border-brand-500/20">
                      {m.role}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-500 text-[11px]">{m.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export const SettingsPage: React.FC = () => {
  const { addNotification } = useApp();
  const [geminiStatus, setGeminiStatus] = useState(false);

  useEffect(() => {
    api.fetchHealth().then(h => setGeminiStatus(h.ai_configured));
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-400" />
          Settings & Engine Configuration
        </h1>
        <p className="text-xs text-slate-400 mt-1">Configure scanner parameters, AI models, and integration policies.</p>
      </div>

      {/* AI Settings Card */}
      <Card className="space-y-4">
        <CardHeader
          title="AI Security Analyst (Gemini API Configuration)"
          subtitle="Governs natural language remediation generation and conversational analysis"
        />

        <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-3 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">AI Provider:</span>
            <span className="text-white font-bold">Google Gemini 1.5 Flash</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">API Key Status:</span>
            <span className={geminiStatus ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {geminiStatus ? 'Active & Validated' : 'Offline / Deterministic Simulator Active'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Hallucination Guard:</span>
            <span className="text-cyan-400 font-bold">Strict Grounding Filter Enforced</span>
          </div>
        </div>
      </Card>

      {/* Scanner Settings Card */}
      <Card className="space-y-4">
        <CardHeader
          title="Discovery Scanner Policy"
          subtitle="Maximum limits, execution isolation, and supported languages"
        />

        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800">
            <span className="text-slate-500">Max Upload Size:</span>
            <p className="font-bold text-white mt-0.5">100 MB (.zip)</p>
          </div>
          <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800">
            <span className="text-slate-500">Supported Languages:</span>
            <p className="font-bold text-white mt-0.5">Java, Kotlin, Python, JS, TS</p>
          </div>
          <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800">
            <span className="text-slate-500">Decompression Sandbox:</span>
            <p className="font-bold text-emerald-400 mt-0.5">Zip Slip Traversal Protected</p>
          </div>
          <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800">
            <span className="text-slate-500">Secret Redaction:</span>
            <p className="font-bold text-cyan-400 mt-0.5">Auto-masking Enabled</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setIsLoading(true);
        const data = await api.fetchAuditLogs();
        setLogs(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadLogs();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Activity className="w-6 h-6 text-brand-400" />
          Tamper-Evident Audit Trail
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Chronological record of all user activities, asset discoveries, scan jobs, and status changes.
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Actor / Email</th>
                <th className="pb-3">Action Type</th>
                <th className="pb-3">Resource Target</th>
                <th className="pb-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {logs.map(l => (
                <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 text-slate-400 text-[11px]">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="py-3 font-semibold text-cyan-300">{l.user_email}</td>
                  <td className="py-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20">
                      {l.action}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300">{l.resource_type}: {l.resource_id.substring(0, 12)}...</td>
                  <td className="py-3 text-slate-500">{l.ip_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export const CryptoTalkDemoPage: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const [isScanning, setIsScanning] = useState(false);

  const handleRunDemo = async () => {
    setIsScanning(true);
    try {
      const res = await api.triggerScan({ demo_target: 'cryptotalk' });
      addNotification('CryptoTalk Analysis Initiated', 'Running multi-layer discovery pipeline', 'success');
      navigate(`/scans/progress/${res.scan_id}`);
    } catch (e: any) {
      addNotification('Error', e.message, 'error');
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="text-center space-y-3 pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>SIH26164 Demonstration Reference Application</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">CryptoTalk Secure Messenger</h1>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          CryptoTalk is our reference secure mobile messaging application engineered with modern cryptographic standards. Test CryptoTool's discovery and analysis engine on its verified implementation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <CardHeader title="Reference Cryptographic Implementation" subtitle="Key primitives built into CryptoTalk" />
          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 flex justify-between items-center">
              <span>Message Encryption:</span>
              <span className="font-bold text-emerald-400">AES-256-GCM (AEAD)</span>
            </div>
            <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 flex justify-between items-center">
              <span>Key Agreement:</span>
              <span className="font-bold text-cyan-400">X25519 / ECDH</span>
            </div>
            <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 flex justify-between items-center">
              <span>Master Key Storage:</span>
              <span className="font-bold text-emerald-400">Android Keystore (StrongBox)</span>
            </div>
            <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 flex justify-between items-center">
              <span>Digest / Hashes:</span>
              <span className="font-bold text-emerald-400">SHA-256 (FIPS 180-4)</span>
            </div>
          </div>
        </Card>

        <Card glow="cyan" className="space-y-6 flex flex-col justify-between p-6">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white">Execute Discovery on CryptoTalk</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              CryptoTool will parse the Java/Kotlin source code, extract AST evidence, build the central Crypto-BOM, evaluate Post-Quantum (PQC) readiness, and formulate an executive security assessment.
            </p>
          </div>

          <Button
            variant="cyber"
            size="lg"
            onClick={handleRunDemo}
            isLoading={isScanning}
            rightIcon={<Play className="w-4 h-4" />}
          >
            Start CryptoTalk Analysis
          </Button>
        </Card>
      </div>
    </div>
  );
};
