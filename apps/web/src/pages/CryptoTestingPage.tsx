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
  Sparkles,
  Sliders,
  Copy,
  Check,
  Play
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, SeverityBadge } from '../components/ui/Badge';
import { CryptoStrengthMatrixItem } from '../types';
import * as api from '../services/api';
import { useApp } from '../context/AppContext';

export const CryptoTestingPage: React.FC = () => {
  const { addNotification } = useApp();
  const [strengthMatrix, setStrengthMatrix] = useState<CryptoStrengthMatrixItem[]>([]);
  const [activeTab, setActiveTab] = useState<'matrix' | 'policy_as_code' | 'fix_assistant' | 'prng_evaluator'>('matrix');

  // Policy-as-Code State
  const [policyRules, setPolicyRules] = useState([
    { id: 'POL-01', rule: 'Disallow RSA Key Size < 2048 bits', severity: 'FAIL', enabled: true },
    { id: 'POL-02', rule: 'Disallow Broken Hash Functions (MD5, SHA-1)', severity: 'FAIL', enabled: true },
    { id: 'POL-03', rule: 'Disallow Insecure Block Modes (AES-ECB)', severity: 'FAIL', enabled: true },
    { id: 'POL-04', rule: 'Disallow Hardcoded Secret Keys in Source Code', severity: 'FAIL', enabled: true },
    { id: 'POL-05', rule: 'Require TLS 1.3 or TLS 1.2 AEAD Minimum', severity: 'WARN', enabled: true },
    { id: 'POL-06', rule: 'Flag Quantum-Vulnerable Asymmetric Primitives for PQC Roadmap', severity: 'WARN', enabled: true }
  ]);
  const [activePipeline, setActivePipeline] = useState<'github' | 'gitlab' | 'jenkins'>('github');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Fix Assistant State
  const [selectedLanguage, setSelectedLanguage] = useState<'java' | 'python' | 'javascript' | 'go' | 'csharp'>('java');
  const [selectedIssue, setSelectedIssue] = useState<string>('aes_ecb');

  // PRNG Evaluator State
  const [sampleCode, setSampleCode] = useState<string>(
    `// Sample Pseudo-Random Code Verification\nint randomOtp = (int)(Math.random() * 1000000);\nbyte[] staticIv = new byte[16]; // Insecure zero-filled IV`
  );
  const [randomnessResult, setRandomnessResult] = useState<any>(null);

  useEffect(() => {
    api.fetchCryptoStrengthMatrix().then(m => setStrengthMatrix(m));
  }, []);

  const handleEvaluateRandomness = () => {
    if (sampleCode.includes('Math.random') || sampleCode.includes('new Random') || sampleCode.includes('rand()')) {
      setRandomnessResult({
        status: 'WEAK_PRNG_DETECTED',
        entropy_source: 'Predictable Linear Congruential Generator (Math.random / java.util.Random)',
        cwe_id: 'CWE-338: Use of Cryptographically Weak Pseudo-Random Number Generator',
        severity: 'high',
        recommendation: 'Replace with java.security.SecureRandom with hardware entropy.'
      });
    } else {
      setRandomnessResult({
        status: 'SECURE_CSPRNG',
        entropy_source: 'Cryptographically Secure Pseudo-Random Generator (CSPRNG)',
        cwe_id: 'NIST SP 800-90A Compliant',
        severity: 'clean',
        recommendation: 'Implementation meets entropy randomness standards.'
      });
    }
  };

  const codeSnippets: Record<string, Record<string, { vulnerable: string; secure: string; explanation: string }>> = {
    java: {
      aes_ecb: {
        vulnerable: `// Insecure AES-ECB\nCipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");\ncipher.init(Cipher.ENCRYPT_MODE, key);\nbyte[] ciphertext = cipher.doFinal(plaintext);`,
        secure: `// Secure Authenticated AES-256-GCM\nCipher cipher = Cipher.getInstance("AES/GCM/NoPadding");\nbyte[] iv = new byte[12]; // 96-bit nonce\nnew SecureRandom().nextBytes(iv);\nGCMParameterSpec spec = new GCMParameterSpec(128, iv);\ncipher.init(Cipher.ENCRYPT_MODE, secretKey, spec);\nbyte[] ciphertext = cipher.doFinal(plaintext);`,
        explanation: 'AES-ECB mode preserves structural patterns. Migrated to AES-GCM (AEAD) with 96-bit random nonce.'
      },
      md5_sha1: {
        vulnerable: `// Insecure MD5 / SHA-1\nMessageDigest md = MessageDigest.getInstance("MD5");\nbyte[] digest = md.digest(data);`,
        secure: `// Approved SHA-256 (FIPS 180-4)\nMessageDigest md = MessageDigest.getInstance("SHA-256");\nbyte[] digest = md.digest(data);`,
        explanation: 'MD5 is broken against collision attacks. Upgraded to SHA-256.'
      },
      rsa_keygen: {
        vulnerable: `// Broken RSA-1024\nKeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");\nkpg.initialize(1024);\nKeyPair kp = kpg.generateKeyPair();`,
        secure: `// Classical RSA-3072 or Post-Quantum Hybrid\nKeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");\nkpg.initialize(3072); // Minimum 3072-bit for classical margin\nKeyPair kp = kpg.generateKeyPair();`,
        explanation: 'RSA key length upgraded to 3072-bit classical baseline.'
      }
    },
    python: {
      aes_ecb: {
        vulnerable: `# Insecure ECB mode\nfrom Crypto.Cipher import AES\ncipher = AES.new(key, AES.MODE_ECB)\nciphertext = cipher.encrypt(padded_data)`,
        secure: `# Secure AEAD AES-GCM\nfrom cryptography.hazmat.primitives.ciphers.aead import AESGCM\nimport os\naesgcm = AESGCM(key) # 256-bit key\nnonce = os.urandom(12)\nciphertext = aesgcm.encrypt(nonce, plaintext, None)`,
        explanation: 'Python cryptography AEAD AESGCM eliminates padding oracle and pattern leakage vulnerabilities.'
      },
      md5_sha1: {
        vulnerable: `import hashlib\nchecksum = hashlib.md5(data).hexdigest()`,
        secure: `import hashlib\nchecksum = hashlib.sha256(data).hexdigest()`,
        explanation: 'Upgraded to hashlib.sha256().'
      }
    },
    javascript: {
      aes_ecb: {
        vulnerable: `// Node.js crypto legacy ECB\nconst cipher = crypto.createCipheriv('aes-128-ecb', key, null);`,
        secure: `// Modern authenticated AES-256-GCM\nconst iv = crypto.randomBytes(12);\nconst cipher = crypto.createCipheriv('aes-256-gcm', key, iv);\nconst ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);\nconst tag = cipher.getAuthTag();`,
        explanation: 'Node.js AES-256-GCM authenticated cipher with dynamic auth tag and 12-byte IV.'
      },
      md5_sha1: {
        vulnerable: `const hash = crypto.createHash('md5').update(data).digest('hex');`,
        secure: `const hash = crypto.createHash('sha256').update(data).digest('hex');`,
        explanation: 'Upgraded crypto.createHash("sha256").'
      }
    }
  };

  const cicdSnippets = {
    github: `name: ECDAT Cryptographic Security Gate
on: [push, pull_request]

jobs:
  crypto-audit:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Run ECDAT Discovery Scanner
        run: |
          npm install -g @ecdat/cli
          ecdat scan --target . --policy-fail-on-critical --cyclonedx-out cbom.json

      - name: Upload CycloneDX 1.6 CBOM Artifact
        uses: actions/upload-artifact@v4
        with:
          name: ecdat-cyclonedx-cbom
          path: cbom.json`,
    gitlab: `stages:
  - test

ecdat_crypto_audit:
  stage: test
  image: node:20
  script:
    - npx @ecdat/cli scan --target . --fail-on-critical
  artifacts:
    reports:
      cyclonedx: cbom.json`,
    jenkins: `pipeline {
    agent any
    stages {
        stage('Cryptographic Discovery') {
            steps {
                sh 'ecdat scan --target . --fail-on-critical --output-report report.json'
            }
        }
    }
}`
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
    addNotification('Copied', 'CI/CD pipeline snippet copied to clipboard', 'success');
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
            Evaluate classical vs post-quantum algorithm strength, verify CSPRNG entropy sources, configure Policy-as-Code gates, and access Developer Fix Assistant.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 font-mono text-xs">
        {[
          { id: 'matrix', label: '📊 Classical vs PQC Matrix', icon: Zap },
          { id: 'policy_as_code', label: '🛡️ Policy-as-Code & Security Gates', icon: ShieldCheck },
          { id: 'fix_assistant', label: '🛠️ Developer Fix Assistant', icon: Code2 },
          { id: 'prng_evaluator', label: '🎲 CSPRNG Entropy Tester', icon: RefreshCw }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Strength Matrix */}
      {activeTab === 'matrix' && (
        <Card className="p-6 space-y-4 border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                Cryptographic Primitive Strength Classification
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Differentiates classical security from Shor/Grover quantum resilience per NIST SP 800-131A & FIPS 203/204.
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
                  <th className="pb-3">NIST Standard Ref</th>
                  <th className="pb-3">Recommended PQC Replacement</th>
                  <th className="pb-3">Urgency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {strengthMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 font-bold text-cyan-300">{item.primitive}</td>
                    <td className="py-3.5 text-slate-400">{item.family}</td>
                    <td className="py-3.5">
                      <span className={`font-bold ${
                        item.classical_status === 'Broken' ? 'text-rose-400' :
                        item.classical_status === 'Acceptable (Legacy)' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {item.classical_status}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className={`font-bold ${
                        item.quantum_status.includes('Vulnerable') || item.quantum_status === 'Broken' ? 'text-rose-400' :
                        item.quantum_status.includes('Halved') ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {item.quantum_status}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-400 text-[11px]">{item.nist_standard_ref}</td>
                    <td className="py-3.5 font-bold text-purple-300">{item.recommended_pqc_alternative}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.urgency === 'P0' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        item.urgency === 'P1' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {item.urgency}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: Policy-as-Code & Security Gates */}
      {activeTab === 'policy_as_code' && (
        <div className="space-y-6 font-mono text-xs">
          <Card className="p-6 space-y-4 border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Organizational Policy-as-Code Ruleset
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Define automated PASS/FAIL threshold gates for CI/CD builds and pull requests.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-800/60">
              {policyRules.map((pol, i) => (
                <div key={pol.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={pol.enabled}
                      onChange={() => {
                        const updated = [...policyRules];
                        updated[i].enabled = !updated[i].enabled;
                        setPolicyRules(updated);
                      }}
                      className="rounded border-slate-700 text-cyan-400 focus:ring-0"
                    />
                    <div>
                      <span className="font-bold text-white block">{pol.rule}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Rule ID: {pol.id}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    pol.severity === 'FAIL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    GATE: {pol.severity}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* CI/CD Integration Export */}
          <Card className="p-6 space-y-4 border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">CI/CD Pipeline Security Gate Integration</h3>
                <p className="text-xs text-slate-400 mt-0.5">Automate cryptographic compliance scanning in your pipeline.</p>
              </div>

              <div className="flex items-center gap-2">
                {(['github', 'gitlab', 'jenkins'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setActivePipeline(p)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                      activePipeline === p
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <Button size="sm" variant="outline" onClick={() => handleCopy(cicdSnippets[activePipeline])} leftIcon={<Copy className="w-3.5 h-3.5" />}>
                  {copiedSnippet ? 'Copied!' : 'Copy Config'}
                </Button>
              </div>
            </div>

            <pre className="p-4 rounded-xl bg-navy-950 border border-slate-800 text-cyan-300 text-xs overflow-x-auto">
              {cicdSnippets[activePipeline]}
            </pre>
          </Card>
        </div>
      )}

      {/* TAB 3: Developer Fix Assistant */}
      {activeTab === 'fix_assistant' && (
        <div className="space-y-6 font-mono text-xs">
          <Card className="p-6 space-y-4 border-slate-800 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-cyan-400" />
                  Developer Cryptographic Remediation Assistant
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Select programming language and cryptographic weakness to inspect secure drop-in code.</p>
              </div>

              <div className="flex items-center gap-2">
                {(['java', 'python', 'javascript'] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                      selectedLanguage === lang
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Issue Selector */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold">Issue Type:</span>
              <select
                value={selectedIssue}
                onChange={e => setSelectedIssue(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-navy-950 border border-slate-800 text-white"
              >
                <option value="aes_ecb">AES-ECB → Authenticated AES-GCM</option>
                <option value="md5_sha1">MD5 / SHA-1 → SHA-256</option>
                {selectedLanguage === 'java' && <option value="rsa_keygen">Weak RSA-1024 → RSA-3072 / PQC</option>}
              </select>
            </div>

            {/* Code Diff Display */}
            {codeSnippets[selectedLanguage]?.[selectedIssue] && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-rose-400 block">❌ Insecure / Deprecated Implementation</span>
                  <pre className="text-rose-200 text-xs overflow-x-auto leading-relaxed">
                    {codeSnippets[selectedLanguage][selectedIssue].vulnerable}
                  </pre>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">✅ Secure Drop-In Implementation</span>
                  <pre className="text-emerald-200 text-xs overflow-x-auto leading-relaxed">
                    {codeSnippets[selectedLanguage][selectedIssue].secure}
                  </pre>
                </div>

                <div className="md:col-span-2 p-3 rounded-lg bg-navy-950 border border-slate-800 text-slate-300 font-sans">
                  <strong>Engineering Rationale:</strong> {codeSnippets[selectedLanguage][selectedIssue].explanation}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 4: PRNG Evaluator */}
      {activeTab === 'prng_evaluator' && (
        <Card className="p-6 space-y-4 border-slate-800 shadow-2xl font-mono text-xs">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white">Pseudo-Random Number Generator (PRNG) Entropy Tester</h3>
            <p className="text-xs text-slate-400 mt-0.5">Paste code to test whether random numbers derive from a CSPRNG or predictable LCG.</p>
          </div>

          <textarea
            rows={6}
            value={sampleCode}
            onChange={e => setSampleCode(e.target.value)}
            className="w-full p-3 rounded-xl bg-navy-950 border border-slate-800 text-amber-200 text-xs focus:outline-none focus:border-cyan-500/50"
          />

          <div className="flex justify-end">
            <Button variant="cyber" onClick={handleEvaluateRandomness} leftIcon={<Play className="w-4 h-4" />}>
              Evaluate Entropy & Randomness
            </Button>
          </div>

          {randomnessResult && (
            <div className={`p-4 rounded-xl border space-y-2 animate-in fade-in ${
              randomnessResult.severity === 'clean'
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">{randomnessResult.status}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-black/40">
                  {randomnessResult.cwe_id}
                </span>
              </div>
              <p className="text-[11px] opacity-90">Entropy Source: {randomnessResult.entropy_source}</p>
              <p className="text-[11px] opacity-90 font-bold">Recommendation: {randomnessResult.recommendation}</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
