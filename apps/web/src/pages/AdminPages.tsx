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
  const { user, organization, addNotification } = useApp();
  const [members, setMembers] = useState([
    { name: user?.full_name || 'Chief Information Security Officer', email: user?.email || 'admin@cryptotool.internal', role: 'Owner / Administrator', department: 'Enterprise Security Architecture', lastActive: 'Now' },
    { name: 'Dr. Sarah Chen', email: 'sarah.chen@enterprise.internal', role: 'Principal Cryptographer', department: 'Applied Cryptography & PQC Lab', lastActive: '15 mins ago' },
    { name: 'Marcus Vance', email: 'marcus.vance@enterprise.internal', role: 'PQC Migration Lead', department: 'Infrastructure Modernization', lastActive: '2 hours ago' },
    { name: 'Elena Rostova', email: 'elena.rostova@enterprise.internal', role: 'DevSecOps Engineer', department: 'CI/CD Security Engineering', lastActive: '1 day ago' },
    { name: 'David Kim', email: 'david.kim@enterprise.internal', role: 'Compliance Auditor', department: 'Regulatory & Governance', lastActive: '3 days ago' },
  ]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Security Analyst');
  const [newMemberDept, setNewMemberDept] = useState('Security Operations');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberEmail) return;
    setMembers(prev => [
      ...prev,
      {
        name: newMemberName,
        email: newMemberEmail,
        role: newMemberRole,
        department: newMemberDept,
        lastActive: 'Invited'
      }
    ]);
    addNotification('Member Added', `Invited ${newMemberName} (${newMemberEmail}) to team.`, 'success');
    setNewMemberName('');
    setNewMemberEmail('');
    setShowInviteModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="pb-2 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-400" />
            Enterprise Team & Role-Based Access Control (RBAC)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage enterprise organization members, security analyst authorizations, and tenant isolation policies.
          </p>
        </div>

        <Button variant="cyber" size="sm" onClick={() => setShowInviteModal(!showInviteModal)}>
          + Invite Team Member
        </Button>
      </div>

      {showInviteModal && (
        <Card className="p-5 border-cyan-500/40 bg-navy-950 space-y-4 font-mono text-xs shadow-2xl animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-cyan-300">Invite New Enterprise Team Member</span>
            <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 block mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Rachel Adams"
                value={newMemberName}
                onChange={e => setNewMemberName(e.target.value)}
                className="w-full p-2 rounded bg-navy-900 border border-slate-800 text-white"
                required
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1">Corporate Email Address</label>
              <input
                type="email"
                placeholder="rachel.adams@enterprise.internal"
                value={newMemberEmail}
                onChange={e => setNewMemberEmail(e.target.value)}
                className="w-full p-2 rounded bg-navy-900 border border-slate-800 text-white"
                required
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1">Assigned Role</label>
              <select
                value={newMemberRole}
                onChange={e => setNewMemberRole(e.target.value)}
                className="w-full p-2 rounded bg-navy-900 border border-slate-800 text-white"
              >
                <option value="Security Analyst">Security Analyst</option>
                <option value="Cryptographic Engineer">Cryptographic Engineer</option>
                <option value="DevSecOps Lead">DevSecOps Lead</option>
                <option value="Compliance Auditor">Compliance Auditor</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>
            <div>
              <label className="text-slate-300 block mb-1">Department</label>
              <input
                type="text"
                placeholder="e.g. Cloud Security Team"
                value={newMemberDept}
                onChange={e => setNewMemberDept(e.target.value)}
                className="w-full p-2 rounded bg-navy-900 border border-slate-800 text-white"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" size="sm" variant="secondary" onClick={() => setShowInviteModal(false)}>Cancel</Button>
              <Button type="submit" size="sm" variant="cyber">Send Invitation</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3">Member Name</th>
                <th className="pb-3">Corporate Email</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Assigned Role</th>
                <th className="pb-3">Status / Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {members.map((m, i) => (
                <tr key={i}>
                  <td className="py-3.5 font-sans font-semibold text-white">{m.name}</td>
                  <td className="py-3.5 text-slate-300">{m.email}</td>
                  <td className="py-3.5 text-slate-400 font-sans">{m.department}</td>
                  <td className="py-3.5">
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {m.role}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-400 text-[11px]">{m.lastActive}</td>
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
