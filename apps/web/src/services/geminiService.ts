import { CryptoFinding } from '../types';

export interface AISettings {
  apiKey: string;
  privacyMode: 'full_evidence' | 'metadata_only' | 'local_only';
  model: string;
}

const SETTINGS_KEY = 'ecdat_gemini_settings';

export function getAISettings(): AISettings {
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }
  return {
    apiKey: '',
    privacyMode: 'full_evidence',
    model: 'gemini-2.5-flash'
  };
}

export function saveAISettings(settings: AISettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function sanitizeEvidence(snippet: string): string {
  if (!snippet) return '';
  // Redact potential private keys, passwords, API tokens
  return snippet
    .replace(/-----BEGIN[ A-Z0-9_-]+PRIVATE KEY-----[\s\S]*?-----END[ A-Z0-9_-]+PRIVATE KEY-----/gi, '[REDACTED_PRIVATE_KEY_BLOCK]')
    .replace(/("password"|'password'|password)\s*[:=]\s*["'][^"']+["']/gi, '$1: "[REDACTED_PASSWORD]"')
    .replace(/("secret"|'secret'|secret)\s*[:=]\s*["'][^"']+["']/gi, '$1: "[REDACTED_SECRET]"')
    .replace(/("apiKey"|'apiKey'|apiKey)\s*[:=]\s*["'][^"']+["']/gi, '$1: "[REDACTED_API_KEY]"')
    .replace(/0x[a-fA-F0-9]{32,}/g, '[REDACTED_HEX_KEY]');
}

export async function explainFindingWithGemini(
  finding: CryptoFinding,
  assetName: string
): Promise<{
  explanation: string;
  remediationCode: string;
  complianceImpact: string;
  pqcThreatAnalysis: string;
  references: string[];
  is_live_ai: boolean;
}> {
  const settings = getAISettings();

  // If local only or no API key, return verified deterministic response
  if (settings.privacyMode === 'local_only' || !settings.apiKey || settings.apiKey.trim().length < 10) {
    return generateDeterministicExplanation(finding);
  }

  const sanitizedSnippet = settings.privacyMode === 'full_evidence'
    ? sanitizeEvidence(finding.code_snippet_redacted)
    : '[METADATA_ONLY_MODE_ENABLED]';

  const prompt = `You are a Senior Cryptographic Security Auditor and Post-Quantum Cryptography Engineer analyzing verified findings for ${assetName}.
Provide a strict, grounded technical assessment for this finding. Do NOT hallucinate or assume components not mentioned in the evidence.

FINDING DETAILS:
- Rule ID: ${finding.rule_id}
- Finding Title: ${finding.title}
- Algorithm: ${finding.algorithm}
- Mode: ${finding.mode || 'N/A'}
- Key Size: ${finding.key_size || finding.key_size_str || 'N/A'}
- Severity: ${finding.severity}
- Quantum Vulnerable (Shor/Grover): ${finding.quantum_vulnerable ? 'YES (Vulnerable to Shor\'s Factoring/DLog or Grover)' : 'NO (Quantum Resistant)'}
- PQC Priority: ${finding.pqc_priority}
- Location: ${finding.file_path}:${finding.line_number}
- Code Snippet:
${sanitizedSnippet}

Respond with valid JSON matching this exact structure:
{
  "explanation": "Detailed explanation of why this algorithm or configuration is risky, citing NIST SP 800-131A or FIPS standards.",
  "remediationCode": "Concrete, secure drop-in code snippet for modern production use.",
  "complianceImpact": "Specific compliance impact under FIPS 140-3, PCI-DSS v4.0, or CNSA 2.0.",
  "pqcThreatAnalysis": "Quantum threat analysis specifying whether Shor or Grover applies, and exact NIST PQC replacement (e.g. ML-KEM-768 / FIPS 203 or ML-DSA-65 / FIPS 204).",
  "references": ["NIST SP 800-131A Rev 2", "FIPS 203"]
}`;

  try {
    const model = settings.model || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(settings.apiKey)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText) {
      const parsed = JSON.parse(candidateText);
      return {
        ...parsed,
        is_live_ai: true
      };
    }
  } catch (err) {
    console.warn('Live Gemini API call error, falling back to deterministic explanation:', err);
  }

  return generateDeterministicExplanation(finding);
}

export async function askGeminiCopilot(
  query: string,
  findings: CryptoFinding[]
): Promise<{
  answer: string;
  references: string[];
  suggestedAction?: string;
  is_live_ai: boolean;
}> {
  const settings = getAISettings();

  if (settings.privacyMode === 'local_only' || !settings.apiKey || settings.apiKey.trim().length < 10) {
    return generateDeterministicCopilotAnswer(query, findings);
  }

  const findingsSummary = findings.slice(0, 15).map(f => ({
    title: f.title,
    algorithm: f.algorithm,
    severity: f.severity,
    file: f.file_path,
    quantum_vulnerable: f.quantum_vulnerable
  }));

  const prompt = `You are ECDAT's Senior Cryptographic Copilot.
Answer the user's question accurately based strictly on the provided verified findings context and NIST SP 800-131A / FIPS 203-205 standards.

USER QUESTION: "${query}"

CURRENT VERIFIED FINDINGS IN CONTEXT (${findings.length} Total):
${JSON.stringify(findingsSummary, null, 2)}

Provide a concise, highly technical answer formatted with clear markdown bullets.
JSON response structure:
{
  "answer": "Your detailed answer",
  "references": ["NIST SP 800-131A", "FIPS 203"],
  "suggestedAction": "Specific action the developer or auditor should take"
}`;

  try {
    const model = settings.model || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(settings.apiKey)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidateText) {
        const parsed = JSON.parse(candidateText);
        return {
          ...parsed,
          is_live_ai: true
        };
      }
    }
  } catch (err) {
    console.warn('Gemini Copilot API error, falling back:', err);
  }

  return generateDeterministicCopilotAnswer(query, findings);
}

