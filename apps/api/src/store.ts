import { v4 as uuidv4 } from 'uuid';
import {
  Organization,
  UserMember,
  Asset,
  Scan,
  CryptoFinding,
  CryptoBOMComponent,
  CertificateEntry,
  AssessmentReport,
  AuditLogEntry
} from './types.js';

class DataStore {
  public organizations: Map<string, Organization> = new Map();
  public members: Map<string, UserMember> = new Map();
  public assets: Map<string, Asset> = new Map();
  public scans: Map<string, Scan> = new Map();
  public findings: Map<string, CryptoFinding> = new Map();
  public components: Map<string, CryptoBOMComponent> = new Map();
  public certificates: Map<string, CertificateEntry> = new Map();
  public reports: Map<string, AssessmentReport> = new Map();
  public auditLogs: AuditLogEntry[] = [];

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

    // Asset 1: CryptoTalk (Secure Reference App)
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
      tags: ['mobile', 'e2ee', 'android', 'messaging', 'reference-app'],
      is_demo: true,
      authorization_confirmed: true,
      last_scanned_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.assets.set(cryptoTalkAsset.id, cryptoTalkAsset);

    // Asset 2: Legacy Banking API
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
      tags: ['api', 'banking', 'legacy', 'pci-scope'],
      is_demo: true,
      authorization_confirmed: true,
      last_scanned_at: new Date(Date.now() - 5 * 3600000).toISOString(),
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.assets.set(legacyBankingAsset.id, legacyBankingAsset);

