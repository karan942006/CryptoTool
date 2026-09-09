import React, { useEffect, useState } from 'react';
import {
  Flame,
  Shield,
  Layers,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Cpu,
  Binary
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { Card, CardHeader } from '../components/ui/Card';
import { KPICard } from '../components/ui/KPICard';
import { ScoreGauge } from '../components/ui/ScoreGauge';
import { RiskOverview } from '../types';
import * as api from '../services/api';

const defaultRisk: RiskOverview = {
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

export const RiskDashboardPage: React.FC = () => {
  const [risk, setRisk] = useState<RiskOverview>(defaultRisk);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadRisk = async () => {
      try {
        const data = await api.fetchRiskOverview();
        if (data) setRisk(data);
      } catch (e) {
        console.warn(e);
      }
    };
    loadRisk();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Flame className="w-6 h-6 text-rose-500" />
          Enterprise Cryptographic Risk Quantification
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Deterministic mathematical modeling of cryptographic posture, algorithm weaknesses, and exposure.
        </p>
      </div>

      {/* Top Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <ScoreGauge
            score={risk.overall_score}
            label="Organization Cryptographic Health"
            sublabel="Weighted factor across all discovered enterprise primitives"
            type="security"
          />
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <ScoreGauge
            score={risk.pqc_score}
            label="Post-Quantum Cryptography Index"
            sublabel="Percentage of enterprise cryptographic inventory immune to Shor's algorithm"
            type="pqc"
          />
        </Card>
      </div>

      {/* Transparent Formula Breakdown */}
      <Card className="space-y-4">
        <CardHeader
          title="Transparent Scoring Formula (Why This Score?)"
          subtitle="Strict mathematical derivation — zero AI hallucinations"
        />

        <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-3">
          <p className="text-cyan-300 font-bold">
            Security Score = 100 - [(Critical_Count × 25) + (High_Count × 15) + (Medium_Count × 5) + (Low_Count × 1)]
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] pt-2 border-t border-slate-800 text-slate-400">
            <div>Critical Findings: <span className="text-rose-400 font-bold">{risk.critical_findings} (-{risk.critical_findings * 25} pts)</span></div>
            <div>High Findings: <span className="text-orange-400 font-bold">{risk.high_findings} (-{risk.high_findings * 15} pts)</span></div>
            <div>Medium Findings: <span className="text-amber-400 font-bold">{risk.medium_findings} (-{risk.medium_findings * 5} pts)</span></div>
            <div>Low Findings: <span className="text-blue-400 font-bold">{risk.low_findings} (-{risk.low_findings * 1} pts)</span></div>
          </div>
        </div>
      </Card>

      {/* Historical Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <CardHeader title="Security Score Trend" subtitle="Progress across executed scans" />
          <div className="h-64 w-full flex items-center justify-center">
            {risk.risk_trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={risk.risk_trends}>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="score" stroke="#00f2fe" fill="#00f2fe" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs font-mono text-slate-500 text-center">
                Awaiting scan execution.<br />Score trends will plot here as scans are completed.
              </p>
            )}
          </div>
        </Card>

        <Card className="space-y-4">
          <CardHeader title="Legacy Cryptography Remediation" subtitle="Deprecated algorithm count tracking" />
          <div className="h-64 w-full flex items-center justify-center">
            {risk.risk_trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={risk.risk_trends}>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="legacy_count" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs font-mono text-slate-500 text-center">
                Zero legacy cryptographic findings recorded.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
