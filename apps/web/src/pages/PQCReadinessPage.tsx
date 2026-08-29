import React, { useEffect, useState } from 'react';
import {
  Cpu,
  Shield,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Layers,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { ScoreGauge } from '../components/ui/ScoreGauge';
import { PQCReadinessOverview } from '../types';
import * as api from '../services/api';

export const PQCReadinessPage: React.FC = () => {
  const [pqc, setPqc] = useState<PQCReadinessOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPQC = async () => {
      try {
        setIsLoading(true);
        const data = await api.fetchPQCOverview();
        setPqc(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadPQC();
  }, []);

  if (isLoading || !pqc) {
    return <div className="p-8 text-center text-slate-400">Loading Post-Quantum Readiness Matrix...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Cpu className="w-6 h-6 text-purple-400" />
          Post-Quantum Cryptography (PQC) Readiness Center
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          NIST PQC Standards (FIPS 203 ML-KEM, FIPS 204 ML-DSA) compliance, Shor's algorithm threat modeling, and hybrid migration plans.
        </p>
      </div>

      {/* Top Scores & Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <ScoreGauge
            score={pqc.readiness_score}
            label="PQC Readiness Score"
            sublabel="Quantum-safe vs Asymmetric vulnerable component balance"
            type="pqc"
          />
        </Card>

        <Card className="md:col-span-2 space-y-4">
          <CardHeader
            title="Quantum Threat Matrix (Shor & Grover Impact)"
            subtitle="Categorization of cryptographic primitive resilience against Cryptanalytically Relevant Quantum Computers (CRQC)"
          />

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 space-y-1">
              <span className="text-[10px] uppercase text-rose-400 font-bold">Quantum Sensitive (Broken on CRQC)</span>
              <p className="text-2xl font-bold text-white">{pqc.quantum_sensitive_count} Instances</p>
              <p className="text-[11px] text-slate-400 font-sans">
                RSA, ECC, ECDSA, ECDH, DSA, Diffie-Hellman (Vulnerable via Shor's Algorithm).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-1">
              <span className="text-[10px] uppercase text-emerald-400 font-bold">Quantum Resistant (Safe)</span>
              <p className="text-2xl font-bold text-white">{pqc.quantum_safe_count} Instances</p>
              <p className="text-[11px] text-slate-400 font-sans">
                AES-256 (Grover halving maintains 128-bit margin), SHA-256/384/512, ChaCha20.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Primitive Vulnerability Assessment Table */}
      <Card className="space-y-4">
        <CardHeader
          title="Cryptographic Primitives Assessment"
          subtitle="Evaluation of discovered algorithms against modern PQC transition standards"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3">Algorithm</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Quantum Threat</th>
                <th className="pb-3">Migration Candidate</th>
                <th className="pb-3">Standard</th>
                <th className="pb-3">Instances</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {pqc.components.map((c, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 font-bold text-cyan-300">{c.algorithm}</td>
                  <td className="py-3.5 text-slate-400">{c.category}</td>
                  <td className="py-3.5 font-sans text-slate-300">{c.quantum_threat}</td>
                  <td className="py-3.5 font-bold text-purple-300">{c.pqc_replacement}</td>
                  <td className="py-3.5 text-slate-400">{c.standard_reference}</td>
                  <td className="py-3.5 font-bold text-white">{c.instances_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* NIST Migration Roadmap */}
      <Card className="space-y-4">
        <CardHeader
          title="NIST Post-Quantum Migration Strategy"
          subtitle="4-phase enterprise roadmap aligning with NIST IR 8454 and CNSA 2.0 timelines"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pqc.migration_roadmap.map((step, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-navy-950/70 space-y-2">
              <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                {step.phase}
              </span>
              <h4 className="text-sm font-bold text-white mt-1">{step.target}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{step.action}</p>
              <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-purple-400">
                Ref: {step.nist_guideline}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