    // Asset 3: Government Employee Portal
    const govPortalAsset: Asset = {
      id: 'd0000000-0000-0000-0000-000000000003',
      organization_id: orgId,
      name: 'Government Employee Portal',
      description: 'Internal identity, authentication, and HR management portal.',
      type: 'web_app',
      url: 'https://portal.mahadoc.gov.in',
      owner: 'E-Governance Team',
      environment: 'production',
      criticality: 'high',
      exposure: 'internal',
      tags: ['portal', 'e-gov', 'auth', 'sso'],
      is_demo: true,
      authorization_confirmed: true,
      last_scanned_at: new Date(Date.now() - 24 * 3600000).toISOString(),
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.assets.set(govPortalAsset.id, govPortalAsset);

    // Seed Scan & Findings for CryptoTalk
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
      overall_security_score: 100,
      pqc_readiness_score: 75,
      is_demo: true,
      logs: [
        { timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), message: 'Archive extracted safely', level: 'info' },
        { timestamp: new Date(Date.now() - 2 * 3600000 + 1000).toISOString(), message: 'Multi-layer AST discovery running', level: 'info' },
        { timestamp: new Date(Date.now() - 2 * 3600000 + 2000).toISOString(), message: 'AES-GCM, ECDH, Keystore identified', level: 'info' },
        { timestamp: new Date(Date.now() - 2 * 3600000 + 3000).toISOString(), message: 'Deterministic risk engine executed: Score 100/100', level: 'info' }
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
      algorithm: 'AES',
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

    this.components.set(uuidv4(), {
      id: uuidv4(),
      scan_id: cryptoTalkScanId,
      asset_id: cryptoTalkAsset.id,
      asset_name: cryptoTalkAsset.name,
      organization_id: orgId,
      component_name: 'Hardware Key Protection',
      algorithm: 'Android Keystore StrongBox',
      category: 'Hardware Security',
      purpose: 'Hardware-Isolated Master Key Storage',
      location: 'CryptoTalkManager.java:55',
      key_size_or_curve: 'TEE / Secure Element',
      security_status: 'Recommended',
      pqc_relevance: 'Hardware Enclave Bound',
      is_quantum_safe: true,
      risk_level: 'Informational',
      evidence: 'KeyStore.getInstance("AndroidKeyStore")',
      created_at: new Date().toISOString()
    });

    // Seed Scan & Findings for Legacy Banking API
    const legacyScanId = 's0000000-0000-0000-0000-000000000002';
    const legacyScan: Scan = {
      id: legacyScanId,
      organization_id: orgId,
      asset_id: legacyBankingAsset.id,
      asset_name: legacyBankingAsset.name,
      scan_type: 'source_code',
      status: 'completed',
      progress_percentage: 100,
      current_step: 'Scan completed',
      target_identifier: 'legacy-banking-core.zip',
      total_files_analyzed: 28,
      total_findings_count: 5,
      critical_count: 2,
      high_count: 3,
      medium_count: 0,
      low_count: 0,
      info_count: 0,
      overall_security_score: 35,
      pqc_readiness_score: 20,
      is_demo: true,
      logs: [
        { timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), message: 'Scan started on legacy banking service', level: 'info' },
        { timestamp: new Date(Date.now() - 5 * 3600000 + 1000).toISOString(), message: 'WARNING: RSA-1024 detected', level: 'warn' },
        { timestamp: new Date(Date.now() - 5 * 3600000 + 2000).toISOString(), message: 'CRITICAL: MD5 and SHA-1 hashes detected in authentication flows', level: 'error' },
        { timestamp: new Date(Date.now() - 5 * 3600000 + 3000).toISOString(), message: 'HIGH: 3DES encryption and AES-ECB mode identified', level: 'error' }
      ],
      started_at: new Date(Date.now() - 5 * 3600000).toISOString(),
      completed_at: new Date(Date.now() - 5 * 3600000 + 4000).toISOString(),
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
      rule_id: 'JAVA-KEYGEN-RSA-1024',
      title: 'Obsolete RSA-1024 Key Size Detected',
      description: 'RSA key size of 1024 bits provides under 80 bits of cryptographic strength and is practically factorable with modern distributed hardware.',
      category: 'Asymmetric / Public Key',
      algorithm: 'RSA',
      key_size: 1024,
      key_size_str: '1024',
      file_path: 'LegacyTransactionHandler.java',
      line_number: 30,
      code_snippet_redacted: 'rsaGen.initialize(1024); rsaGen.generateKeyPair();',
      api_reference: 'java.security.KeyPairGenerator',
      language: 'java',
      severity: 'critical',
      confidence: 'high',
      status: 'open',
      quantum_vulnerable: true,
      pqc_priority: 'immediate',
      remediation_deterministic: 'Upgrade immediately to RSA-3072 or ECDSA (P-256) classically; begin PQC migration evaluation (ML-DSA / FIPS 204).',
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
      rule_id: 'JAVA-DIGEST-MD5',
      title: 'Insecure MD5 Hash Used in Checksums',
      description: 'MD5 is vulnerable to collision attacks and cannot be trusted for cryptographic validation or integrity verification.',
      category: 'Cryptographic Hash',
      algorithm: 'MD5',
      digest_size: 128,
      file_path: 'LegacyTransactionHandler.java',
      line_number: 43,
      code_snippet_redacted: 'MessageDigest md5 = MessageDigest.getInstance("MD5");',
      api_reference: 'java.security.MessageDigest',
      language: 'java',
      severity: 'critical',
      confidence: 'high',
      status: 'open',
      quantum_vulnerable: false,
      pqc_priority: 'immediate',
      remediation_deterministic: 'Replace with SHA-256 for data integrity or Argon2id/PBKDF2 for password hashing.',
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
      rule_id: 'JAVA-CIPHER-DES-3DES',
      title: 'Deprecated 3DES (Triple DES) Cipher in Use',
      description: 'Triple-DES uses a 64-bit block size vulnerable to Sweet32 collision attacks (CVE-2016-2183) and is prohibited by NIST SP 800-131A Rev 2.',
      category: 'Symmetric Encryption',
      algorithm: '3DES',
      mode: 'CBC',
      file_path: 'LegacyTransactionHandler.java',
      line_number: 24,
      code_snippet_redacted: 'Cipher desCipher = Cipher.getInstance("DESede/CBC/PKCS5Padding");',
      api_reference: 'javax.crypto.Cipher',
      language: 'java',
      severity: 'high',
      confidence: 'high',
      status: 'open',
      quantum_vulnerable: false,
      pqc_priority: 'immediate',
      remediation_deterministic: 'Migrate card PIN and account data encryption to AES-256-GCM.',
      is_demo: true,
      created_at: new Date().toISOString()
    };
    this.findings.set(legFinding3.id, legFinding3);

    const legFinding4: CryptoFinding = {
      id: uuidv4(),
      scan_id: legacyScanId,
      asset_id: legacyBankingAsset.id,
      asset_name: legacyBankingAsset.name,
      organization_id: orgId,
      rule_id: 'JAVA-CIPHER-AES-ECB',
      title: 'Insecure AES-ECB Mode in Account Storage',
      description: 'Electronic Codebook (ECB) mode fails to conceal data patterns, encrypting repeated blocks to identical ciphertext.',
      category: 'Symmetric Encryption',
      algorithm: 'AES',
      mode: 'ECB',
      file_path: 'LegacyTransactionHandler.java',
      line_number: 17,
      code_snippet_redacted: 'Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");',
      api_reference: 'javax.crypto.Cipher',
      language: 'java',
      severity: 'high',
      confidence: 'high',
      status: 'open',
      quantum_vulnerable: false,
      pqc_priority: 'immediate',
      remediation_deterministic: 'Switch to AES-256-GCM with distinct IVs.',
      is_demo: true,
      created_at: new Date().toISOString()
    };
    this.findings.set(legFinding4.id, legFinding4);

