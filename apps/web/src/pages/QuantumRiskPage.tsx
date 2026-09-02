import React, { useState, useEffect } from 'react';
import {
  Flame,
  Cpu,
  Shield,
  Clock,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  Info,
  Calendar,
  Lock,
  Unlock
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ScoreGauge } from '../components/ui/ScoreGauge';
import { MoscaRiskResult, HNDLRiskRecord } from '../types';
import * as api from '../services/api';

export const QuantumRiskPage: React.FC = () => {
  // Mosca Theorem Parameters
  const [dataLifetimeX, setDataLifetimeX] = useState<number>(15);
  const [migrationTimeY, setMigrationTimeY] = useState<number>(4);
  const [crqcArrivalZ, setCrqcArrivalZ] = useState<number>(10);
  const [moscaResult, setMoscaResult] = useState<MoscaRiskResult | null>(null);

  // HNDL Records & CRQC Simulator
  const [hndlRecords, setHndlRecords] = useState<HNDLRiskRecord[]>([]);
  const [selectedHorizonYear, setSelectedHorizonYear] = useState<number>(2035);

  useEffect(() => {
    const runMosca = async () => {
      const res = await api.calculateMoscaRisk({
        data_lifetime_X: dataLifetimeX,
        migration_time_Y: migrationTimeY,
        crqc_arrival_Z: crqcArrivalZ
      });
      setMoscaResult(res);
    };
    runMosca();
  }, [dataLifetimeX, migrationTimeY, crqcArrivalZ]);

  useEffect(() => {
    const loadHndl = async () => {
      const records = await api.fetchHNDLRiskRecords();
      setHndlRecords(records);
    };
    loadHndl();
  }, []);

  const currentYear = new Date().getFullYear();
  const crqcPredictedYear = currentYear + crqcArrivalZ;
  const sumXY = dataLifetimeX + migrationTimeY;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5 font-mono">
            <Flame className="w-6 h-6 text-rose-400" />
            Quantum Risk Engine & Mosca's Theorem Lab
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quantify Cryptanalytically Relevant Quantum Computer (CRQC) exposure, Harvest Now Decrypt Later (HNDL) threats, and Mosca inequality validation.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Threat Horizon Target:</span>
          <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
            CRQC ~ {crqcPredictedYear} (Z = {crqcArrivalZ}y)
          </span>
        </div>
      </div>

      {/* Top Threat KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 border-rose-500/30 bg-rose-950/20 space-y-1">
          <span className="text-[10px] font-mono uppercase text-rose-400 font-bold tracking-wider">
            Mosca Inequality (X + Y &gt; Z)
          </span>
          <p className="text-2xl font-black text-white font-mono">
            {moscaResult?.is_vulnerable ? 'EXPOSED (X+Y > Z)' : 'SAFE BUFFER'}
          </p>
          <p className="text-[11px] text-slate-400 font-sans">
            Total retention + migration = <strong className="text-rose-300">{sumXY} Years</strong> vs CRQC horizon <strong className="text-cyan-300">{crqcArrivalZ} Years</strong>.
          </p>
        </Card>

        <Card className="p-5 border-amber-500/30 bg-amber-950/20 space-y-1">
          <span className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider">
            HNDL Critical Assets
          </span>
          <p className="text-2xl font-black text-white font-mono">{hndlRecords.length} Systems</p>
          <p className="text-[11px] text-slate-400 font-sans">
            Long-lived healthcare, government and financial assets exposed to ciphertext harvesting today.
          </p>
        </Card>

        <Card className="p-5 border-purple-500/30 bg-purple-950/20 space-y-1">
          <span className="text-[10px] font-mono uppercase text-purple-400 font-bold tracking-wider">
            Shor's Algorithm Threat
          </span>
          <p className="text-2xl font-black text-white font-mono">100% Broken</p>
          <p className="text-[11px] text-slate-400 font-sans">
            All RSA (1024-4096), ECC (P-256/384), ECDSA, ECDH polynomial-time compromised on CRQC.
          </p>
        </Card>

        <Card className="p-5 border-emerald-500/30 bg-emerald-950/20 space-y-1">
          <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider">
            Grover's Algorithm Threat
          </span>
          <p className="text-2xl font-black text-emerald-300 font-mono">128-bit Safe</p>
          <p className="text-[11px] text-slate-400 font-sans">
            AES-256 and SHA-256/384 retain 128-bit collision & key search security margin.
          </p>
        </Card>
      </div>

      {/* Interactive Mosca's Theorem Simulator */}
      <Card className="p-6 space-y-6 border-slate-800 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-black text-white font-mono flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              Interactive Mosca's Theorem Risk Calculator
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Theorem: If Data Lifetime (<strong>X</strong>) + Migration Time (<strong>Y</strong>) &gt; Time Until CRQC (<strong>Z</strong>), then Quantum Risk is <span className="text-rose-400 font-bold">CRITICAL</span>.
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-lg bg-navy-950 text-cyan-300 border border-slate-700">
            Formula: X ({dataLifetimeX}y) + Y ({migrationTimeY}y) = {sumXY}y vs Z ({crqcArrivalZ}y)
          </span>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          {/* Slider X */}
          <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                Data Lifetime (X)
              </span>
              <span className="text-base font-black text-cyan-300">{dataLifetimeX} Years</span>
            </div>
            <input
              type="range"
              min={1}
              max={40}
              value={dataLifetimeX}
              onChange={e => setDataLifetimeX(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <p className="text-[11px] text-slate-400 font-sans leading-tight">
              Duration encrypted data must remain confidential (e.g. 25-30 yrs for genomics, 10 yrs for banking).
            </p>
          </div>

          {/* Slider Y */}
          <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-400" />
                Migration Time (Y)
              </span>
              <span className="text-base font-black text-purple-300">{migrationTimeY} Years</span>
            </div>
            <input
              type="range"
              min={1}
              max={15}
              value={migrationTimeY}
              onChange={e => setMigrationTimeY(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
            <p className="text-[11px] text-slate-400 font-sans leading-tight">
              Time needed to audit, pilot, test, and deploy PQC (ML-KEM/ML-DSA) across legacy infrastructure.
            </p>
          </div>

          {/* Slider Z */}
          <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-400" />
                Time Until CRQC (Z)
              </span>
              <span className="text-base font-black text-rose-300">{crqcArrivalZ} Years (~{crqcPredictedYear})</span>
            </div>
            <input
              type="range"
              min={3}
              max={25}
              value={crqcArrivalZ}
              onChange={e => setCrqcArrivalZ(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
            />
            <p className="text-[11px] text-slate-400 font-sans leading-tight">
              Predicted timeline for a Cryptanalytically Relevant Quantum Computer to break 2048-bit RSA.
            </p>
          </div>
        </div>

        {/* Dynamic Threat Timeline Visualizer */}
        {moscaResult && (
          <div className="p-5 rounded-2xl bg-navy-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Visual Mosca Timeline ({currentYear} → {currentYear + Math.max(sumXY, crqcArrivalZ) + 5})
              </span>
              <span
                className={`text-xs font-mono font-black px-2.5 py-1 rounded-lg uppercase ${
                  moscaResult.is_vulnerable
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {moscaResult.headline}
              </span>
            </div>

            {/* Visual Timeline Bar */}
            <div className="relative pt-6 pb-2">
              <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                {/* Migration Time (Y) */}
                <div
                  style={{ width: `${(migrationTimeY / (sumXY + 5)) * 100}%` }}
                  className="bg-purple-500/80 h-full flex items-center justify-center text-[9px] font-mono text-white font-bold"
                >
                  Y ({migrationTimeY}y)
                </div>
                {/* Data Lifetime (X) */}
                <div
                  style={{ width: `${(dataLifetimeX / (sumXY + 5)) * 100}%` }}
                  className="bg-cyan-500/80 h-full flex items-center justify-center text-[9px] font-mono text-navy-950 font-bold"
                >
                  X ({dataLifetimeX}y)
                </div>
              </div>

              {/* CRQC Marker */}
              <div
                style={{ left: `${(crqcArrivalZ / (sumXY + 5)) * 100}%` }}
                className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10 flex flex-col items-center"
              >
                <span className="text-[10px] font-mono font-bold text-rose-400 bg-navy-950 px-1.5 py-0.5 rounded border border-rose-500/40 shadow -mt-6">
                  CRQC Arrival (~{crqcPredictedYear})
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed pt-2">
              {moscaResult.explanation}
            </p>
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>Recommended Action: {moscaResult.action_required}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Harvest Now Decrypt Later (HNDL) Critical Systems Table */}
      <Card className="p-6 space-y-4 border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-black text-white font-mono flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" />
              Harvest Now, Decrypt Later (HNDL) Monitored Assets
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Identifies long-lived sensitive systems vulnerable to state-sponsored encrypted session interception today.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/20">
            {hndlRecords.length} Critical Targets
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3">Asset & Data Scope</th>
                <th className="pb-3">Algorithm & Key</th>
                <th className="pb-3">Data Retention</th>
                <th className="pb-3">HNDL Score</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Remediation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {hndlRecords.map(item => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5">
                    <span className="font-bold text-white block">{item.asset_name}</span>
                    <span className="text-[10px] text-slate-400">{item.data_classification}</span>
                  </td>
                  <td className="py-3.5 text-cyan-300 font-bold">{item.algorithm}</td>
                  <td className="py-3.5 text-slate-300">{item.data_retention_years} Years</td>
                  <td className="py-3.5">
                    <span className="text-base font-bold text-rose-400">{item.hndl_threat_score}/100</span>
                  </td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {item.hndl_status}
                    </span>
                  </td>
                  <td className="py-3.5 font-sans text-xs text-slate-300 max-w-xs leading-relaxed">
                    {item.recommended_immediate_action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
