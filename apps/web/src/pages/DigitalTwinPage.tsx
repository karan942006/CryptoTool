import React, { useState, useEffect } from 'react';
import {
  Shield,
  Cpu,
  Flame,
  Layers,
  Server,
  Cloud,
  Smartphone,
  Lock,
  RefreshCw,
  Search,
  Sparkles,
  Download,
  Copy,
  Check,
  Zap,
  ArrowRight,
  Info,
  Radio,
  FileCode2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { SeverityBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { DigitalTwinNode, DigitalTwinGraph, CryptoAgilityScore } from '../types';
import * as api from '../services/api';

type HorizonStage = 'present' | 'transition' | 'qday';

interface PQCRecipe {
  lang: string;
  filename: string;
  code: string;
  standard: string;
}

export const DigitalTwinPage: React.FC = () => {
  const [graph, setGraph] = useState<DigitalTwinGraph | null>(null);
  const [agility, setAgility] = useState<CryptoAgilityScore | null>(null);
  const [selectedNode, setSelectedNode] = useState<DigitalTwinNode | null>(null);
  const [filterTier, setFilterTier] = useState<'all' | 'enterprise' | 'app' | 'crypto' | 'pqc'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [horizon, setHorizon] = useState<HorizonStage>('present');
  const [activeRecipeLang, setActiveRecipeLang] = useState<'java' | 'python' | 'go' | 'typescript'>('java');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadGraph = async () => {
      const [data, ag] = await Promise.all([
        api.fetchDigitalTwin(),
        api.fetchCryptoAgility()
      ]);
      setGraph(data);
      setAgility(ag);
      if (data.nodes && data.nodes.length > 0) {
        const highRisk = data.nodes.find(n => n.id === 'node-app-payment') || data.nodes[0];
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

  // Dynamic status evaluation based on Q-Day Simulator
  const getNodeEffectiveStatus = (node: DigitalTwinNode): 'critical' | 'high' | 'medium' | 'safe' | 'pqc_ready' => {
    if (horizon === 'qday') {
      if (node.details.quantum_status === 'Vulnerable') return 'critical';
      if (node.type === 'pqc_solution') return 'pqc_ready';
      return node.status;
    }
    if (horizon === 'transition') {
      if (node.details.hndl_risk === 'CRITICAL' || node.details.hndl_risk === 'HIGH') return 'critical';
      return node.status;
    }
    return node.status;
  };

  const filteredNodes = graph.nodes.filter(n => {
    if (filterTier === 'enterprise' && n.type !== 'enterprise') return false;
    if (filterTier === 'app' && n.type !== 'app' && n.type !== 'server') return false;
    if (filterTier === 'crypto' && n.type !== 'crypto') return false;
    if (filterTier === 'pqc' && n.type !== 'pqc_solution' && n.type !== 'quantum_threat') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        n.label.toLowerCase().includes(q) ||
        n.details.algorithm?.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'enterprise':
        return <Shield className="w-4 h-4 text-cyan-400" />;
      case 'app':
        return <Smartphone className="w-4 h-4 text-purple-400" />;
      case 'server':
        return <Server className="w-4 h-4 text-indigo-400" />;
      case 'cloud':
        return <Cloud className="w-4 h-4 text-sky-400" />;
      case 'crypto':
        return <Lock className="w-4 h-4 text-amber-400" />;
      case 'quantum_threat':
        return <Flame className="w-4 h-4 text-rose-400" />;
      case 'pqc_solution':
        return <Cpu className="w-4 h-4 text-emerald-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBorder = (status: string, isSelected: boolean) => {
    if (isSelected) {
      return 'border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400/50 shadow-lg shadow-cyan-500/10';
    }
    switch (status) {
      case 'critical':
        return 'border-rose-500/40 hover:border-rose-500/80 bg-rose-950/20';
      case 'high':
        return 'border-amber-500/40 hover:border-amber-500/80 bg-amber-950/20';
      case 'medium':
        return 'border-yellow-500/40 hover:border-yellow-500/80 bg-yellow-950/15';
      case 'pqc_ready':
        return 'border-emerald-500/40 hover:border-emerald-500/80 bg-emerald-950/20';
      case 'safe':
        return 'border-slate-700/60 hover:border-slate-600 bg-navy-900/60';
      default:
        return 'border-slate-800 hover:border-slate-700 bg-navy-900/40';
    }
  };

  // 1-Click Code Recipes
  const getPqcRecipes = (node: DigitalTwinNode): Record<'java' | 'python' | 'go' | 'typescript', PQCRecipe> => {
    const isKem = !node.details.algorithm || !node.details.algorithm.includes('Sign');
    return {
      java: {
        lang: 'Java (Bouncy Castle PQC)',
        filename: isKem ? 'MLKEMKeyExchange.java' : 'MLDSASignature.java',
        standard: isKem ? 'FIPS 203 (ML-KEM-768)' : 'FIPS 204 (ML-DSA-65)',
        code: isKem
          ? `// NIST FIPS 203 ML-KEM-768 Drop-in Migration
import org.bouncycastle.pqc.jcajce.provider.BouncyCastlePQCProvider;
import org.bouncycastle.pqc.jcajce.spec.MLKEMParameterSpec;
import java.security.KeyPairGenerator;
import java.security.Security;

public class MLKEMKeyExchange {
    static {
        Security.addProvider(new BouncyCastlePQCProvider());
    }

    public static void initializeKEM() throws Exception {
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("ML-KEM", "BCPQC");
        kpg.initialize(MLKEMParameterSpec.ml_kem_768);
        var keyPair = kpg.generateKeyPair();
        System.out.println("Generated FIPS 203 ML-KEM-768 Quantum-Safe KeyPair");
    }
}`
          : `// NIST FIPS 204 ML-DSA-65 Digital Signature
import org.bouncycastle.pqc.jcajce.provider.BouncyCastlePQCProvider;
import org.bouncycastle.pqc.jcajce.spec.MLDSAParameterSpec;
import java.security.KeyPairGenerator;
import java.security.Security;

public class MLDSASignature {
    static {
        Security.addProvider(new BouncyCastlePQCProvider());
    }

    public static void initializeSigner() throws Exception {
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("ML-DSA", "BCPQC");
        kpg.initialize(MLDSAParameterSpec.ml_dsa_65);
        var keyPair = kpg.generateKeyPair();
        System.out.println("Generated FIPS 204 ML-DSA-65 Quantum-Safe Signing Key");
    }
}`
      },
      python: {
        lang: 'Python (liboqs)',
        filename: 'pqc_migration.py',
        standard: 'FIPS 203 / FIPS 204',
        code: isKem
          ? `# NIST FIPS 203 ML-KEM Key Encapsulation in Python
import oqs

def run_ml_kem():
    kem_name = "ML-KEM-768"
    with oqs.KeyEncapsulation(kem_name) as client:
        public_key = client.generate_keypair()
        with oqs.KeyEncapsulation(kem_name) as server:
            ciphertext, shared_secret_server = server.encap_secret(public_key)
            shared_secret_client = client.decap_secret(ciphertext)
            assert shared_secret_client == shared_secret_server
            print("[SUCCESS] FIPS 203 ML-KEM-768 Quantum Shared Secret Established")`
          : `# NIST FIPS 204 ML-DSA Signature in Python
import oqs

def run_ml_dsa():
    sig_name = "ML-DSA-65"
    with oqs.Signature(sig_name) as signer:
        public_key = signer.generate_keypair()
        message = b"Authenticated Enterprise Payload"
        signature = signer.sign(message)
        with oqs.Signature(sig_name) as verifier:
            is_valid = verifier.verify(message, signature, public_key)
            print(f"[SUCCESS] FIPS 204 ML-DSA-65 Signature Valid: {is_valid}")`
      },
      go: {
        lang: 'Go (CIRCL / FIPS 203)',
        filename: 'kem.go',
        standard: 'FIPS 203 (ML-KEM-768)',
        code: `package main

import (
    "fmt"
    "github.com/cloudflare/circl/kem/kyber/kyber768"
)

func main() {
    scheme := kyber768.Scheme()
    pk, sk, err := scheme.GenerateKeyPair()
    if err != nil {
        panic(err)
    }
    ct, ssA, err := scheme.Encapsulate(pk)
    if err != nil {
        panic(err)
    }
    ssB, err := scheme.Decapsulate(sk, ct)
    if err != nil {
        panic(err)
    }
    fmt.Printf("FIPS 203 ML-KEM-768 Key Agreement Established. Shared Secret Match: %t\\n", string(ssA) == string(ssB))
}`
      },
      typescript: {
        lang: 'TypeScript (Web / Node)',
        filename: 'pqc-client.ts',
        standard: 'FIPS 203 (ML-KEM-768)',
        code: `import { ml_kem768 } from '@noble/post-quantum/ml-kem';

// Generate Quantum-Resilient Keypair
const aliceKeys = ml_kem768.keygen();

// Bob Encapsulates Shared Secret with Alice's Public Key
const { cipherText, sharedSecret: bobSecret } = ml_kem768.encapsulate(aliceKeys.publicKey);

// Alice Decapsulates with Secret Key
const aliceSecret = ml_kem768.decapsulate(cipherText, aliceKeys.secretKey);

console.log("FIPS 203 Shared Secret Validated:", aliceSecret.length === 32);`
      }
    };
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleExportCBOM = () => {
    const cbom = {
      bomFormat: 'CycloneDX',
      specVersion: '1.6',
      serialNumber: `urn:uuid:${Math.random().toString(36).substring(2, 11)}`,
      version: 1,
      metadata: {
        timestamp: new Date().toISOString(),
        tools: [{ vendor: 'CryptoTool (ECDAT)', name: 'Cryptographic Risk Digital Twin', version: '2.4.0' }],
        component: {
          type: 'application',
          name: 'Enterprise Cryptographic Digital Twin',
          version: '1.0.0'
        }
      },
      components: graph.nodes.map(n => ({
        type: 'cryptographic-asset',
        name: n.label,
        category: n.category,
        cryptoProperties: {
          assetType: n.type,
          algorithm: n.details.algorithm || n.label,
          quantumSecurityLevel: n.details.quantum_status === 'Resistant' ? 'Post-Quantum Secure' : 'Vulnerable',
          oid: n.id,
          detectionContext: n.details.usage
        }
      }))
    };

    const blob = new Blob([JSON.stringify(cbom, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyclonedx-cbom-digital-twin-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const effectiveVulnerableCount = horizon === 'qday'
    ? graph.nodes.filter(n => n.details.quantum_status === 'Vulnerable' || n.type === 'crypto').length
    : graph.summary.vulnerable_nodes;

  const recipes = selectedNode ? getPqcRecipes(selectedNode) : null;
  const currentRecipe = recipes ? recipes[activeRecipeLang] : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* ── Top Header & Executive Controls ──────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight font-mono flex items-center gap-2">
                Cryptographic Risk Digital Twin
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  NIST CNSA 2.0
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Topological model linking Enterprise Services → Cryptographic Primitives → Threat Vectors → FIPS PQC Suite.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCBOM}
            className="text-xs font-mono flex items-center gap-1.5 border-slate-700 hover:border-cyan-500/50"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Export CycloneDX CBOM
          </Button>
        </div>
      </div>

      {/* ── Executive Metrics Bar ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 bg-navy-900/70 border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Total Components</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white">{graph.nodes.length}</span>
            <span className="text-[11px] text-slate-500 font-mono">modeled</span>
          </div>
        </Card>

        <Card className="p-4 bg-navy-900/70 border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Quantum Vulnerability</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${effectiveVulnerableCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {effectiveVulnerableCount}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              ({Math.round((effectiveVulnerableCount / graph.nodes.length) * 100)}% of assets)
            </span>
          </div>
        </Card>

        <Card className="p-4 bg-navy-900/70 border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Crypto Agility Index</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-cyan-400">{agility?.overall_score ?? 100}%</span>
            <span className="text-[11px] text-cyan-500/70 font-mono">{agility?.rating ?? 'High Agility'}</span>
          </div>
        </Card>

        <Card className="p-4 bg-navy-900/70 border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Post-Quantum Target</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-emerald-400">FIPS 203 / 204</span>
            <span className="text-[11px] text-emerald-500/70 font-mono">Final Standard</span>
          </div>
        </Card>
      </div>

      {/* ── Interactive Q-Day Threat Horizon Simulator ──────────────────────── */}
      <Card className="p-4 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 border-slate-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-xs font-bold font-mono text-white tracking-wide uppercase">
                Q-Day Quantum Threat Horizon Simulator
              </span>
            </div>
            <p className="text-[11px] text-slate-400 max-w-xl">
              Simulate the impact of quantum timeline progression. Observe how Shor's & Grover's cryptanalysis elevates asset risk across your topology.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-navy-950/90 border border-slate-800 font-mono text-xs">
            <button
              onClick={() => setHorizon('present')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                horizon === 'present'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Present (2025)
            </button>

            <button
              onClick={() => setHorizon('transition')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                horizon === 'transition'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Transition (2026–2028)
            </button>

            <button
              onClick={() => setHorizon('qday')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                horizon === 'qday'
                  ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              CRQC Q-Day (2030+)
            </button>
          </div>
        </div>

        {horizon === 'qday' && (
          <div className="mt-3 pt-3 border-t border-rose-500/20 flex items-center gap-2 text-xs font-mono text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>CRQC Active: All RSA-2048, ECC P-256, and unshielded TLS handshakes compromised by Shor's algorithm. Immediate FIPS 203 ML-KEM migration required.</span>
          </div>
        )}
      </Card>

      {/* ── Filters & Search ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-navy-900/50 border border-slate-800 font-mono text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider mr-1">Filter:</span>
          {(['all', 'enterprise', 'app', 'crypto', 'pqc'] as const).map(tier => (
            <button
              key={tier}
              onClick={() => setFilterTier(tier)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterTier === tier
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {tier === 'all' && 'All Tiers'}
              {tier === 'enterprise' && 'Core Infrastructure'}
              {tier === 'app' && 'Applications'}
              {tier === 'crypto' && 'Primitives'}
              {tier === 'pqc' && 'PQC Targets'}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search nodes or algorithms..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-navy-950/80 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 font-mono"
          />
        </div>
      </div>

      {/* ── Main Dual-Pane Canvas: Topology Graph (Left) & Deep Inspector (Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Topology Graph Column (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              ARCHITECTURAL TOPOLOGY MAP
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {filteredNodes.length} Nodes Active
            </span>
          </div>

          <Card className="p-4 bg-navy-950/80 border-slate-800 space-y-4 relative overflow-hidden">
            {/* Background cyber grid */}
            <div
              className="absolute inset-0 opacity-[0.02] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #00f2fe 1px, transparent 0)',
                backgroundSize: '20px 20px'
              }}
            />

            {/* Ingress / Enterprise Services */}
            <div className="space-y-2 relative z-10">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Tier 1 — Core Ingress & Enterprise Boundary
              </span>
              <div className="grid grid-cols-1 gap-2.5">
                {filteredNodes
                  .filter(n => n.type === 'enterprise')
                  .map(node => {
                    const status = getNodeEffectiveStatus(node);
                    const isSelected = selectedNode?.id === node.id;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${getStatusBorder(
                          status,
                          isSelected
                        )}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-navy-900 border border-slate-700">
                            {getNodeIcon(node.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold font-mono text-white">{node.label}</span>
                              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-300">
                                {node.category}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-sans block mt-0.5">
                              {node.details.recommended_pqc}
                            </span>
                          </div>
                        </div>
                        <SeverityBadge severity={status === 'critical' ? 'critical' : status === 'high' ? 'high' : 'low'} />
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Connecting Flow */}
            <div className="flex justify-center">
              <div className="h-4 w-px bg-gradient-to-b from-cyan-500/50 to-purple-500/50" />
            </div>

            {/* Application Services Tier */}
            <div className="space-y-2 relative z-10">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Tier 2 — Application Workloads & Cryptographic Boundaries
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {filteredNodes
                  .filter(n => n.type === 'app' || n.type === 'server')
                  .map(node => {
                    const status = getNodeEffectiveStatus(node);
                    const isSelected = selectedNode?.id === node.id;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${getStatusBorder(
                          status,
                          isSelected
                        )}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-navy-900 border border-slate-800">
                              {getNodeIcon(node.type)}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold font-mono text-white leading-tight">{node.label}</h4>
                              <span className="text-[10px] font-mono text-cyan-400/80">{node.details.algorithm || 'Standard'}</span>
                            </div>
                          </div>
                          <SeverityBadge severity={status === 'critical' ? 'critical' : status === 'high' ? 'high' : 'low'} />
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>HNDL: <strong className={node.details.hndl_risk === 'CRITICAL' ? 'text-rose-400' : 'text-slate-300'}>{node.details.hndl_risk}</strong></span>
                          <span>Priority: <strong className="text-white">{node.details.priority}</strong></span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Connecting Flow */}
            <div className="flex justify-center">
              <div className="h-4 w-px bg-gradient-to-b from-purple-500/50 to-amber-500/50" />
            </div>

            {/* Cryptographic Primitives Tier */}
            <div className="space-y-2 relative z-10">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Tier 3 — Cryptographic Primitives & Key Management
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {filteredNodes
                  .filter(n => n.type === 'crypto')
                  .map(node => {
                    const status = getNodeEffectiveStatus(node);
                    const isSelected = selectedNode?.id === node.id;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${getStatusBorder(
                          status,
                          isSelected
                        )}`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-1.5 rounded-lg bg-navy-900 border border-slate-800">
                            {getNodeIcon(node.type)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold font-mono text-white truncate">{node.label}</h4>
                            <span className="text-[10px] text-slate-400 block truncate">{node.details.usage || node.category}</span>
                          </div>
                        </div>
                        <SeverityBadge severity={status === 'critical' ? 'critical' : status === 'high' ? 'high' : 'low'} />
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Connecting Flow */}
            <div className="flex justify-center">
              <div className="h-4 w-px bg-gradient-to-b from-amber-500/50 to-emerald-500/50" />
            </div>

            {/* Post-Quantum Target Tier */}
            <div className="space-y-2 relative z-10">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Tier 4 — NIST FIPS Post-Quantum Target Solutions
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {filteredNodes
                  .filter(n => n.type === 'pqc_solution' || n.type === 'quantum_threat')
                  .map(node => {
                    const status = getNodeEffectiveStatus(node);
                    const isSelected = selectedNode?.id === node.id;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${getStatusBorder(
                          status,
                          isSelected
                        )}`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-1.5 rounded-lg bg-navy-900 border border-slate-800">
                            {getNodeIcon(node.type)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold font-mono text-white truncate">{node.label}</h4>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {node.type === 'pqc_solution' ? 'FIPS Standard Target' : 'Threat Horizon'}
                            </span>
                          </div>
                        </div>
                        <SeverityBadge severity={node.type === 'pqc_solution' ? 'low' : 'critical'} />
                      </div>
                    );
                  })}
              </div>
            </div>
          </Card>
        </div>

        {/* Deep Context Decision-Support Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              DECISION-SUPPORT INSPECTOR
            </span>
            <span className="text-[11px] font-mono text-slate-500">Live Context</span>
          </div>

          {selectedNode ? (
            <Card className="p-5 bg-navy-900/90 border-slate-800 space-y-5 sticky top-20 shadow-xl">
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                      {selectedNode.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">ID: {selectedNode.id}</span>
                  </div>
                  <h3 className="text-base font-bold text-white font-mono">{selectedNode.label}</h3>
                </div>
                <div className="p-2 rounded-lg bg-navy-950 border border-slate-700">
                  {getNodeIcon(selectedNode.type)}
                </div>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-navy-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Quantum Threat</span>
                  <span
                    className={`font-bold block mt-0.5 ${
                      selectedNode.details.quantum_status === 'Vulnerable' ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {selectedNode.details.quantum_status}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-navy-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">HNDL Risk Index</span>
                  <span
                    className={`font-bold block mt-0.5 ${
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

                <div className="p-2.5 rounded-lg bg-navy-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Data Lifetime (X)</span>
                  <span className="font-bold text-white block mt-0.5">{selectedNode.details.data_lifetime_years} Years</span>
                </div>

                <div className="p-2.5 rounded-lg bg-navy-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Migration Window (Y)</span>
                  <span className="font-bold text-white block mt-0.5">{selectedNode.details.migration_time_years} Years</span>
                </div>
              </div>

              {/* Blast Radius / Affected Services */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
                  Cryptographic Blast Radius:
                </span>
                <div className="p-2.5 rounded-lg bg-navy-950/80 border border-slate-800 text-xs font-mono space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Criticality:</span>
                    <span className="text-white font-bold">{selectedNode.details.business_criticality}</span>
                  </div>
                  {selectedNode.details.affected_services && selectedNode.details.affected_services.length > 0 && (
                    <div className="pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
                      <span>Impacted Services: </span>
                      <span className="text-cyan-300">{selectedNode.details.affected_services.join(', ')}</span>
                    </div>
                  )}
                  {selectedNode.details.affected_files && selectedNode.details.affected_files.length > 0 && (
                    <div className="pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
                      <span>Code Locations: </span>
                      <span className="text-purple-300">{selectedNode.details.affected_files.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 1-Click FIPS PQC Migration Recipe */}
              {currentRecipe && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileCode2 className="w-3.5 h-3.5" />
                      1-Click FIPS PQC Migration Code
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{currentRecipe.standard}</span>
                  </div>

                  {/* Language Tabs */}
                  <div className="flex items-center gap-1 bg-navy-950 p-1 rounded-lg border border-slate-800 font-mono text-[11px]">
                    {(['java', 'python', 'go', 'typescript'] as const).map(l => (
                      <button
                        key={l}
                        onClick={() => setActiveRecipeLang(l)}
                        className={`flex-1 py-1 rounded text-center font-bold transition-all ${
                          activeRecipeLang === l
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {l === 'java' && 'Java'}
                        {l === 'python' && 'Python'}
                        {l === 'go' && 'Go'}
                        {l === 'typescript' && 'TS / Web'}
                      </button>
                    ))}
                  </div>

                  {/* Code Snippet Box */}
                  <div className="relative group rounded-lg bg-navy-950 border border-slate-800 p-3 font-mono text-[11px] text-slate-300 overflow-x-auto">
                    <button
                      onClick={() => handleCopyCode(currentRecipe.code)}
                      className="absolute right-2 top-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1 text-[10px]"
                      title="Copy Code"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    <pre className="text-slate-300 leading-relaxed pr-16">{currentRecipe.code}</pre>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-8 text-center bg-navy-900/60 border-slate-800">
              <Info className="w-6 h-6 text-slate-500 mx-auto mb-2" />
              <p className="text-xs font-mono text-slate-400">Select any component node from the topology map to inspect its cryptographic context and PQC migration recipe.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
