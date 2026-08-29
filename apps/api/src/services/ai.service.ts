import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

let genAI: GoogleGenerativeAI | null = null;
if (GEMINI_API_KEY && !GEMINI_API_KEY.startsWith('your-')) {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    console.log(`[AI Analyst] Gemini ${GEMINI_MODEL} initialized successfully`);
  } catch (e) {
    console.warn('[AI Analyst] Failed to initialize Gemini:', e);
    genAI = null;
  }
} else {
  console.log('[AI Analyst] No valid GEMINI_API_KEY — deterministic expert fallback active');
}

// ─── Finding Analysis (called from /api/ai/analyze) ──────────────────────────
export async function generateFindingAnalysis(finding: any, assetName?: string): Promise<any> {
  const deterministicFallback = buildDeterministicFindingAnalysis(finding, assetName);

  if (!genAI) return deterministicFallback;

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const prompt = `You are a senior cryptographic security specialist and NIST standards expert.

Analyze this VERIFIED cryptographic finding discovered by static AST analysis:
- Asset: ${assetName || 'Enterprise Application'}
- Algorithm: ${finding.algorithm}
- Category: ${finding.category}
- Severity: ${finding.severity}
- File: ${finding.file_path}:${finding.line_number}
- Code Evidence: ${finding.code_snippet_redacted || 'N/A'}
- Deterministic Description: ${finding.description}
- Quantum Vulnerable: ${finding.quantum_vulnerable ? 'YES' : 'NO'}

Provide a structured analysis with these EXACTLY labeled sections:
1. EXECUTIVE_SUMMARY: One paragraph non-technical executive summary (2-3 sentences)
2. TECHNICAL_EXPLANATION: Detailed technical explanation of why this cryptographic primitive is weak or strong
3. BUSINESS_IMPACT: Business and compliance impact (FIPS 140-3, SOC 2, RBI, SEBI, DPDP Act)
4. PQC_MIGRATION_PATH: Post-quantum migration strategy referencing NIST FIPS 203/204/205

IMPORTANT: Base your analysis ONLY on the verified findings above. Do not invent CVE numbers or key lengths not provided.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const extract = (section: string) => {
      const match = text.match(new RegExp(`${section}:([\\s\\S]*?)(?=\\d+\\.|$)`, 'i'));
      return match ? match[1].trim() : deterministicFallback[section.toLowerCase().replace('_', '_')];
    };

    return {
      executive_summary: extract('EXECUTIVE_SUMMARY'),
      technical_explanation: extract('TECHNICAL_EXPLANATION'),
      business_impact: extract('BUSINESS_IMPACT'),
      pqc_migration_path: extract('PQC_MIGRATION_PATH'),
      is_live_ai: true
    };
  } catch (e: any) {
    console.warn('[AI Analyst] Gemini error, using fallback:', e.message);
    return deterministicFallback;
  }
}

// ─── Conversational Assistant (called from /api/ai/ask) ─────────────────────
export async function askAIAssistant(question: string, assetId?: string, liveFindings: any[] = []): Promise<any> {
  const deterministicAnswer = buildDeterministicAnswer(question, liveFindings);

  if (!genAI) return deterministicAnswer;

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const findingsContext = liveFindings.length > 0
      ? liveFindings.map((f: any) => `- ${f.algorithm} (${f.severity}): ${f.title} in ${f.file_path}`).join('\n')
      : 'No findings in database yet — run a scan first.';

    const prompt = `You are CryptoTool's AI Security Analyst, specializing in cryptographic security and NIST post-quantum standards.

VERIFIED FINDINGS FROM DATABASE (live data — do not invent other findings):
${findingsContext}

USER QUESTION: "${question}"

Answer the question grounded STRICTLY in the verified findings above. If findings are empty, advise the user to run a scan first.
Reference NIST standards where appropriate (FIPS 140-3, SP 800-131A, FIPS 203 ML-KEM, FIPS 204 ML-DSA).
Be concise, technical, and actionable. Do not fabricate CVEs, key sizes, or findings not listed above.`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return {
      answer,
      references: buildReferences(liveFindings),
      is_live_ai: true
    };
  } catch (e: any) {
    console.warn('[AI Analyst] Gemini error:', e.message);
    return deterministicAnswer;
  }
}

// ─── Deterministic Fallback Functions ────────────────────────────────────────
function buildDeterministicFindingAnalysis(finding: any, assetName?: string) {
  const isWeak = ['critical', 'high'].includes(finding.severity);

  const executiveSummaryMap: Record<string, string> = {
    'critical': `A critical cryptographic vulnerability (${finding.algorithm}) was identified in "${assetName || 'the target system'}". This finding indicates use of a cryptographic primitive that fails to meet minimum security baselines defined in NIST SP 800-131A and poses immediate risk of data compromise.`,
    'high': `A high-severity cryptographic weakness (${finding.algorithm}) was detected in "${assetName || 'the target system'}". The identified primitive is deprecated and must be replaced as part of a structured cryptographic modernization program.`,
    'medium': `A medium-severity cryptographic observation (${finding.algorithm}) was noted in "${assetName || 'the target system'}". While not immediately critical, migration to stronger alternatives is recommended during the next development cycle.`,
    'low': `A low-severity cryptographic observation (${finding.algorithm}) was noted. The detected primitive meets minimum baseline requirements but should be upgraded to align with current NIST recommendations for long-term security.`,
    'informational': `The detected usage of ${finding.algorithm} in "${assetName || 'the target system'}" meets current cryptographic standards. No immediate remediation is required.`
  };

  const technicalExplanationMap: Record<string, string> = {
    'RSA': 'RSA relies on the computational hardness of integer factorization. Keys below 2048-bit no longer provide adequate security (NIST SP 800-131A requires ≥ 2048-bit through 2030). RSA-1024 provides only ~80-bit security, making it susceptible to factorization attacks with modern hardware. RSA-2048 provides ~112 bits and must be deprecated after 2030 per NIST guidance.',
    'MD5': 'MD5 is a broken hash function with known collision attacks demonstrated since 2004 (Wang & Yu). MD5 should never be used for security-critical operations including digital signatures, certificate hashing, or password storage. NIST formally deprecated MD5 for all security applications.',
    'SHA-1': 'SHA-1 produces 160-bit digests but is vulnerable to collision attacks (demonstrated by SHAttered attack in 2017 by Google/CWI). NIST deprecated SHA-1 for all security applications in 2011 and mandated discontinuation by 2030 under SP 800-131A Rev 2.',
    '3DES': '3DES (Triple Data Encryption Standard) uses 168-bit effective keys but operates on 64-bit blocks, making it vulnerable to SWEET32 birthday attacks with ~2^32 block collisions. NIST deprecated 3DES in 2017 (SP 800-131A Rev 2) and recommends AES-128 or AES-256 as replacement.',
    'AES-ECB': 'AES-ECB (Electronic Codebook mode) is deterministic — identical plaintext blocks produce identical ciphertext blocks. This leaks structural patterns in plaintext and cannot provide semantic security. NIST mandates authenticated encryption modes (GCM, CCM, SIV) for data protection.',
    'AES-256-GCM': 'AES-256-GCM is an Authenticated Encryption with Associated Data (AEAD) cipher combining AES-256 in CTR mode with GHASH authentication. It provides both data confidentiality and integrity. AES-256-GCM is FIPS 140-3 approved and recommended as the primary symmetric cipher for all security applications.',
    'default': `The cryptographic primitive ${finding.algorithm} was analyzed against NIST SP 800-131A baselines and FIPS standards. ${isWeak ? 'It does not meet current minimum security requirements.' : 'It meets current cryptographic security baselines.'}`
  };

  const algoKey = Object.keys(technicalExplanationMap).find(k => finding.algorithm?.includes(k)) || 'default';

  return {
    executive_summary: executiveSummaryMap[finding.severity] || executiveSummaryMap['informational'],
    technical_explanation: technicalExplanationMap[algoKey],
    business_impact: isWeak
      ? `Use of deprecated cryptographic primitives may constitute non-compliance with FIPS 140-3 (federal information systems), DPDP Act 2023 (India data protection), RBI IT Framework for Banks (2023 circular), SOC 2 Type II, and ISO 27001:2022 cryptography controls. Penalties under these frameworks range from operational suspension to significant financial penalties.`
      : `The ${finding.algorithm} implementation is compliant with applicable standards including FIPS 140-3, NIST SP 800-38D, and ISO 27001:2022. No compliance remediation is required for this finding.`,
    pqc_migration_path: finding.quantum_vulnerable
      ? `This algorithm is vulnerable to Shor's Algorithm on a Cryptanalytically Relevant Quantum Computer (CRQC). Migration roadmap: (1) Inventory all usage instances via Crypto-BOM, (2) Prototype hybrid classical + post-quantum key exchange using X25519 + ML-KEM-768 (FIPS 203), (3) Transition digital signatures to ML-DSA (FIPS 204) or SLH-DSA (FIPS 205), (4) Full transition before CNSA 2.0 mandatory deadline (2033).`
      : `${finding.algorithm} is quantum-resistant under current CRQC threat models. Grover's Algorithm reduces symmetric key strength by half (AES-256 → 128-bit equivalent), which remains secure. No immediate PQC migration required — maintain AES-256 and SHA-256/384.`,
    is_live_ai: false
  };
}

