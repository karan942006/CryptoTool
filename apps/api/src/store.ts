import { v4 as uuidv4 } from 'uuid';
import {
  Organization,
  UserMember,
  Asset,
  Scan,
  CryptoFinding,
  CryptoBOMComponent,
  CertificateEntry,
  KeyMetadataEntry,
  AssessmentReport,
  AuditLogEntry,
  DigitalTwinNode,
  DigitalTwinEdge,
  DigitalTwinGraph,
  PQCBenchmarkItem,
  CryptoStrengthMatrixItem,
  HNDLRiskRecord
} from './types.js';

class DataStore {
  public organizations: Map<string, Organization> = new Map();
  public members: Map<string, UserMember> = new Map();
  public assets: Map<string, Asset> = new Map();
  public scans: Map<string, Scan> = new Map();
  public findings: Map<string, CryptoFinding> = new Map();
  public components: Map<string, CryptoBOMComponent> = new Map();
  public certificates: Map<string, CertificateEntry> = new Map();
  public keys: Map<string, KeyMetadataEntry> = new Map();
  public reports: Map<string, AssessmentReport> = new Map();
  public auditLogs: AuditLogEntry[] = [];
  public addAuditLog(email: string, action: string, resourceType: string, resourceId: string, details?: any) {
    this.auditLogs.unshift({
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      user_email: email,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details: details || {},
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString()
    });
  }

  constructor() {
    this.seedDefaultData();
  }

