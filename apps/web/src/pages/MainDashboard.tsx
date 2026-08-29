import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Layers,
  Cpu,
  Flame,
  AlertTriangle,
  FileSearch,
  Play,
  ArrowRight,
  TrendingUp,
  Binary,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { KPICard } from '../components/ui/KPICard';
import { Card, CardHeader } from '../components/ui/Card';
import { SeverityBadge, StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ScoreGauge } from '../components/ui/ScoreGauge';
import { RiskOverview, Scan, CryptoFinding, Asset } from '../types';
import * as api from '../services/api';
import { useApp } from '../context/AppContext';

export const MainDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useApp();

  const [riskData, setRiskData] = useState<RiskOverview | null>(null);
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [recentFindings, setRecentFindings] = useState<CryptoFinding[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [overview, scans, findings] = await Promise.all([
        api.fetchRiskOverview(),
        api.fetchScans(),
        api.fetchFindings()
      ]);
      setRiskData(overview);
      setRecentScans(scans.slice(0, 5));
      setRecentFindings(findings.slice(0, 6));
    } catch (e) {
      console.error('Failed to load dashboard data', e);
      addNotification('Dashboard Error', 'Failed to retrieve metrics from backend API', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleDemoScan = async (target: 'cryptotalk' | 'legacy_banking') => {
    try {
      const res = await api.triggerScan({ demo_target: target });
      addNotification(
        'Scan Triggered',
        `Started discovery pipeline for ${target === 'cryptotalk' ? 'CryptoTalk Reference App' : 'Legacy Banking API'}`,
        'success'
      );
      navigate(`/scans/progress/${res.scan_id}`);
    } catch (e: any) {
      addNotification('Scan Error', e.message || 'Failed to trigger scan', 'error');
    }
  };

  if (isLoading || !riskData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-800/60 rounded-xl" />
          ))}
        </div>
        <div className="h-72 bg-slate-800/40 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / SIH Callout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Cryptographic Security Posture
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic cryptographic discovery, Crypto-BOM inventory, and Post-Quantum (PQC) readiness.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="cyber"
            size="sm"
            onClick={() => navigate('/scans/new')}
            leftIcon={<Play className="w-3.5 h-3.5" />}
          >
            Start Scan
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/ai-analyst')}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
          >
            AI Analyst
          </Button>
        </div>
      </div>

      {/* Demo Scenario Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scenario 1: CryptoTalk */}
        <Card glow="cyan" className="border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 to-navy-900/60">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-cyan-300 font-bold bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30">
                Secure Reference Target
              </span>
              <h3 className="text-base font-bold text-white tracking-tight">CryptoTalk Secure Messenger</h3>
              <p className="text-xs text-slate-300">
                AES-256-GCM, Android Keystore, and X25519/ECDH. Security score: 100/100.
              </p>
            </div>
            <Button
              variant="cyber"
              size="sm"
              onClick={() => handleDemoScan('cryptotalk')}
              leftIcon={<Play className="w-3.5 h-3.5" />}
            >
              Analyze
            </Button>
          </div>
        </Card>

        {/* Scenario 2: Legacy Banking */}
        <Card glow="none" className="border-rose-500/30 bg-gradient-to-r from-rose-950/30 to-navy-900/60">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-rose-400 font-bold bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                Legacy Vulnerable Target
              </span>
              <h3 className="text-base font-bold text-white tracking-tight">Legacy Banking API Core</h3>
              <p className="text-xs text-slate-300">
                RSA-1024, SHA-1, 3DES, and TLS 1.0. Security score: 35/100 (Critical).
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDemoScan('legacy_banking')}
              leftIcon={<Play className="w-3.5 h-3.5" />}
            >
              Analyze
            </Button>
          </div>
        </Card>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Assets"
          value={riskData.total_assets}
          subtitle={`${riskData.assets_scanned} actively analyzed`}
          icon={Layers}
          trend={{ value: '+2 assets', isPositive: true }}
          glow="blue"
        />

        <KPICard
          title="Crypto Instances"
          value={riskData.total_crypto_instances}
          subtitle="Identified primitives & ciphers"
          icon={Binary}
          glow="cyan"
        />

        <KPICard
          title="Critical Findings"
          value={riskData.critical_findings}
          subtitle="Obsolete / broken crypto"
          icon={AlertTriangle}
          variant={riskData.critical_findings > 0 ? 'critical' : 'success'}
          glow={riskData.critical_findings > 0 ? 'purple' : 'none'}
        />

        <KPICard
          title="High Findings"
          value={riskData.high_findings}
          subtitle="Deprecated modes / hashes"
          icon={Flame}
          variant={riskData.high_findings > 0 ? 'warning' : 'success'}
        />
      </div>

      {/* Score Gauges & Core Posture Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Security Score Gauge */}
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <ScoreGauge
            score={riskData.overall_score}
            label="Overall Cryptographic Score"
            sublabel="Deterministic formula derived from verified primitives"
            type="security"
          />
        </Card>

        {/* PQC Readiness Score Gauge */}
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <ScoreGauge
            score={riskData.pqc_score}
            label="Post-Quantum Readiness"
            sublabel="Quantum-safe vs Shor-vulnerable public key ratio"
            type="pqc"
          />
        </Card>

        {/* Score Breakdown Bars */}
        <Card className="space-y-4">
          <CardHeader
            title="Posture Breakdown"
            subtitle="Transparent scoring factors"
          />
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1 font-mono">
                <span>Algorithm Strength</span>
                <span>{riskData.score_breakdown.algorithm_strength}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${riskData.score_breakdown.algorithm_strength}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1 font-mono">
                <span>Key Hygiene & Length</span>
                <span>{riskData.score_breakdown.key_hygiene}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-500"
                  style={{ width: `${riskData.score_breakdown.key_hygiene}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1 font-mono">
                <span>Protocol & Transport (TLS)</span>
                <span>{riskData.score_breakdown.protocol_security}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${riskData.score_breakdown.protocol_security}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1 font-mono">
                <span>Post-Quantum Resilience Margin</span>
                <span>{riskData.score_breakdown.pqc_margin}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${riskData.score_breakdown.pqc_margin}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Analytics Charts (Severity Distribution, Algorithm Breakdown, Risk Trends) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Severity Distribution Donut */}
        <Card className="space-y-4">
          <CardHeader title="Severity Distribution" subtitle="Findings categorized by risk tier" />
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData.severity_distribution.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskData.severity_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Algorithm Breakdown Bar Chart */}
        <Card className="space-y-4">
          <CardHeader title="Cryptographic Families" subtitle="Discovered primitive distribution" />
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData.algorithm_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#38a9f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Security Trend Area Chart */}
        <Card className="space-y-4">
          <CardHeader title="Security Score Trend" subtitle="Progressive organizational posture" />
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskData.risk_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00f2fe" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="score" stroke="#00f2fe" strokeWidth={2} fillOpacity={1} fill="url(#scoreGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Tables Section (Recent Findings & Recent Scans) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Findings Table */}
        <Card className="space-y-4">
          <CardHeader
            title="Recent Cryptographic Findings"
            subtitle="Prioritized vulnerabilities & primitives"
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/findings')} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                View All
              </Button>
            }
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Algorithm</th>
                  <th className="pb-3">Title / Finding</th>
                  <th className="pb-3">Severity</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {recentFindings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 font-sans">
                      No findings detected yet. Start a scan to begin discovery.
                    </td>
                  </tr>
                ) : (
                  recentFindings.map(f => (
                    <tr
                      key={f.id}
                      onClick={() => navigate(`/findings/${f.id}`)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 font-bold text-cyan-300">{f.algorithm}</td>
                      <td className="py-3 text-slate-300 font-sans truncate max-w-[200px]">{f.title}</td>
                      <td className="py-3">
                        <SeverityBadge severity={f.severity} size="sm" />
                      </td>
                      <td className="py-3">
                        <StatusBadge status={f.status} size="sm" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Scans Table */}
        <Card className="space-y-4">
          <CardHeader
            title="Recent Scan Jobs"
            subtitle="Live status & audit results"
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/scans/history')} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                History
              </Button>
            }
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Target</th>
                  <th className="pb-3">Score</th>
                  <th className="pb-3">Findings</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {recentScans.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 font-sans">
                      No scans executed. Click "Start Scan" to run analysis.
                    </td>
                  </tr>
                ) : (
                  recentScans.map(s => (
                    <tr
                      key={s.id}
                      onClick={() => navigate(s.status === 'completed' ? `/scans/results/${s.id}` : `/scans/progress/${s.id}`)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 font-sans">
                        <p className="font-semibold text-white truncate max-w-[150px]">{s.asset_name || s.target_identifier}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{s.scan_type}</p>
                      </td>
                      <td className="py-3 font-bold text-cyan-400">
                        {s.overall_security_score}/100
                      </td>
                      <td className="py-3 text-slate-300">
                        {s.total_findings_count} items
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                            s.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : s.status === 'failed'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse'
                          }`}
                        >
                          {s.status.toUpperCase()}
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
    </div>
  );
};