    const legFinding5: CryptoFinding = {
      id: uuidv4(),
      scan_id: legacyScanId,
      asset_id: legacyBankingAsset.id,
      asset_name: legacyBankingAsset.name,
      organization_id: orgId,
      rule_id: 'JAVA-DIGEST-SHA1',
      title: 'Deprecated SHA-1 in Audit Signatures',
      description: 'SHA-1 collision resistance is broken. Prohibited by PCI-DSS and NIST.',
      category: 'Cryptographic Hash',
      algorithm: 'SHA-1',
      digest_size: 160,
      file_path: 'LegacyTransactionHandler.java',
      line_number: 37,
      code_snippet_redacted: 'MessageDigest sha1 = MessageDigest.getInstance("SHA-1");',
      api_reference: 'java.security.MessageDigest',
      language: 'java',
      severity: 'high',
      confidence: 'high',
      status: 'open',
      quantum_vulnerable: false,
      pqc_priority: 'immediate',
      remediation_deterministic: 'Replace with SHA-256 or SHA-384.',
      is_demo: true,
      created_at: new Date().toISOString()
    };
    this.findings.set(legFinding5.id, legFinding5);

    // Certificates
    const cert1: CertificateEntry = {
      id: uuidv4(),
      organization_id: orgId,
      asset_id: cryptoTalkAsset.id,
      endpoint: 'https://cryptotalk.internal',
      tls_version: 'TLSv1.3',
      cipher_suite: 'TLS_AES_256_GCM_SHA384',
      subject: 'CN=cryptotalk.internal, O=CryptoTalk Secure Network, C=IN',
      issuer: 'CN=GlobalSign TLS ECC CA, O=GlobalSign, C=US',
      valid_from: new Date(Date.now() - 30 * 86400000).toISOString(),
      valid_until: new Date(Date.now() + 335 * 86400000).toISOString(),
      days_until_expiry: 335,
      public_key_algorithm: 'ECDSA',
      public_key_size: 256,
      signature_algorithm: 'ecdsa-with-SHA384',
      sans: ['cryptotalk.internal', 'api.cryptotalk.internal'],
      chain_status: 'valid',
      health_status: 'healthy',
      is_demo: true,
      created_at: new Date().toISOString()
    };
    this.certificates.set(cert1.id, cert1);

    const cert2: CertificateEntry = {
      id: uuidv4(),
      organization_id: orgId,
      asset_id: legacyBankingAsset.id,
      endpoint: 'https://api.legacybanking.internal',
      tls_version: 'TLSv1.0',
      cipher_suite: 'TLS_RSA_WITH_3DES_EDE_CBC_SHA',
      subject: 'CN=api.legacybanking.internal, O=Legacy Financial Corp, C=IN',
      issuer: 'CN=Legacy CA Intermediate, O=Legacy Financial Corp, C=IN',
      valid_from: new Date(Date.now() - 700 * 86400000).toISOString(),
      valid_until: new Date(Date.now() - 15 * 86400000).toISOString(),
      days_until_expiry: -15,
      public_key_algorithm: 'RSA',
      public_key_size: 1024,
      signature_algorithm: 'sha1WithRSAEncryption',
      sans: ['api.legacybanking.internal'],
      chain_status: 'untrusted_or_expired',
      health_status: 'expired',
      is_demo: true,
      created_at: new Date().toISOString()
    };
    this.certificates.set(cert2.id, cert2);

    // Initial Audit Log
    this.addAuditLog(
      'admin@cryptotool.internal',
      'INITIALIZE_DATASTORE',
      'system',
      orgId,
      { status: 'Initialized demo tenants and cryptographic reference datasets for SIH26164' }
    );
  }

  public addAuditLog(userEmail: string, action: string, resourceType: string, resourceId: string, details: any = {}) {
    const log: AuditLogEntry = {
      id: uuidv4(),
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      user_email: userEmail,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
  }
}

export const store = new DataStore();