function generateDeterministicExplanation(finding: CryptoFinding): {
  explanation: string;
  remediationCode: string;
  complianceImpact: string;
  pqcThreatAnalysis: string;
  references: string[];
  is_live_ai: boolean;
} {
  let explanation = `${finding.title}: ${finding.description}`;
  let remediationCode = finding.remediation_deterministic;
  let complianceImpact = 'Violates NIST SP 800-131A transition guidelines and FIPS 140-3 cryptographic baseline.';
  let pqcThreatAnalysis = finding.quantum_vulnerable
    ? 'Quantum Vulnerable: Asymmetric primitive subject to polynomial-time factorization / discrete logarithm solving via Shor\'s algorithm on a Cryptographically Relevant Quantum Computer (CRQC).'
    : 'Quantum Resistant: Symmetric/hash primitive with sufficient classical bit strength (≥ 256 bits) to withstand Grover search halving.';

  if (finding.algorithm.includes('MD5') || finding.algorithm.includes('SHA-1')) {
    remediationCode = `// Replace with SHA-256 (FIPS 180-4)\nMessageDigest md = MessageDigest.getInstance("SHA-256");\nbyte[] digest = md.digest(inputBytes);`;
    complianceImpact = 'Prohibited by PCI-DSS v4.0 Requirement 8.3 and NIST SP 800-131A Rev 2.';
  } else if (finding.algorithm.includes('ECB')) {
    remediationCode = `// Replace with AES-GCM Authenticated Encryption\nCipher cipher = Cipher.getInstance("AES/GCM/NoPadding");\nGCMParameterSpec spec = new GCMParameterSpec(128, iv);\ncipher.init(Cipher.ENCRYPT_MODE, secretKey, spec);`;
  } else if (finding.algorithm.includes('RSA')) {
    pqcThreatAnalysis = 'High Threat: Shor\'s algorithm will factor RSA moduli up to 4096-bit in seconds on a CRQC. Replacement target: ML-KEM-768 (FIPS 203) for key encapsulation or ML-DSA-65 (FIPS 204) for digital signatures.';
  }

  return {
    explanation,
    remediationCode,
    complianceImpact,
    pqcThreatAnalysis,
    references: ['NIST SP 800-131A Rev 2', 'NIST FIPS 203 (ML-KEM)', 'NIST FIPS 204 (ML-DSA)', 'CWE-327'],
    is_live_ai: false
  };
}

function generateDeterministicCopilotAnswer(
  query: string,
  findings: CryptoFinding[]
): {
  answer: string;
  references: string[];
  suggestedAction?: string;
  is_live_ai: boolean;
} {
  const q = query.toLowerCase();
  const crit = findings.filter(f => f.severity === 'critical');
  const qv = findings.filter(f => f.quantum_vulnerable);

  if (q.includes('critical') || q.includes('urgent') || q.includes('worst')) {
    return {
      answer: `Based on verified scan analysis, there are **${crit.length} Critical Severity findings** in your codebase:\n\n` +
        crit.map((f, i) => `${i + 1}. **${f.title}** in \`${f.file_path}:${f.line_number}\` (${f.algorithm})`).join('\n') +
        `\n\nThese findings must be prioritized immediately before production release.`,
      references: ['NIST SP 800-131A Rev 2', 'PCI-DSS v4.0'],
      suggestedAction: 'Review critical findings on the Findings Explorer page.',
      is_live_ai: false
    };
  }

  if (q.includes('pqc') || q.includes('quantum') || q.includes('shor')) {
    return {
      answer: `Discovered **${qv.length} quantum-vulnerable cryptographic components** across the audited target:\n\n` +
        `• **Asymmetric Primitives:** RSA, ECC, and ECDSA implementations are vulnerable to **Shor's Algorithm** (complete compromise of key exchange and signatures upon CRQC arrival).\n` +
        `• **NIST Standard Replacements:**\n` +
        `  - Key Encapsulation: **ML-KEM-768** (NIST FIPS 203)\n` +
        `  - Digital Signatures: **ML-DSA-65** (NIST FIPS 204) and **SLH-DSA** (NIST FIPS 205)\n` +
        `  - Symmetric Data at Rest: **AES-256-GCM** (retains 128-bit quantum security against Grover's algorithm).`,
      references: ['NIST FIPS 203 (ML-KEM)', 'NIST FIPS 204 (ML-DSA)', 'CNSA 2.0 Roadmap'],
      suggestedAction: 'Open the PQC Migration Suite to evaluate performance benchmarks and transition costs.',
      is_live_ai: false
    };
  }

  return {
    answer: `Analyzed ${findings.length} cryptographic components in your enterprise codebase. ` +
      `The discovery engine evaluated all primitives against NIST SP 800-131A, FIPS 140-3, and NIST Post-Quantum Cryptography standards (FIPS 203/204/205).`,
    references: ['NIST SP 800-131A Rev 2', 'FIPS 140-3', 'FIPS 203'],
    suggestedAction: 'Filter by algorithm or category in the Crypto-BOM viewer.',
    is_live_ai: false
  };
}
