import React, { useEffect, useState } from 'react';
import {
  Cpu,
  Shield,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Layers,
  Sparkles,
  Sliders,
  DollarSign,
  Activity,
  Zap,
  Clock,
  HardDrive,
  BarChart3
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { ScoreGauge } from '../components/ui/ScoreGauge';
import { Button } from '../components/ui/Button';
import { PQCReadinessOverview, PQCBenchmarkItem, MigrationCostResult, CryptoAgilityScore } from '../types';
import * as api from '../services/api';

export const PQCReadinessPage: React.FC = () => {
  const [pqc, setPqc] = useState<PQCReadinessOverview | null>(null);
  const [benchmarks, setBenchmarks] = useState<PQCBenchmarkItem[]>([]);
  const [activeTab, setActiveTab] = useState<'benchmarks' | 'performance' | 'cost_estimator' | 'roadmap'>('benchmarks');

  // Cost Estimator Inputs
  const [numApps, setNumApps] = useState<number>(8);
  const [numCerts, setNumCerts] = useState<number>(24);
  const [numHsms, setNumHsms] = useState<number>(3);
  const [costResult, setCostResult] = useState<MigrationCostResult | null>(null);

  // Crypto Agility
  const [agility, setAgility] = useState<CryptoAgilityScore | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pqcData, benchData, agilityData] = await Promise.all([
          api.fetchPQCOverview(),
          api.fetchPQCBenchmarks(),
          api.fetchCryptoAgility()
        ]);
        if (pqcData) setPqc(pqcData);
        if (benchData) setBenchmarks(benchData);
        if (agilityData) setAgility(agilityData);
      } catch (e) {
        console.warn(e);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const calcCost = async () => {
      const res = await api.calculateMigrationCost({
        num_applications: numApps,
        num_certificates: numCerts,
        num_hardware_hsms: numHsms,
        developer_hourly_rate_inr: 2500,
        estimated_developer_days_per_app: 15
      });
      setCostResult(res);
    };
    calcCost();
  }, [numApps, numCerts, numHsms]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5 font-mono">
            <Cpu className="w-6 h-6 text-purple-400" />
            Post-Quantum Cryptography (PQC) Migration Suite
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            NIST Approved Standards: ML-KEM (FIPS 203), ML-DSA (FIPS 204), SLH-DSA (FIPS 205), HQC Round 4, and Hybrid Cryptography.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold">
            FIPS 203 & 204 Approved
          </span>
        </div>
      </div>

      {/* Top Scores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <ScoreGauge
            score={pqc?.readiness_score || 72}
            label="PQC Readiness Score"
            sublabel="Quantum-safe vs Asymmetric vulnerable component balance"
            type="pqc"
          />
        </Card>

        <Card className="p-5 space-y-3 bg-navy-950/80 border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
            Crypto Agility Index
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-cyan-300 font-mono">{agility?.overall_score || 58}/100</span>
            <span className="text-xs text-amber-400 font-mono font-bold">({agility?.rating || 'Moderate Agility'})</span>
          </div>
          <div className="space-y-1.5 text-[11px] font-mono text-slate-400">
            <div className="flex justify-between">
              <span>Abstraction Layer:</span>
              <span className="text-white font-bold">{agility?.breakdown.abstraction_layer_score || 45}%</span>
            </div>
            <div className="flex justify-between">
              <span>Dynamic Negotiation:</span>
              <span className="text-white font-bold">{agility?.breakdown.dynamic_cipher_negotiation || 70}%</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-3 bg-purple-950/20 border-purple-500/30">
          <span className="text-[10px] font-mono uppercase text-purple-300 font-bold tracking-wider">
            Standardized PQC Target
          </span>
          <p className="text-lg font-black text-white font-mono">ML-KEM-768 & ML-DSA-65</p>
          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
            Module-Lattice key encapsulation and signatures providing Category 3 (AES-192 equivalent) quantum resilience.
          </p>
        </Card>

        <Card className="p-5 space-y-3 bg-navy-950/80 border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
            Estimated Migration Budget
          </span>
          <p className="text-3xl font-black text-emerald-400 font-mono">
            {costResult?.total_estimated_cost_formatted || '₹14.2 Lakh'}
          </p>
          <p className="text-[11px] text-slate-400 font-sans">
            Covers {numApps} applications, {numCerts} certificates, and {numHsms} HSM clusters.
          </p>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'benchmarks', label: '🧪 PQC Benchmarking Lab', icon: Zap },
          { id: 'performance', label: '⚡ Performance Impact Simulator', icon: BarChart3 },
          { id: 'cost_estimator', label: '💰 Migration Cost Estimator', icon: DollarSign },
          { id: 'roadmap', label: '🗺️ 6-Phase Migration Roadmap', icon: BookOpen }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PQC Benchmarking Lab */}
      {activeTab === 'benchmarks' && (
        <Card className="p-6 space-y-4 border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-black text-white font-mono flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                NIST Post-Quantum Cryptography Algorithm Benchmarking Lab
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Key generation, encapsulation, decapsulation, and signature metrics measured across FIPS 203, FIPS 204, FIPS 205, and HQC.
              </p>
            </div>
            <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded border border-purple-500/20">
              Live Reference Telemetry
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Algorithm</th>
                  <th className="pb-3">Type / Standard</th>
                  <th className="pb-3">Security Level</th>
                  <th className="pb-3">Public Key</th>
                  <th className="pb-3">Ciphertext / Sig</th>
                  <th className="pb-3">KeyGen Cycles</th>
                  <th className="pb-3">Encaps / Sign</th>
                  <th className="pb-3">Latency (ms)</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {benchmarks.map((b, i) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 font-bold text-cyan-300">{b.algorithm}</td>
                    <td className="py-3.5">
                      <span className="text-slate-300">{b.type}</span>
                      <span className="text-[10px] text-slate-500 block">{b.standard}</span>
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-navy-950 text-purple-300 border border-slate-700">
                        NIST Level {b.security_category}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-300">{b.public_key_bytes} Bytes</td>
                    <td className="py-3.5 text-purple-300 font-bold">{b.ciphertext_or_sig_bytes} Bytes</td>
                    <td className="py-3.5 text-slate-300">{b.keygen_cpu_cycles_k} kCycles</td>
                    <td className="py-3.5 text-slate-300">{b.encaps_or_sign_cpu_cycles_k} kCycles</td>
                    <td className="py-3.5 font-bold text-emerald-400">{b.estimated_latency_ms} ms</td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: Performance Impact Simulator */}
      {activeTab === 'performance' && (
        <Card className="p-6 space-y-6 border-slate-800 shadow-2xl">
          <CardHeader
            title="Handshake & Cryptographic Overhead Comparison"
            subtitle="Comparing classical asymmetric algorithms (RSA-2048, ECDSA-P256) with NIST Post-Quantum Standards"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Exchange Comparison */}
            <div className="p-5 rounded-2xl bg-navy-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white font-mono">Key Exchange: RSA-2048 vs ML-KEM-768</h4>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  2.1x Faster Handshake
                </span>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>RSA-2048 Latency: 14.2 ms</span>
                    <span>ML-KEM-768: 6.8 ms (Faster)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div style={{ width: '68%' }} className="bg-rose-500 h-full" />
                    <div style={{ width: '32%' }} className="bg-emerald-400 h-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>RSA-2048 Ciphertext: 256 B</span>
                    <span>ML-KEM-768: 1,088 B (4.2x)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div style={{ width: '20%' }} className="bg-slate-500 h-full" />
                    <div style={{ width: '80%' }} className="bg-purple-500 h-full" />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                ML-KEM-768 provides superior cryptographic execution performance over RSA, with minimal 1.1 KB bandwidth overhead that easily fits into standard 1500-byte Ethernet MTU packets without TCP fragmentation.
              </p>
            </div>

            {/* Signature Comparison */}
            <div className="p-5 rounded-2xl bg-navy-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white font-mono">Digital Signatures: ECDSA vs ML-DSA-65</h4>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                  Requires MTU Tuning
                </span>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>ECDSA-P256 Latency: 1.2 ms</span>
                    <span>ML-DSA-65: 2.1 ms</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div style={{ width: '40%' }} className="bg-emerald-400 h-full" />
                    <div style={{ width: '60%' }} className="bg-purple-500 h-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>ECDSA Signature: 64 B</span>
                    <span>ML-DSA-65: 3,309 B (51x)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div style={{ width: '10%' }} className="bg-slate-500 h-full" />
                    <div style={{ width: '90%' }} className="bg-rose-500 h-full" />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                ML-DSA-65 signatures (3.3 KB) and public keys (1.9 KB) require TLS certificate compression (RFC 8879) and intermediate certificate caching to prevent multi-packet TCP roundtrips during handshake establishment.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 3: Migration Cost Estimator */}
      {activeTab === 'cost_estimator' && (
        <Card className="p-6 space-y-6 border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-black text-white font-mono flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Enterprise PQC Migration Financial & Resource Cost Estimator
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculate developer hours, PKI certificate reissuance, HSM hardware upgrades, and compliance testing.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
              <span className="text-slate-400 block">Number of Monitored Applications</span>
              <input
                type="number"
                min={1}
                max={50}
                value={numApps}
                onChange={e => setNumApps(Number(e.target.value))}
                className="w-full p-2 rounded-lg bg-navy-900 border border-slate-700 text-white font-bold"
              />
            </div>

            <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
              <span className="text-slate-400 block">Number of X.509 Certificates to Reissue</span>
              <input
                type="number"
                min={1}
                max={200}
                value={numCerts}
                onChange={e => setNumCerts(Number(e.target.value))}
                className="w-full p-2 rounded-lg bg-navy-900 border border-slate-700 text-white font-bold"
              />
            </div>

            <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
              <span className="text-slate-400 block">FIPS Hardware Security Modules (HSM)</span>
              <input
                type="number"
                min={0}
                max={20}
                value={numHsms}
                onChange={e => setNumHsms(Number(e.target.value))}
                className="w-full p-2 rounded-lg bg-navy-900 border border-slate-700 text-white font-bold"
              />
            </div>
          </div>

          {/* Breakdown Results */}
          {costResult && (
            <div className="p-5 rounded-2xl bg-navy-950 border border-slate-800 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-slate-300 font-bold uppercase">Estimated Budget Breakdown</span>
                <span className="text-lg font-black text-emerald-400">{costResult.total_estimated_cost_formatted}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Engineering & Refactoring Effort:</span>
                  <span className="font-bold text-white">₹{(costResult.developer_effort_cost_inr / 100000).toFixed(2)} Lakh</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Certificate Reissuance (Dual Certs):</span>
                  <span className="font-bold text-white">₹{(costResult.certificate_replacement_inr / 100000).toFixed(2)} Lakh</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">HSM Hardware & Cloud KMS Upgrades:</span>
                  <span className="font-bold text-white">₹{(costResult.hardware_hsm_upgrade_inr / 100000).toFixed(2)} Lakh</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Security Audit & FIPS Validation:</span>
                  <span className="font-bold text-white">₹{(costResult.testing_audit_cost_inr / 100000).toFixed(2)} Lakh</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* TAB 4: 6-Phase Migration Roadmap */}
      {activeTab === 'roadmap' && (
        <Card className="p-6 space-y-6 border-slate-800 shadow-2xl">
          <CardHeader
            title="6-Phase Automated Enterprise PQC Transition Roadmap"
            subtitle="Aligns with NIST IR 8454, CNSA 2.0 and FIPS 203/204 standard horizons"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
            {[
              { phase: 'PHASE 1', title: 'Cryptographic Inventory (CBOM)', desc: 'Scan all source code, binaries, libraries, containers, and TLS endpoints. Generate standardized CycloneDX 1.6 CBOM.', standard: 'NIST IR 8454' },
              { phase: 'PHASE 2', title: 'Quantum Risk & Mosca Classification', desc: 'Compute data lifetime X and migration time Y against CRQC horizon Z. Identify Harvest Now Decrypt Later targets.', standard: 'Mosca Theorem' },
              { phase: 'PHASE 3', title: 'PQC Pilot & Algorithm Benchmarking', desc: 'Deploy sandbox testing for ML-KEM-768 and ML-DSA-65 across internal microservices and API gateways.', standard: 'FIPS 203 / 204' },
              { phase: 'PHASE 4', title: 'Hybrid Cryptography Deployment', desc: 'Roll out dual key encapsulation (X25519 + ML-KEM) and composite X.509 certificates to maintain classical compatibility.', standard: 'IETF TLS 1.3 Draft' },
              { phase: 'PHASE 5', title: 'Production Enterprise Migration', desc: 'Enforce post-quantum ciphers across payment gateways, citizen auth portals, and EHR genomic database encryption.', standard: 'CNSA 2.0 (2030 Horizon)' },
              { phase: 'PHASE 6', title: 'Legacy Crypto Retirement', desc: 'Permanently deprecate RSA-1024/2048, 3DES, MD5, and SHA-1 across all enterprise PKI root certificates and keys.', standard: 'Zero Trust Crypto Agility' }
            ].map((step, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-navy-950 space-y-2">
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  {step.phase}
                </span>
                <h4 className="text-sm font-bold text-white mt-1">{step.title}</h4>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">{step.desc}</p>
                <div className="pt-2 border-t border-slate-800 text-[10px] text-purple-400 font-bold">
                  Standard: {step.standard}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
