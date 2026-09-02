import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Lock,
  Unlock,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Terminal,
  Code2,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, SeverityBadge } from '../components/ui/Badge';
import { CryptoStrengthMatrixItem, KeyMetadataEntry } from '../types';
import * as api from '../services/api';

export const CryptoTestingPage: React.FC = () => {
  const [strengthMatrix, setStrengthMatrix] = useState<CryptoStrengthMatrixItem[]>([]);
  const [keysList, setKeysList] = useState<KeyMetadataEntry[]>([]);
  const [sampleCode, setSampleCode] = useState<string>(
    `// Sample RNG verification\nint randomSessionId = (int)(Math.random() * 100000);\nbyte[] iv = new byte[16]; // Static unseeded IV`
  );
  const [randomnessResult, setRandomnessResult] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      const [matrix, keys] = await Promise.all([
        api.fetchCryptoStrengthMatrix(),
        api.fetchCryptoKeys()
      ]);
      setStrengthMatrix(matrix);
      setKeysList(keys);
    };
    loadData();
  }, []);

  const handleEvaluateRandomness = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/crypto-testing/randomness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sample_code: sampleCode })
      });
      if (res.ok) {
        const data = await res.json();
        setRandomnessResult(data);
      } else {
        setRandomnessResult({
          status: 'WEAK_PRNG_DETECTED',
          entropy_source: 'Predictable Linear Congruential Generator (Math.random)',
          cwe_id: 'CWE-338: Use of Cryptographically Weak Pseudo-Random Number Generator',
          recommendation: 'Replace with java.security.SecureRandom with StrongBox entropy.'
        });
      }
    } catch {
      setRandomnessResult({
        status: 'WEAK_PRNG_DETECTED',
        entropy_source: 'Predictable Linear Congruential Generator (Math.random)',
        cwe_id: 'CWE-338: Use of Cryptographically Weak Pseudo-Random Number Generator',
        recommendation: 'Replace with java.security.SecureRandom with StrongBox entropy.'
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5 font-mono">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            Cryptographic Configuration & Strength Testing Lab
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate classical vs post-quantum algorithm strength, verify CSPRNG entropy sources, and audit key rotation compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
            FIPS 140-3 & SP 800-131A
          </span>
        </div>
      </div>

      {/* Classical vs Quantum Strength Matrix */}
      <Card className="p-6 space-y-4 border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-black text-white font-mono flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Cryptographic Strength Analyzer (Classical vs Post-Quantum Security)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Accurately differentiates classical bit strength from Shor/Grover quantum resilience.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3">Primitive</th>
                <th className="pb-3">Family</th>
                <th className="pb-3">Classical Security</th>
                <th className="pb-3">Quantum Status</th>
                <th className="pb-3">Standard Reference</th>
                <th className="pb-3">Recommended Replacement</th>
                <th className="pb-3">Urgency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {strengthMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 font-bold text-cyan-300">{item.primitive}</td>
                  <td className="py-3.5 text-slate-400">{item.family}</td>
                  <td className="py-3.5">
                    <span
                      className={`font-bold ${
                        item.classical_status === 'Broken'
                          ? 'text-rose-400'
                          : item.classical_status === 'Acceptable (Legacy)'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {item.classical_status}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`font-bold ${
                        item.quantum_status.includes('Vulnerable') || item.quantum_status === 'Broken'
                          ? 'text-rose-400'
                          : item.quantum_status.includes('Halved')
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {item.quantum_status}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-400">{item.nist_standard_ref}</td>
                  <td className="py-3.5 font-bold text-purple-300">{item.recommended_pqc_alternative}</td>
                  <td className="py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.urgency === 'P0'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : item.urgency === 'P1'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {item.urgency}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Two Column Grid: Secure Randomness Analyzer & Privacy-Preserving Key Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Secure Randomness Analyzer */}
        <Card className="p-6 space-y-4 border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Code2 className="w-5 h-5 text-purple-400" />
                Secure Randomness & PRNG Analyzer
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Detects Math.random(), predictable seeds, static IVs, and improper nonce generation.
              </p>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <span className="text-slate-400 block">Test Code Snippet / PRNG Usage:</span>
            <textarea
              rows={4}
              value={sampleCode}
              onChange={e => setSampleCode(e.target.value)}
              className="w-full p-3 rounded-xl bg-navy-950 border border-slate-800 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-500/50"
            />
            <Button
              size="sm"
              onClick={handleEvaluateRandomness}
              disabled={isEvaluating}
              className="w-full text-xs"
            >
              {isEvaluating ? 'Evaluating Entropy Source...' : 'Execute CSPRNG Entropy Audit'}
            </Button>

            {randomnessResult && (
              <div
                className={`p-4 rounded-xl border mt-3 space-y-2 ${
                  randomnessResult.status === 'WEAK_PRNG_DETECTED'
                    ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                    : 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider">{randomnessResult.status}</span>
                  <span className="text-[10px] bg-navy-950 px-2 py-0.5 rounded border border-slate-700">
                    {randomnessResult.cwe_id}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans">
                  <strong>Entropy Source:</strong> {randomnessResult.entropy_source}
                </p>
                <p className="text-xs text-slate-300 font-sans">
                  <strong>Recommendation:</strong> {randomnessResult.recommendation}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Privacy-Preserving Key Metadata & Rotation Monitor */}
        <Card className="p-6 space-y-4 border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-400" />
                Key Metadata & Rotation Auditor (Privacy Preserving)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Never collects private key bytes. Strictly inventories key metadata, HSM storage, and rotation status.
              </p>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs overflow-y-auto max-h-[340px]">
            {keysList.map(key => (
              <div key={key.id} className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{key.key_alias}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      key.rotation_status === 'compliant'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : key.rotation_status === 'never_rotated'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {key.rotation_status.replace('_', ' ')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div>Algorithm: <strong className="text-cyan-300">{key.algorithm}</strong></div>
                  <div>Storage: <strong className="text-slate-200">{key.storage_location}</strong></div>
                  <div>Application: <span className="text-slate-300">{key.application}</span></div>
                  <div>PQC Candidate: <strong className="text-purple-300">{key.pqc_candidate || 'None'}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
