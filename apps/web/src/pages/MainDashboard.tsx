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
  ExternalLink,
  Sliders,
  DollarSign,
  Activity,
  Globe
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

const defaultRiskOverview: RiskOverview = {
  overall_score: 100,
  pqc_score: 100,
  total_assets: 0,
  assets_scanned: 0,
  total_crypto_instances: 0,
  critical_findings: 0,
  high_findings: 0,
  medium_findings: 0,
  low_findings: 0,
  info_findings: 0,
  severity_distribution: [],
  algorithm_distribution: [],
  risk_trends: [],
  score_breakdown: {
    algorithm_strength: 100,
    key_hygiene: 100,
    protocol_security: 100,
    certificate_health: 100,
    pqc_margin: 100
  }
};

export const MainDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useApp();

  const [riskData, setRiskData] = useState<RiskOverview>(defaultRiskOverview);
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [recentFindings, setRecentFindings] = useState<CryptoFinding[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [overview, scans, findings] = await Promise.all([
        api.fetchRiskOverview().catch(() => defaultRiskOverview),
        api.fetchScans().catch(() => []),
        api.fetchFindings().catch(() => [])
      ]);
      if (overview) setRiskData(overview);
      if (scans && scans.length > 0) setRecentScans(scans.slice(0, 5));
      if (findings && findings.length > 0) setRecentFindings(findings.slice(0, 6));
    } catch (e) {
      console.warn('Dashboard data fetch note:', e);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);


  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5 font-mono">
              Enterprise Cryptographic Control Center
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              ECDAT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic cryptographic discovery, Standardized CBOM, Mosca Quantum Risk, and PQC Migration.
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
            onClick={() => navigate('/digital-twin')}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
          >
            Digital Twin
          </Button>
        </div>
      </div>

      {/* ðŸŒŸ WOW FACTOR CALLOUT: Cryptographic Risk Digital Twin Banner */}
      <Card glow="cyan" className="p-6 border-cyan-500/40 bg-gradient-to-r from-navy-950 via-navy-900 to-purple-950/30 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30">
                â­ Featured Innovation
              </span>
              <span className="text-[10px] font-mono text-purple-300">Decision-Support Architecture</span>
            </div>
            <h2 className="text-xl font-black text-white font-mono tracking-tight">
              Cryptographic Risk Digital Twin
            </h2>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Explore the live topological graph connecting <strong>Enterprise Assets</strong> â†’ <strong>Cryptographic Primitives</strong> â†’ <strong>Quantum Threat Horizon</strong> â†’ <strong>NIST FIPS 203/204 Migration Paths</strong> with instant context inspection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="cyber"
              onClick={() => navigate('/digital-twin')}
              className="text-xs font-bold font-mono px-5 py-2.5 shadow-lg shadow-cyan-500/20"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Open Digital Twin
            </Button>
          </div>
        </div>
      </Card>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Monitored Assets"
          value={riskData.total_assets}
          subtitle={`${riskData.assets_scanned} actively scanned`}
          icon={Layers}
          trend={riskData.total_assets > 0 ? { value: `${riskData.total_assets} Tracked`, isPositive: true } : undefined}
          glow="blue"
        />

        <KPICard
          title="Crypto Primitives"
          value={riskData.total_crypto_instances}
          subtitle="Discovered in code, certs & endpoints"
          icon={Binary}
          glow="cyan"
        />

        <KPICard
          title="Quantum Exposure"
          value={riskData.total_crypto_instances > 0
            ? `${riskData.total_crypto_instances - Math.round((riskData.pqc_score / 100) * riskData.total_crypto_instances)} Items`
            : "0 Items"}
          subtitle={riskData.total_crypto_instances > 0 && riskData.pqc_score < 100
            ? "Requires FIPS PQC Migration"
            : "No Vulnerable Primitives"}
          icon={Flame}
          variant={riskData.total_crypto_instances > 0 && riskData.pqc_score < 100 ? "critical" : "default"}
          glow="purple"
        />

        <KPICard
          title="High Severity Findings"
          value={riskData.critical_findings + riskData.high_findings}
          subtitle={`${riskData.critical_findings} Critical • ${riskData.high_findings} High`}
          icon={AlertTriangle}
          variant={riskData.critical_findings > 0 ? "critical" : (riskData.high_findings > 0 ? "warning" : "default")}
          glow="cyan"
        />
      </div>

      {/* Score Gauges & Core Posture Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Security Score Gauge */}
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <ScoreGauge
            score={riskData.overall_score}
            label="Overall Cryptographic Score"
            sublabel={riskData.total_crypto_instances > 0 ? "Deterministic formula derived from verified primitives" : "Clean baseline score • Awaiting initial scan"}
            type="security"
          />
        </Card>

        {/* PQC Readiness Score Gauge */}
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <ScoreGauge
            score={riskData.pqc_score}
            label="Post-Quantum Readiness"
            sublabel={riskData.total_crypto_instances > 0 ? "Quantum-safe vs Shor-vulnerable public key ratio" : "Quantum-safe baseline • No vulnerable keys"}
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
                <span>Key Hygiene & Rotation</span>
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
                <span>Post-Quantum Margin</span>
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

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Severity Distribution */}
        <Card className="space-y-4">
          <CardHeader title="Severity Distribution" subtitle="Findings categorized by risk tier" />
          <div className="h-56 w-full flex items-center justify-center">
            {riskData.severity_distribution.length > 0 ? (
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
            ) : (
              <p className="text-xs font-mono text-slate-500 text-center">
                No vulnerabilities discovered.<br />Execute a scan to generate severity breakdown.
              </p>
            )}
          </div>
        </Card>

        {/* Algorithm Families */}
        <Card className="space-y-4">
          <CardHeader title="Cryptographic Families" subtitle="Discovered primitive distribution" />
          <div className="h-56 w-full flex items-center justify-center">
            {riskData.algorithm_distribution.length > 0 ? (
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
            ) : (
              <p className="text-xs font-mono text-slate-500 text-center">
                No algorithms cataloged.<br />Upload a code archive or APK to inspect primitives.
              </p>
            )}
          </div>
        </Card>

        {/* Security Trend */}
        <Card className="space-y-4">
          <CardHeader title="Security Score Trend" subtitle="Progressive organizational posture" />
          <div className="h-56 w-full flex items-center justify-center">
            {riskData.risk_trends.length > 0 ? (
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
            ) : (
              <p className="text-xs font-mono text-slate-500 text-center">
                Audit history begins with your first scan.
              </p>
            )}
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

          {recentFindings.length > 0 ? (
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
                  {recentFindings.map(f => (
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
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 font-mono text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mx-auto mb-2" />
              <p>No active cryptographic findings</p>
              <p className="text-[10px] text-slate-600 mt-1">Execute a scan to detect algorithms, weak keys & ciphers</p>
            </div>
          )}
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

          {recentScans.length > 0 ? (
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
                  {recentScans.map(s => (
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
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {s.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 font-mono text-xs">
              <Play className="w-8 h-8 text-cyan-500/60 mx-auto mb-2" />
              <p>No assessment scans executed yet</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/scans/new')}
                className="mt-2 text-cyan-400 hover:text-cyan-300"
              >
                Execute First Scan →
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