  public seedDefaultData() {
    const orgId = 'a0000000-0000-0000-0000-000000000001';
    
    // Organization
    const defaultOrg: Organization = {
      id: orgId,
      name: 'National Cyber Defense Agency',
      slug: 'national-cyber-defense',
      description: 'Authorized Enterprise Security Assessment Unit (SIH26164 Demonstration Tenant)',
      tier: 'enterprise',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.organizations.set(defaultOrg.id, defaultOrg);

    // Member
    const defaultMember: UserMember = {
      id: 'b0000000-0000-0000-0000-000000000001',
      organization_id: orgId,
      user_id: 'c0000000-0000-0000-0000-000000000001',
      role: 'owner',
      email: 'admin@cryptotool.internal',
      full_name: 'Chief Information Security Officer',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    };
    this.members.set(defaultMember.id, defaultMember);

    // ── Asset 1: CryptoTalk (Secure Reference App) ──────────────
    const cryptoTalkAsset: Asset = {
      id: 'd0000000-0000-0000-0000-000000000001',
      organization_id: orgId,
      name: 'CryptoTalk Secure Messenger',
      description: 'Reference secure end-to-end encrypted messaging application utilizing AES-256-GCM, Android Keystore, and X25519/ECDH.',
      type: 'mobile_app',
      url: 'https://cryptotalk.internal',
      repository_url: 'https://github.com/enterprise/cryptotalk-app',
      owner: 'Mobile Cryptography Team',
      environment: 'production',
      criticality: 'critical',
      exposure: 'external',
      tags: ['mobile', 'e2ee', 'android', 'messaging', 'reference-app', 'pqc-ready'],
      is_demo: true,
      authorization_confirmed: true,
      last_scanned_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.assets.set(cryptoTalkAsset.id, cryptoTalkAsset);

    // ── Asset 2: Legacy Banking API ────────────────────────────
    const legacyBankingAsset: Asset = {
      id: 'd0000000-0000-0000-0000-000000000002',
      organization_id: orgId,
      name: 'Legacy Banking API Service',
      description: 'Core transactional API service with legacy cryptographic algorithms (RSA-1024, SHA-1, 3DES, TLS 1.0).',
      type: 'api',
      url: 'https://api.legacybanking.internal',
      repository_url: 'https://github.com/enterprise/legacy-banking-api',
      owner: 'Core Banking Infrastructure',
      environment: 'production',
      criticality: 'critical',
      exposure: 'external',
      tags: ['api', 'banking', 'legacy', 'pci-scope', 'quantum-vulnerable'],
      is_demo: true,
      authorization_confirmed: true,
      last_scanned_at: new Date(Date.now() - 5 * 3600000).toISOString(),
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.assets.set(legacyBankingAsset.id, legacyBankingAsset);

    // ── Asset 3: Government Employee & Citizen Identity Portal ──
    const govPortalAsset: Asset = {
      id: 'd0000000-0000-0000-0000-000000000003',
      organization_id: orgId,
      name: 'National Citizen Identity & Auth Portal',
      description: 'Internal identity, biometric authentication, and citizen registry portal (Retention: 25 years).',
      type: 'web_app',
      url: 'https://id.gov.internal',
      owner: 'E-Governance Identity Unit',
      environment: 'production',
      criticality: 'critical',
      exposure: 'external',
      tags: ['portal', 'e-gov', 'auth', 'sso', 'hndl-critical', 'long-lived'],
      is_demo: true,
      authorization_confirmed: true,
      last_scanned_at: new Date(Date.now() - 24 * 3600000).toISOString(),
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.assets.set(govPortalAsset.id, govPortalAsset);

    // ── Asset 4: Cloud Payment KMS & Secrets Vault ─────────────
    const cloudKmsAsset: Asset = {
      id: 'd0000000-0000-0000-0000-000000000004',
      organization_id: orgId,
      name: 'Payment Cloud HSM & KMS Cluster',
      description: 'Multi-cloud FIPS 140-3 Level 3 Hardware Security Module and Customer Master Key vault.',
      type: 'cloud_kms',
      url: 'https://kms.cloud.internal',
      owner: 'SecOps Cloud Infrastructure',
      environment: 'production',
      criticality: 'critical',
      exposure: 'internal',
      tags: ['cloud-kms', 'hsm', 'aws-kms', 'azure-keyvault', 'fips-140-3'],
      is_demo: true,
      authorization_confirmed: true,
      last_scanned_at: new Date(Date.now() - 12 * 3600000).toISOString(),
      created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.assets.set(cloudKmsAsset.id, cloudKmsAsset);

    // ── Asset 5: Healthcare Patient Record EHR DB ───────────────
    const ehrDbAsset: Asset = {
      id: 'd0000000-0000-0000-0000-000000000005',
      organization_id: orgId,
      name: 'Central Patient Health Record (EHR) DB',
      description: 'Confidential clinical health records and genomic sequencing repository (Data lifetime: 30 years).',
      type: 'server',
      url: 'https://ehr-db.health.internal',
      owner: 'Health Informatics SecOps',
      environment: 'production',
      criticality: 'critical',
      exposure: 'internal',
      tags: ['healthcare', 'ehr', 'hipaa', 'dpdp', 'hndl-critical', '30yr-retention'],
      is_demo: true,
      authorization_confirmed: true,
      last_scanned_at: new Date(Date.now() - 8 * 3600000).toISOString(),
      created_at: new Date(Date.now() - 22 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.assets.set(ehrDbAsset.id, ehrDbAsset);

    // ── Seed Scans & Findings for CryptoTalk ────────────────────
    const cryptoTalkScanId = 's0000000-0000-0000-0000-000000000001';
    const cryptoTalkScan: Scan = {
      id: cryptoTalkScanId,
      organization_id: orgId,
      asset_id: cryptoTalkAsset.id,
      asset_name: cryptoTalkAsset.name,
      scan_type: 'source_code',
      status: 'completed',
      progress_percentage: 100,
      current_step: 'Scan completed successfully',
      target_identifier: 'cryptotalk-app-v2.1.zip',
      total_files_analyzed: 14,
      total_findings_count: 4,
      critical_count: 0,
      high_count: 0,
      medium_count: 0,
      low_count: 0,
      info_count: 4,
      overall_security_score: 98,
      pqc_readiness_score: 82,
      is_demo: true,
      logs: [
        { timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), message: 'Archive extracted safely', level: 'info' },
        { timestamp: new Date(Date.now() - 2 * 3600000 + 1000).toISOString(), message: 'Multi-layer AST discovery running', level: 'info' },
        { timestamp: new Date(Date.now() - 2 * 3600000 + 2000).toISOString(), message: 'AES-GCM, ECDH, Keystore identified', level: 'info' },
        { timestamp: new Date(Date.now() - 2 * 3600000 + 3000).toISOString(), message: 'Deterministic risk engine executed: Score 98/100', level: 'info' }
      ],
      started_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      completed_at: new Date(Date.now() - 2 * 3600000 + 5000).toISOString(),
      created_at: new Date(Date.now() - 2 * 3600000).toISOString()
    };
    this.scans.set(cryptoTalkScan.id, cryptoTalkScan);

    // CryptoTalk Findings
    const ctFinding1: CryptoFinding = {
      id: uuidv4(),
      scan_id: cryptoTalkScanId,
      asset_id: cryptoTalkAsset.id,
      asset_name: cryptoTalkAsset.name,
      organization_id: orgId,
      rule_id: 'JAVA-CIPHER-AES-GCM',
      title: 'Authenticated AES-256-GCM Encryption in Use',
      description: 'AES in Galois/Counter Mode (GCM) with 256-bit key provides confidentiality and built-in cryptographic integrity (AEAD).',
      category: 'Symmetric Encryption',
      algorithm: 'AES-256-GCM',
      mode: 'GCM',
      padding: 'NoPadding',
      key_size: 256,
      key_size_str: '256',
      file_path: 'CryptoTalkManager.java',
      line_number: 30,
      code_snippet_redacted: 'Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");',
      api_reference: 'javax.crypto.Cipher',
      language: 'java',
      severity: 'informational',
      confidence: 'high',
      status: 'open',
      quantum_vulnerable: false,
      pqc_priority: 'low',
      remediation_deterministic: 'Maintain current implementation. Ensure 96-bit unique IVs (nonces) are generated randomly per encryption.',
      is_demo: true,
      created_at: new Date().toISOString()
    };
    this.findings.set(ctFinding1.id, ctFinding1);

    const ctFinding2: CryptoFinding = {
      id: uuidv4(),
      scan_id: cryptoTalkScanId,
      asset_id: cryptoTalkAsset.id,
      asset_name: cryptoTalkAsset.name,
      organization_id: orgId,
      rule_id: 'JAVA-KEYAGREE-ECDH',
      title: 'Elliptic Curve Key Agreement (X25519/ECDH)',
      description: 'ECDH provides forward-secret session key establishment classically. Vulnerable to Shor\'s algorithm on cryptographically relevant quantum computers (CRQC).',
      category: 'Key Exchange',
      algorithm: 'ECDH / X25519',
      file_path: 'CryptoTalkManager.java',
      line_number: 45,
      code_snippet_redacted: 'KeyAgreement keyAgreement = KeyAgreement.getInstance("ECDH");',
      api_reference: 'javax.crypto.KeyAgreement',
      language: 'java',
      severity: 'informational',
      confidence: 'high',
      status: 'open',
      quantum_vulnerable: true,
      pqc_priority: 'high',
      remediation_deterministic: 'Classically strong. Plan migration to hybrid post-quantum KEMs (X25519 + ML-KEM-768 / FIPS 203).',
      code_diff_suggestion: {
        original: '// Classical ECDH Key Exchange\nKeyAgreement ka = KeyAgreement.getInstance("ECDH");',
        replacement: '// Hybrid Classical + Post-Quantum KEM (FIPS 203)\nHybridKEM kem = new HybridKEM("X25519_ML-KEM-768");\nkem.encapsulate(peerPublicKey);',
        explanation: 'Enables quantum-resistant key encapsulation while preserving classical backward compatibility.'
      },
      is_demo: true,
      created_at: new Date().toISOString()
    };
    this.findings.set(ctFinding2.id, ctFinding2);

    // CryptoTalk Components / BOM
    this.components.set(uuidv4(), {
      id: uuidv4(),
      scan_id: cryptoTalkScanId,
      asset_id: cryptoTalkAsset.id,
      asset_name: cryptoTalkAsset.name,
      organization_id: orgId,
      component_name: 'Message AEAD Encryption',
      algorithm: 'AES-256-GCM',
      category: 'Symmetric Encryption',
      purpose: 'End-to-End Chat Confidentiality & Integrity',
      location: 'CryptoTalkManager.java:30',
      key_size_or_curve: '256',
      security_status: 'Recommended',
      pqc_relevance: 'Quantum Resistant (Grover Halving Retains 128-bit Security)',
      is_quantum_safe: true,
      risk_level: 'Informational',
      evidence: 'Cipher.getInstance("AES/GCM/NoPadding")',
      created_at: new Date().toISOString()
    });

    this.components.set(uuidv4(), {
      id: uuidv4(),
      scan_id: cryptoTalkScanId,
      asset_id: cryptoTalkAsset.id,
      asset_name: cryptoTalkAsset.name,
      organization_id: orgId,
      component_name: 'Ephemeral Key Agreement',
      algorithm: 'X25519 / ECDH',
      category: 'Key Exchange',
      purpose: 'Forward-Secret Session Key Exchange',
      location: 'CryptoTalkManager.java:45',
      key_size_or_curve: '256 (Curve25519)',
      security_status: 'Recommended (Classical)',
      pqc_relevance: 'Quantum Vulnerable (Shor\'s Algorithm)',
      is_quantum_safe: false,
      risk_level: 'Informational',
      evidence: 'KeyAgreement.getInstance("ECDH")',
      created_at: new Date().toISOString()
    });

    // ── Seed Scans & Findings for Legacy Banking ────────────────
    const legacyScanId = 's0000000-0000-0000-0000-000000000002';
    const legacyScan: Scan = {
      id: legacyScanId,
      organization_id: orgId,
      asset_id: legacyBankingAsset.id,
      asset_name: legacyBankingAsset.name,
      scan_type: 'source_code',
      status: 'completed',
      progress_percentage: 100,
      current_step: 'Completed with critical security issues',
      target_identifier: 'legacy-banking-api-v1.4.tar.gz',
      total_files_analyzed: 28,
      total_findings_count: 6,
      critical_count: 3,
      high_count: 2,
      medium_count: 1,
      low_count: 0,
      info_count: 0,
      overall_security_score: 24,
      pqc_readiness_score: 18,
      is_demo: true,
      logs: [
        { timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), message: 'Initiated legacy repository scan', level: 'info' },
        { timestamp: new Date(Date.now() - 5 * 3600000 + 1000).toISOString(), message: 'CRITICAL: RSA-1024 and MD5 detected in auth module', level: 'error' },
        { timestamp: new Date(Date.now() - 5 * 3600000 + 2000).toISOString(), message: 'CRITICAL: 3DES in ECB mode discovered', level: 'error' },
        { timestamp: new Date(Date.now() - 5 * 3600000 + 3000).toISOString(), message: 'Calculated critical risk posture (Score 24/100)', level: 'warn' }
      ],
      started_at: new Date(Date.now() - 5 * 3600000).toISOString(),
      completed_at: new Date(Date.now() - 5 * 3600000 + 6000).toISOString(),
      created_at: new Date(Date.now() - 5 * 3600000).toISOString()
    };
    this.scans.set(legacyScan.id, legacyScan);

    // Legacy Findings
    const legFinding1: CryptoFinding = {
      id: uuidv4(),
      scan_id: legacyScanId,
      asset_id: legacyBankingAsset.id,
      asset_name: legacyBankingAsset.name,
      organization_id: orgId,
      rule_id: 'PY-RSA-1024',
      title: 'Insecure RSA-1024 Key Size in Authentication Flow',
      description: 'RSA with 1024-bit key length is cryptographically broken classically via distributed factoring attacks and completely broken by Shor\'s quantum algorithm.',
      category: 'Asymmetric / Public Key',
      algorithm: 'RSA',
      key_size: 1024,
      key_size_str: '1024',
      file_path: 'legacy_auth.py',
      line_number: 18,
      code_snippet_redacted: 'rsa_key = RSA.generate(1024)',
      api_reference: 'Crypto.PublicKey.RSA',
      language: 'python',
      severity: 'critical',
      confidence: 'high',
      status: 'open',
      quantum_vulnerable: true,
      pqc_priority: 'immediate',
      remediation_deterministic: 'Upgrade immediately to ML-KEM-768 for key establishment or ML-DSA-65 for signatures, with minimum 3072-bit RSA interim.',
      code_diff_suggestion: {
        original: 'from Crypto.PublicKey import RSA\nkey = RSA.generate(1024) # Insecure 1024-bit',
        replacement: 'from pqcrypto.kem import ml_kem_768\npk, sk = ml_kem_768.keypair() # FIPS 203 Post-Quantum Standard',
        explanation: 'Replaces broken 1024-bit RSA with NIST FIPS 203 ML-KEM-768 post-quantum key encapsulation.'
      },
      is_demo: true,
      created_at: new Date().toISOString()
    };
    this.findings.set(legFinding1.id, legFinding1);

    const legFinding2: CryptoFinding = {
      id: uuidv4(),
      scan_id: legacyScanId,
      asset_id: legacyBankingAsset.id,
      asset_name: legacyBankingAsset.name,
      organization_id: orgId,
      rule_id: 'PY-CIPHER-3DES-ECB',
      title: 'Triple-DES (3DES) in ECB Mode for Cardholder Data',
      description: '3DES utilizes 64-bit block sizes vulnerable to Sweet32 collision attacks (CVE-2016-2183) and ECB mode leaks structural ciphertext patterns.',
      category: 'Symmetric Encryption',
      algorithm: '3DES-ECB',
      mode: 'ECB',
      file_path: 'payment_processor.py',
      line_number: 52,
      code_snippet_redacted: 'cipher = DES3.new(key, DES3.MODE_ECB)',
      api_reference: 'Crypto.Cipher.DES3',
      language: 'python',
      severity: 'critical',
      confidence: 'high',
      status: 'open',
      quantum_vulnerable: false,
      pqc_priority: 'immediate',
      remediation_deterministic: 'Replace 3DES-ECB with AES-256-GCM AEAD encryption with randomized 96-bit nonces (NIST SP 800-131A & PCI-DSS 4.0).',
      code_diff_suggestion: {
        original: 'cipher = DES3.new(key, DES3.MODE_ECB)\nencrypted = cipher.encrypt(card_pan)',
        replacement: 'from cryptography.hazmat.primitives.ciphers.aead import AESGCM\naesgcm = AESGCM(aes_key_256)\nnonce = os.urandom(12)\nencrypted = aesgcm.encrypt(nonce, card_pan, None)',
        explanation: 'Upgrades deprecated 3DES-ECB to FIPS-compliant AES-256-GCM AEAD.'
      },
      is_demo: true,
      created_at: new Date().toISOString()
    };
    this.findings.set(legFinding2.id, legFinding2);

    const legFinding3: CryptoFinding = {
      id: uuidv4(),
      scan_id: legacyScanId,
      asset_id: legacyBankingAsset.id,
      asset_name: legacyBankingAsset.name,
      organization_id: orgId,
      rule_id: 'PY-HASH-MD5',
      title: 'Broken MD5 Hashing in Transaction PIN Verification',
      description: 'MD5 is broken by rapid collision generation (Wang 2004) and forbidden under NIST SP 800-131A and FIPS 140-3.',
      category: 'Cryptographic Hash',
      algorithm: 'MD5',
      digest_size: 128,
      file_path: 'pin_verifier.py',
      line_number: 14,
      code_snippet_redacted: 'pin_hash = hashlib.md5(pin.encode()).hexdigest()',
      api_reference: 'hashlib.md5',
      language: 'python',
      severity: 'critical',
      confidence: 'high',
      status: 'open',
      quantum_vulnerable: false,
      pqc_priority: 'immediate',
      remediation_deterministic: 'Migrate PIN/password hashing to Argon2id (RFC 9106) or PBKDF2-HMAC-SHA256.',
      is_demo: true,
      created_at: new Date().toISOString()
    };
    this.findings.set(legFinding3.id, legFinding3);

    // Legacy Banking Components
    this.components.set(uuidv4(), {
      id: uuidv4(),
      scan_id: legacyScanId,
      asset_id: legacyBankingAsset.id,
      asset_name: legacyBankingAsset.name,
      organization_id: orgId,
      component_name: 'Authentication Key Pair',
      algorithm: 'RSA-1024',
      category: 'Public Key Encryption',
      purpose: 'API Session Authentication',
      location: 'legacy_auth.py:18',
      key_size_or_curve: '1024',
      security_status: 'Broken (Prohibited)',
      pqc_relevance: 'Quantum Vulnerable (Shor\'s Factorization)',
      is_quantum_safe: false,
      risk_level: 'Critical',
      evidence: 'RSA.generate(1024)',
      created_at: new Date().toISOString()
    });

    this.components.set(uuidv4(), {
      id: uuidv4(),
      scan_id: legacyScanId,
      asset_id: legacyBankingAsset.id,
      asset_name: legacyBankingAsset.name,
      organization_id: orgId,
      component_name: 'Cardholder PAN Storage',
      algorithm: '3DES-ECB',
      category: 'Symmetric Encryption',
      purpose: 'Card Storage at Rest',
      location: 'payment_processor.py:52',
      key_size_or_curve: '168-bit (Effective 112-bit)',
      security_status: 'Broken / Sweet32',
      pqc_relevance: 'Classical Vulnerability',
      is_quantum_safe: false,
      risk_level: 'Critical',
      evidence: 'DES3.new(key, DES3.MODE_ECB)',
      created_at: new Date().toISOString()
    });

    // ── Seed Key Metadata (Never private keys! Privacy preserving) ─
    const key1: KeyMetadataEntry = {
      id: 'k0000000-0000-0000-0000-000000000001',
      organization_id: orgId,
      asset_id: cloudKmsAsset.id,
      asset_name: 'Payment Cloud HSM & KMS Cluster',
      key_alias: 'prod-payment-transit-key-01',
      key_type: 'asymmetric_public',
      algorithm: 'RSA-2048',
      key_size: 2048,
      owner: 'SecOps Cloud Team',
      application: 'Payment Tokenization Gateway',
      creation_date: '2023-01-15T00:00:00Z',
      expiration_date: '2026-01-15T00:00:00Z',
      last_rotated_date: '2024-01-15T00:00:00Z',
      rotation_status: 'compliant',
      storage_location: 'AWS KMS (HSM)',
      is_quantum_vulnerable: true,
      pqc_candidate: 'ML-KEM-768 (FIPS 203)',
      data_sensitivity: 'Financial / PCI-DSS'
    };
    this.keys.set(key1.id, key1);

    const key2: KeyMetadataEntry = {
      id: 'k0000000-0000-0000-0000-000000000002',
      organization_id: orgId,
      asset_id: govPortalAsset.id,
      asset_name: 'National Citizen Identity & Auth Portal',
      key_alias: 'citizen-signing-root-ca-key',
      key_type: 'asymmetric_public',
      algorithm: 'ECDSA-P256',
      key_size: 256,
      owner: 'Gov PKI Authority',
      application: 'Citizen e-ID Signatures',
      creation_date: '2021-06-01T00:00:00Z',
      expiration_date: '2031-06-01T00:00:00Z',
      rotation_status: 'never_rotated',
      storage_location: 'PKCS#11 HSM',
      is_quantum_vulnerable: true,
      pqc_candidate: 'ML-DSA-65 (FIPS 204)',
      data_sensitivity: 'Top Secret / Government'
    };
    this.keys.set(key2.id, key2);

    const key3: KeyMetadataEntry = {
      id: 'k0000000-0000-0000-0000-000000000003',
      organization_id: orgId,
      asset_id: ehrDbAsset.id,
      asset_name: 'Central Patient Health Record (EHR) DB',
      key_alias: 'ehr-genomics-master-dek',
      key_type: 'symmetric',
      algorithm: 'AES-256',
      key_size: 256,
      owner: 'Health SecOps',
      application: 'Genomic Sequence DB Encryption',
      creation_date: '2022-03-10T00:00:00Z',
      expiration_date: '2032-03-10T00:00:00Z',
      last_rotated_date: '2024-03-10T00:00:00Z',
      rotation_status: 'compliant',
      storage_location: 'Azure Key Vault',
      is_quantum_vulnerable: false,
      pqc_candidate: 'Retain AES-256 (Grover Halving leaves 128-bit)',
      data_sensitivity: 'Personal Data (GDPR/DPDP)'
    };
    this.keys.set(key3.id, key3);

    // ── Seed Certificates ──────────────────────────────────────
    const cert1: CertificateEntry = {
      id: 'cert-001',
      organization_id: orgId,
      asset_id: govPortalAsset.id,
      endpoint: 'https://id.gov.internal:443',
      tls_version: 'TLSv1.3',
      cipher_suite: 'TLS_AES_256_GCM_SHA384',
      subject: 'CN=id.gov.internal, O=National Identity Authority, C=IN',
      issuer: 'CN=National Gov Root CA G2, O=National Cyber Defense, C=IN',
      valid_from: '2024-01-01T00:00:00Z',
      valid_until: '2025-01-01T00:00:00Z',
      days_until_expiry: 18,
      public_key_algorithm: 'RSA',
      public_key_size: 2048,
      signature_algorithm: 'SHA256withRSA',
      sans: ['id.gov.internal', 'auth.gov.internal', 'sso.gov.internal'],
      chain_status: 'Valid (2 intermediate links verified)',
      health_status: 'expiring_soon',
      is_demo: true,
      created_at: new Date().toISOString()
    };
    this.certificates.set(cert1.id, cert1);

    const cert2: CertificateEntry = {
      id: 'cert-002',
      organization_id: orgId,
      asset_id: legacyBankingAsset.id,
      endpoint: 'https://api.legacybanking.internal:8443',
      tls_version: 'TLSv1.0',
      cipher_suite: 'TLS_RSA_WITH_3DES_EDE_CBC_SHA',
      subject: 'CN=api.legacybanking.internal, OU=Core Banking',
      issuer: 'CN=Legacy Internal Test CA, OU=IT',
      valid_from: '2020-03-15T00:00:00Z',
      valid_until: '2023-03-15T00:00:00Z',
      days_until_expiry: -520,
      public_key_algorithm: 'RSA',
      public_key_size: 1024,
      signature_algorithm: 'SHA1withRSA',
      sans: ['api.legacybanking.internal'],
      chain_status: 'Untrusted / Expired / Weak Signature',
      health_status: 'expired',
      is_demo: true,
      created_at: new Date().toISOString()
    };
    this.certificates.set(cert2.id, cert2);

    const cert3: CertificateEntry = {
      id: 'cert-003',
      organization_id: orgId,
      asset_id: cryptoTalkAsset.id,
      endpoint: 'https://cryptotalk.internal:443',
      tls_version: 'TLSv1.3',
      cipher_suite: 'TLS_CHACHA20_POLY1305_SHA256',
      subject: 'CN=cryptotalk.internal, O=CryptoTalk Inc',
      issuer: 'CN=Let\'s Encrypt ISRG Root X1, O=Let\'s Encrypt',
      valid_from: '2026-06-01T00:00:00Z',
      valid_until: '2027-06-01T00:00:00Z',
      days_until_expiry: 272,
      public_key_algorithm: 'ECDSA',
      public_key_size: 256,
      signature_algorithm: 'ECDSAwithSHA384',
      sans: ['cryptotalk.internal', 'api.cryptotalk.internal'],
      chain_status: 'Valid (ISRG Root X1 trusted)',
      health_status: 'healthy',
      is_demo: true,
      created_at: new Date().toISOString()
    };
    this.certificates.set(cert3.id, cert3);
  }

  // ── Digital Twin Generator (THE WOW FACTOR) ─────────────────
  public getDigitalTwinGraph(): DigitalTwinGraph {
    const nodes: DigitalTwinNode[] = [
      // Enterprise Core
      {
        id: 'node-ent',
        label: 'National Cyber Enterprise Hub',
        type: 'enterprise',
        category: 'Enterprise Infrastructure',
        status: 'high',
        x: 450,
        y: 30,
        details: {
          quantum_status: 'Vulnerable',
          data_sensitivity: 'Critical',
          data_lifetime_years: 25,
          migration_time_years: 4,
          hndl_risk: 'HIGH',
          business_criticality: 'CRITICAL',
          recommended_pqc: 'NIST CNSA 2.0 Complete Suite',
          hybrid_candidate: 'Hybrid X25519 + ML-KEM-768 / Dual Certs',
          migration_difficulty: 'COMPLEX',
          estimated_cost_inr: '₹18.4 Lakh',
          priority: 'P0',
          affected_services: ['Legacy Banking', 'Citizen Identity', 'Payment Gateway']
        }
      },
      // Application Tier
      {
        id: 'node-app-payment',
        label: 'Payment Tokenization API',
        type: 'app',
        category: 'Financial API Gateway',
        status: 'critical',
        x: 180,
        y: 160,
        details: {
          algorithm: 'RSA-2048',
          usage: 'Key Establishment & TLS Handshake',
          key_size: '2048-bit',
          quantum_status: 'Vulnerable',
          data_sensitivity: 'Critical',
          data_lifetime_years: 15,
          migration_time_years: 3,
          hndl_risk: 'CRITICAL',
          business_criticality: 'CRITICAL',
          recommended_pqc: 'ML-KEM-768 (FIPS 203)',
          hybrid_candidate: 'X25519 + ML-KEM-768 Hybrid',
          migration_difficulty: 'MEDIUM',
          estimated_cost_inr: '₹4.2 Lakh',
          priority: 'P0',
          affected_files: ['PaymentTokenGateway.java', 'TLSConfig.java']
        }
      },
      {
        id: 'node-app-gov',
        label: 'Citizen Identity e-ID Portal',
        type: 'app',
        category: 'Government SSO / PII',
        status: 'high',
        x: 450,
        y: 160,
        details: {
          algorithm: 'ECDSA-P256',
          usage: 'Digital Signatures & Identity Tokens',
          key_size: '256-bit ECC',
          quantum_status: 'Vulnerable',
          data_sensitivity: 'Critical',
          data_lifetime_years: 25,
          migration_time_years: 4,
          hndl_risk: 'HIGH',
          business_criticality: 'CRITICAL',
          recommended_pqc: 'ML-DSA-65 (FIPS 204)',
          hybrid_candidate: 'Dual Signature Composite (ECDSA + ML-DSA)',
          migration_difficulty: 'HIGH',
          estimated_cost_inr: '₹6.8 Lakh',
          priority: 'P0',
          affected_files: ['AuthManager.kt', 'IdentityCert.x509']
        }
      },
      {
        id: 'node-app-cryptotalk',
        label: 'CryptoTalk Secure Messenger',
        type: 'app',
        category: 'Mobile E2EE Messaging',
        status: 'safe',
        x: 720,
        y: 160,
        details: {
          algorithm: 'AES-256-GCM + X25519',
          usage: 'End-to-End Chat Confidentiality',
          key_size: '256-bit',
          quantum_status: 'Protected',
          data_sensitivity: 'Medium',
          data_lifetime_years: 2,
          migration_time_years: 1,
          hndl_risk: 'LOW',
          business_criticality: 'HIGH',
          recommended_pqc: 'ML-KEM-768 for Ratchet',
          hybrid_candidate: 'Double Ratchet + Kyber Hybrid',
          migration_difficulty: 'LOW',
          estimated_cost_inr: '₹1.5 Lakh',
          priority: 'P3',
          affected_files: ['CryptoTalkManager.java']
        }
      },
      // Crypto Primitives Tier
      {
        id: 'node-crypto-rsa',
        label: 'RSA-2048 / RSA-1024',
        type: 'crypto',
        category: 'Asymmetric Primitive',
        status: 'critical',
        x: 180,
        y: 300,
        details: {
          algorithm: 'RSA-2048 / 1024',
          usage: 'Public Key Encryption & Signatures',
          quantum_status: 'Vulnerable',
          data_sensitivity: 'Critical',
          data_lifetime_years: 15,
          migration_time_years: 3,
          hndl_risk: 'CRITICAL',
          business_criticality: 'CRITICAL',
          recommended_pqc: 'ML-KEM-768 & ML-DSA-65',
          hybrid_candidate: 'X25519_ML-KEM-768 / RSA_ML-DSA Dual',
          migration_difficulty: 'MEDIUM',
          estimated_cost_inr: '₹4.2 Lakh',
          priority: 'P0'
        }
      },
      {
        id: 'node-crypto-ecc',
        label: 'ECDSA P-256 / ECDH',
        type: 'crypto',
        category: 'Asymmetric Primitive',
        status: 'high',
        x: 450,
        y: 300,
        details: {
          algorithm: 'ECDSA / ECDH',
          usage: 'Key Agreement & TLS Handshakes',
          quantum_status: 'Vulnerable',
          data_sensitivity: 'Critical',
          data_lifetime_years: 20,
          migration_time_years: 2,
          hndl_risk: 'HIGH',
          business_criticality: 'HIGH',
          recommended_pqc: 'ML-KEM-768 / ML-DSA-65',
          hybrid_candidate: 'Hybrid X25519 + Kyber768',
          migration_difficulty: 'MEDIUM',
          estimated_cost_inr: '₹3.5 Lakh',
          priority: 'P1'
        }
      },
      {
        id: 'node-crypto-aes',
        label: 'AES-256-GCM',
        type: 'crypto',
        category: 'Symmetric AEAD Primitive',
        status: 'safe',
        x: 720,
        y: 300,
        details: {
          algorithm: 'AES-256-GCM',
          usage: 'Data at Rest & Message AEAD',
          quantum_status: 'Resistant',
          data_sensitivity: 'High',
          data_lifetime_years: 30,
          migration_time_years: 0,
          hndl_risk: 'LOW',
          business_criticality: 'CRITICAL',
          recommended_pqc: 'Retain AES-256 (Grover Halving = 128-bit)',
          hybrid_candidate: 'None needed (Quantum Safe)',
          migration_difficulty: 'LOW',
          estimated_cost_inr: '₹0',
          priority: 'P3'
        }
      },
      // Quantum Threat Horizon
      {
        id: 'node-threat-shor',
        label: 'CRQC Shor\'s Algorithm Threat',
        type: 'quantum_threat',
        category: 'Quantum Threat Vector',
        status: 'critical',
        x: 300,
        y: 440,
        details: {
          algorithm: 'Polynomial Time Discrete Log & Factoring',
          usage: 'Breaks all RSA, ECC, DH, DSA key exchanges and signatures',
          quantum_status: 'Vulnerable',
          data_sensitivity: 'Critical',
          data_lifetime_years: 25,
          migration_time_years: 5,
          hndl_risk: 'CRITICAL',
          business_criticality: 'CRITICAL',
          recommended_pqc: 'NIST FIPS 203 (ML-KEM) & FIPS 204 (ML-DSA)',
          hybrid_candidate: 'Immediate Hybrid Key Exchange Deployment',
          migration_difficulty: 'HIGH',
          estimated_cost_inr: '₹8.4 Lakh',
          priority: 'P0'
        }
      },
      // PQC Solutions Tier
      {
        id: 'node-pqc-mlkem',
        label: 'ML-KEM-768 (FIPS 203)',
        type: 'pqc_solution',
        category: 'Post-Quantum KEM',
        status: 'pqc_ready',
        x: 180,
        y: 570,
        details: {
          algorithm: 'ML-KEM-768 (Module-Lattice KEM)',
          usage: 'Key Encapsulation & TLS 1.3 Key Exchange',
          key_size: '1184-byte Public Key',
          quantum_status: 'Resistant',
          data_sensitivity: 'Critical',
          data_lifetime_years: 50,
          migration_time_years: 2,
          hndl_risk: 'LOW',
          business_criticality: 'CRITICAL',
          recommended_pqc: 'NIST Final Standard FIPS 203',
          hybrid_candidate: 'X25519 + ML-KEM-768 (draft-ietf-tls-hybrid)',
          migration_difficulty: 'LOW',
          estimated_cost_inr: '₹2.8 Lakh',
          priority: 'P0'
        }
      },
      {
        id: 'node-pqc-mldsa',
        label: 'ML-DSA-65 (FIPS 204)',
        type: 'pqc_solution',
        category: 'Post-Quantum Signature',
        status: 'pqc_ready',
        x: 450,
        y: 570,
        details: {
          algorithm: 'ML-DSA-65 (Dilithium)',
          usage: 'Digital Signatures, PKI Certificates, Code Signing',
          key_size: '1952-byte Public Key',
          quantum_status: 'Resistant',
          data_sensitivity: 'Critical',
          data_lifetime_years: 50,
          migration_time_years: 3,
          hndl_risk: 'LOW',
          business_criticality: 'CRITICAL',
          recommended_pqc: 'NIST Final Standard FIPS 204',
          hybrid_candidate: 'Dual Cert / Composite Signature',
          migration_difficulty: 'MEDIUM',
          estimated_cost_inr: '₹3.6 Lakh',
          priority: 'P1'
        }
      },
      {
        id: 'node-pqc-slhdsa',
        label: 'SLH-DSA (FIPS 205) / HQC',
        type: 'pqc_solution',
        category: 'Stateless Hash Signature & KEM',
        status: 'pqc_ready',
        x: 720,
        y: 570,
        details: {
          algorithm: 'SLH-DSA-128 (SPHINCS+) & HQC',
          usage: 'Long-term Firmwares, Conservative Backups, Round 4 KEM',
          quantum_status: 'Resistant',
          data_sensitivity: 'Critical',
          data_lifetime_years: 50,
          migration_time_years: 2,
          hndl_risk: 'LOW',
          business_criticality: 'HIGH',
          recommended_pqc: 'NIST FIPS 205 Standard',
          hybrid_candidate: 'SLH-DSA for Code Signing',
          migration_difficulty: 'MEDIUM',
          estimated_cost_inr: '₹2.0 Lakh',
          priority: 'P2'
        }
      }
    ];

    const edges: DigitalTwinEdge[] = [
      // Enterprise to Apps
      { id: 'e1', source: 'node-ent', target: 'node-app-payment', label: 'Protects Cards', animated: true, color: '#f43f5e' },
      { id: 'e2', source: 'node-ent', target: 'node-app-gov', label: 'Citizen e-ID', animated: true, color: '#f97316' },
      { id: 'e3', source: 'node-ent', target: 'node-app-cryptotalk', label: 'E2EE Comms', animated: false, color: '#10b981' },
      
      // Apps to Crypto Primitives
      { id: 'e4', source: 'node-app-payment', target: 'node-crypto-rsa', label: 'Uses RSA-2048', animated: true, color: '#f43f5e' },
      { id: 'e5', source: 'node-app-gov', target: 'node-crypto-ecc', label: 'Uses ECDSA', animated: true, color: '#f97316' },
      { id: 'e6', source: 'node-app-cryptotalk', target: 'node-crypto-aes', label: 'Uses AES-256', animated: false, color: '#10b981' },

      // Crypto Primitives to Quantum Threat
      { id: 'e7', source: 'node-crypto-rsa', target: 'node-threat-shor', label: 'Shor Factoring (Broken)', animated: true, color: '#f43f5e' },
      { id: 'e8', source: 'node-crypto-ecc', target: 'node-threat-shor', label: 'Discrete Log (Broken)', animated: true, color: '#f43f5e' },

      // Threat to PQC Solutions
      { id: 'e9', source: 'node-threat-shor', target: 'node-pqc-mlkem', label: 'Migrate Key Exchange', animated: true, color: '#a855f7' },
      { id: 'e10', source: 'node-threat-shor', target: 'node-pqc-mldsa', label: 'Migrate Signatures', animated: true, color: '#a855f7' },
      { id: 'e11', source: 'node-threat-shor', target: 'node-pqc-slhdsa', label: 'Firmware & Hash PQC', animated: false, color: '#06b6d4' }
    ];

    return {
      nodes,
      edges,
      summary: {
        total_nodes: nodes.length,
        vulnerable_nodes: nodes.filter(n => n.status === 'critical' || n.status === 'high').length,
        pqc_ready_nodes: nodes.filter(n => n.status === 'pqc_ready' || n.status === 'safe').length,
        highest_risk_node: 'Payment Tokenization API (RSA-2048 / HNDL Critical)',
        overall_posture: 'Elevated Quantum Exposure — Immediate Hybrid KEM Migration Required'
      }
    };
  }

  // ── PQC Benchmark Suite Telemetry (FIPS 203, 204, 205, HQC) ──
  public getPQCBenchmarks(): PQCBenchmarkItem[] {
    return [
      {
        algorithm: 'ML-KEM-512',
        type: 'KEM',
        standard: 'FIPS 203',
        security_category: 1, // AES-128 equivalent
        public_key_bytes: 800,
        ciphertext_or_sig_bytes: 768,
        secret_key_bytes: 1632,
        keygen_cpu_cycles_k: 28,
        encaps_or_sign_cpu_cycles_k: 34,
        decaps_or_verify_cpu_cycles_k: 32,
        estimated_latency_ms: 0.04,
        memory_peak_kb: 4.8,
        status: 'Standardized'
      },
      {
        algorithm: 'ML-KEM-768 (Recommended Default)',
        type: 'KEM',
        standard: 'FIPS 203',
        security_category: 3, // AES-192 equivalent
        public_key_bytes: 1184,
        ciphertext_or_sig_bytes: 1088,
        secret_key_bytes: 2400,
        keygen_cpu_cycles_k: 46,
        encaps_or_sign_cpu_cycles_k: 53,
        decaps_or_verify_cpu_cycles_k: 49,
        estimated_latency_ms: 0.06,
        memory_peak_kb: 6.2,
        status: 'Standardized'
      },
      {
        algorithm: 'ML-KEM-1024',
        type: 'KEM',
        standard: 'FIPS 203',
        security_category: 5, // AES-256 equivalent
        public_key_bytes: 1568,
        ciphertext_or_sig_bytes: 1568,
        secret_key_bytes: 3168,
        keygen_cpu_cycles_k: 68,
        encaps_or_sign_cpu_cycles_k: 79,
        decaps_or_verify_cpu_cycles_k: 73,
        estimated_latency_ms: 0.09,
        memory_peak_kb: 8.1,
        status: 'Standardized'
      },
      {
        algorithm: 'ML-DSA-44',
        type: 'Signature',
        standard: 'FIPS 204',
        security_category: 2,
        public_key_bytes: 1312,
        ciphertext_or_sig_bytes: 2420,
        secret_key_bytes: 2560,
        keygen_cpu_cycles_k: 72,
        encaps_or_sign_cpu_cycles_k: 240,
        decaps_or_verify_cpu_cycles_k: 92,
        estimated_latency_ms: 0.28,
        memory_peak_kb: 14.5,
        status: 'Standardized'
      },
      {
        algorithm: 'ML-DSA-65 (Recommended Default)',
        type: 'Signature',
        standard: 'FIPS 204',
        security_category: 3,
        public_key_bytes: 1952,
        ciphertext_or_sig_bytes: 3309,
        secret_key_bytes: 4032,
        keygen_cpu_cycles_k: 125,
        encaps_or_sign_cpu_cycles_k: 410,
        decaps_or_verify_cpu_cycles_k: 155,
        estimated_latency_ms: 0.48,
        memory_peak_kb: 22.0,
        status: 'Standardized'
      },
      {
        algorithm: 'SLH-DSA-128s (Stateless Hash)',
        type: 'Signature',
        standard: 'FIPS 205',
        security_category: 1,
        public_key_bytes: 32,
        ciphertext_or_sig_bytes: 7856,
        secret_key_bytes: 64,
        keygen_cpu_cycles_k: 1250,
        encaps_or_sign_cpu_cycles_k: 18400,
        decaps_or_verify_cpu_cycles_k: 1420,
        estimated_latency_ms: 18.2,
        memory_peak_kb: 36.4,
        status: 'Standardized'
      },
      {
        algorithm: 'HQC-128 (Hamming Quasi-Cyclic)',
        type: 'KEM',
        standard: 'NIST Selected Round 4',
        security_category: 1,
        public_key_bytes: 2249,
        ciphertext_or_sig_bytes: 4497,
        secret_key_bytes: 2289,
        keygen_cpu_cycles_k: 110,
        encaps_or_sign_cpu_cycles_k: 195,
        decaps_or_verify_cpu_cycles_k: 280,
        estimated_latency_ms: 0.32,
        memory_peak_kb: 12.0,
        status: 'Selected'
      }
    ];
  }

  // ── Classical vs Post-Quantum Strength Matrix ────────────────
  public getCryptoStrengthMatrix(): CryptoStrengthMatrixItem[] {
    return [
      {
        primitive: 'RSA-1024',
        family: 'RSA Asymmetric',
        classical_status: 'Broken',
        quantum_status: 'Broken',
        nist_standard_ref: 'NIST SP 800-131A (Disallowed since 2013)',
        recommended_pqc_alternative: 'ML-KEM-768 / ML-DSA-65',
        urgency: 'P0'
      },
      {
        primitive: 'RSA-2048',
        family: 'RSA Asymmetric',
        classical_status: 'Acceptable (Legacy)',
        quantum_status: 'Quantum Vulnerable (Shor)',
        nist_standard_ref: 'NIST SP 800-57 Part 1 (112-bit security)',
        recommended_pqc_alternative: 'ML-KEM-768 / ML-DSA-65',
        urgency: 'P1'
      },
      {
        primitive: 'ECDSA (P-256) / ECDH',
        family: 'Elliptic Curve',
        classical_status: 'Secure',
        quantum_status: 'Quantum Vulnerable (Shor)',
        nist_standard_ref: 'FIPS 186-5',
        recommended_pqc_alternative: 'Hybrid X25519 + ML-KEM-768',
        urgency: 'P1'
      },
      {
        primitive: 'AES-128',
        family: 'Symmetric Block',
        classical_status: 'Secure',
        quantum_status: 'Quantum Halved (Grover)',
        nist_standard_ref: 'FIPS 197',
        recommended_pqc_alternative: 'Upgrade to AES-256 for 128-bit quantum margin',
        urgency: 'P2'
      },
      {
        primitive: 'AES-256-GCM',
        family: 'Symmetric AEAD',
        classical_status: 'Secure',
        quantum_status: 'Quantum Resistant',
        nist_standard_ref: 'NIST SP 800-38D (128-bit quantum strength)',
        recommended_pqc_alternative: 'Retain AES-256 (Compliant)',
        urgency: 'Compliant'
      },
      {
        primitive: 'SHA-1',
        family: 'Hash Function',
        classical_status: 'Broken',
        quantum_status: 'Broken',
        nist_standard_ref: 'NIST SP 800-131A Rev 2',
        recommended_pqc_alternative: 'SHA-256 / SHA3-256 / SHAKE-256',
        urgency: 'P0'
      },
      {
        primitive: 'MD5',
        family: 'Hash Function',
        classical_status: 'Broken',
        quantum_status: 'Broken',
        nist_standard_ref: 'RFC 6151 / Prohibited',
        recommended_pqc_alternative: 'SHA-256 / Argon2id',
        urgency: 'P0'
      }
    ];
  }

  // ── Harvest Now Decrypt Later (HNDL) Records ─────────────────
  public getHNDLRiskRecords(): HNDLRiskRecord[] {
    return [
      {
        id: 'hndl-01',
        asset_name: 'Central Patient Health Record (EHR) DB',
        data_classification: 'Protected Health Information (PHI/Genomics)',
        algorithm: 'RSA-2048 TLS Transfer',
        key_size: 2048,
        data_retention_years: 30,
        estimated_migration_years: 4,
        hndl_threat_score: 95,
        hndl_status: 'CRITICAL',
        recommended_immediate_action: 'Deploy hybrid TLS (X25519+ML-KEM-768) on EHR ingress gateway to prevent encrypted session packet capture.'
      },
      {
        id: 'hndl-02',
        asset_name: 'National Citizen Identity & Auth Portal',
        data_classification: 'Government Classified Citizen Biometrics',
        algorithm: 'ECDSA-P256 Auth & RSA-2048 Signatures',
        key_size: 2048,
        data_retention_years: 25,
        estimated_migration_years: 3,
        hndl_threat_score: 88,
        hndl_status: 'CRITICAL',
        recommended_immediate_action: 'Transition e-ID tokens to ML-DSA-65 (FIPS 204) and enforce post-quantum session tunneling.'
      },
      {
        id: 'hndl-03',
        asset_name: 'Payment Tokenization API',
        data_classification: 'PCI-DSS Financial Cardholder Records',
        algorithm: 'RSA-2048 Key Exchange',
        key_size: 2048,
        data_retention_years: 10,
        estimated_migration_years: 2,
        hndl_threat_score: 72,
        hndl_status: 'HIGH',
        recommended_immediate_action: 'Upgrade payment transit encryption from RSA to ML-KEM-768 key encapsulation.'
      }
    ];
  }
}

export const store = new DataStore();