function buildDeterministicAnswer(question: string, findings: any[]) {
  const q = question.toLowerCase();
  const criticalFindings = findings.filter(f => f.severity === 'critical');
  const hasFindings = findings.length > 0;

  let answer = '';

  if (!hasFindings) {
    answer = 'No cryptographic findings are currently in the database. Please run a scan first using the **Start New Scan** feature (upload a source code archive or use the demo targets in the sidebar). Once scanning completes, I can provide detailed cryptographic risk analysis and remediation recommendations.';
  } else if (q.includes('critical') || q.includes('most severe') || q.includes('worst')) {
    if (criticalFindings.length > 0) {
      const f = criticalFindings[0];
      answer = `The most critical cryptographic issue detected is **${f.title}** (${f.algorithm}) in \`${f.file_path}\`.\n\n**Reason it's Critical:** ${f.algorithm.includes('RSA') ? 'RSA keys below 2048-bit provide less than 80-bit security and can be factored with modern hardware (NIST SP 800-131A mandate).' : f.algorithm.includes('MD5') ? 'MD5 is a broken hash function with demonstrated collision attacks (Wang & Yu, 2004). Never use for security purposes.' : f.algorithm.includes('SHA-1') ? 'SHA-1 is deprecated by NIST and vulnerable to the SHAttered collision attack (Google/CWI, 2017).' : 'This primitive fails NIST minimum security baselines.'}\n\n**Immediate Action:** Replace with approved alternative per NIST SP 800-131A.`;
    } else {
      answer = `No critical-severity findings are currently detected. Your ${findings.length} findings span high, medium, and lower severity tiers. Run a complete scan of all assets to ensure full coverage.`;
    }
  } else if (q.includes('pqc') || q.includes('quantum') || q.includes('post-quantum')) {
    const qvFindings = findings.filter(f => f.quantum_vulnerable);
    answer = `**Post-Quantum Cryptography (PQC) Assessment:**\n\nOf ${findings.length} total cryptographic instances discovered, **${qvFindings.length}** are vulnerable to Shor's Algorithm on a Cryptanalytically Relevant Quantum Computer (CRQC).\n\nAffected algorithms: ${[...new Set(qvFindings.map(f => f.algorithm))].join(', ') || 'None detected'}\n\n**Migration Strategy (NIST FIPS 203/204/205):**\n1. Key Encapsulation: Replace RSA/ECDH with ML-KEM-768 (FIPS 203)\n2. Digital Signatures: Replace ECDSA with ML-DSA (FIPS 204)\n3. Hybrid transition: Deploy X25519 + ML-KEM simultaneously during migration\n4. Full transition deadline: CNSA 2.0 mandates completion by 2033`;
  } else if (q.includes('migrate') || q.includes('fix') || q.includes('remediat')) {
    answer = `**Prioritized Cryptographic Remediation Roadmap:**\n\n${criticalFindings.slice(0, 3).map((f, i) => `**P${i + 1} [IMMEDIATE]:** ${f.algorithm} → Replace with ${f.algorithm.includes('RSA') ? 'RSA-3072 or ML-KEM-768' : f.algorithm.includes('MD5') ? 'SHA-256 or SHA-3-256' : f.algorithm.includes('SHA-1') ? 'SHA-256 (FIPS 180-4)' : f.algorithm.includes('3DES') ? 'AES-256-GCM' : 'AES-256-GCM'}`).join('\n')}\n\nAll replacements should use FIPS 140-3 validated cryptographic modules. Re-scan after each fix to verify remediation.`;
  } else {
    answer = `Based on the ${findings.length} cryptographic findings in the database:\n\n- **Critical Findings:** ${criticalFindings.length} — requiring immediate action\n- **Algorithms Detected:** ${[...new Set(findings.map(f => f.algorithm))].slice(0, 6).join(', ')}\n\nUse the **Findings Explorer** to filter by severity, or ask me specific questions about quantum vulnerability, NIST compliance, or migration paths for any detected algorithm.`;
  }

  return {
    answer,
    references: buildReferences(findings),
    is_live_ai: false
  };
}

function buildReferences(findings: any[]) {
  const refs: string[] = ['NIST SP 800-131A Rev 2 — Transitioning Use of Cryptographic Algorithms'];
  const hasRSA = findings.some(f => f.algorithm?.includes('RSA'));
  const hasSHA1MD5 = findings.some(f => f.algorithm?.includes('SHA-1') || f.algorithm?.includes('MD5'));
  const has3DES = findings.some(f => f.algorithm?.includes('3DES') || f.algorithm?.includes('DES'));
  const hasQuantum = findings.some(f => f.quantum_vulnerable);

  if (hasRSA) refs.push('FIPS 186-5 — Digital Signature Standard (RSA Key Requirements)');
  if (hasSHA1MD5) refs.push('NIST SP 800-107 — Hash Algorithm Deprecation Guidance');
  if (has3DES) refs.push('NIST SP 800-131A — 3DES Deprecation (2023 Deadline)');
  if (hasQuantum) refs.push('FIPS 203 (ML-KEM) & FIPS 204 (ML-DSA) — Post-Quantum Standards');
  refs.push('NIST IR 8454 — PQC Migration Status for Cybersecurity Frameworks');
  return refs;
}
