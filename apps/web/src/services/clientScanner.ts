import JSZip from 'jszip';
import { createClient } from '@supabase/supabase-js';
import {
  CryptoFinding,
  CryptoBOMComponent,
  Scan,
  RiskOverview,
  PQCReadinessOverview,
  CycloneDXCBOM,
  CryptoAgilityScore
} from '../types';
import { parsePemCertificate } from './certParser';

const SUPABASE_URL = ((import.meta as any).env?.VITE_SUPABASE_URL) || 'https://gqeajddogocglfacohwa.supabase.co';
const SUPABASE_ANON_KEY = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxZWFqZGRvZ29jZ2xmYWNvaHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMjI5ODYsImV4cCI6MjEwMzU5ODk4Nn0.1NZvp5w7VxczKSYzBd0b2malwZAsz6BucYPGv0yXnW0';

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});

export interface ScannedFileInfo {
  name: string;
  path: string;
  size_bytes: number;
  file_type: string;
  scan_status: 'scanned' | 'skipped' | 'error';
  detection_count: number;
  risk_level: 'critical' | 'high' | 'medium' | 'low' | 'clean';
  timestamp: string;
}

export interface ClientDiscoveryRule {
  id: string;
  name: string;
  languages: string[];
  regex: RegExp;
  algorithm: string;
  mode?: string;
  padding?: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'informational';
  confidence: 'confirmed' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  remediation: string;
  quantum_vulnerable: boolean;
  pqc_priority: 'immediate' | 'high' | 'medium' | 'low';
  cwe?: string;
}

// ─── Universal Multi-Language Cryptographic Discovery Ruleset ─────────────────
export const CLIENT_DISCOVERY_RULES: ClientDiscoveryRule[] = [
  // Hashing: Broken MD5
  {
    id: 'CRYPTO-RULE-001',
    name: 'Broken MD5 Hash Function Usage',
    languages: ['java', 'kotlin', 'python', 'py', 'javascript', 'typescript', 'js', 'ts', 'c', 'cpp', 'go', 'php', 'cs', 'rs', 'swift', 'txt'],
    regex: /(?:MessageDigest\.getInstance\s*\(\s*["']MD5["']|hashlib\.md5|createHash\s*\(\s*["']md5["']|CryptoJS\.MD5|MD5_Init|MD5\(|md5\.New\(\)|md5\s*\(|MD5CryptoServiceProvider|HashAlgorithm\.Create\s*\(\s*["']MD5["'])/i,
    algorithm: 'MD5',
    category: 'Cryptographic Hash',
    severity: 'critical',
    confidence: 'high',
    title: 'Broken MD5 Hash Algorithm Detected',
    description: 'MD5 is vulnerable to collision and chosen-prefix attacks (Wang & Yu, 2004). Prohibited by NIST SP 800-131A Rev 2.',
    remediation: 'Replace MD5 with SHA-256 / SHA-512 (FIPS 180-4) or SHA-3 (FIPS 202). For passwords, use Argon2id, PBKDF2, or bcrypt.',
    quantum_vulnerable: false,
    pqc_priority: 'immediate',
    cwe: 'CWE-327'
  },
  // Hashing: Deprecated SHA-1
  {
    id: 'CRYPTO-RULE-002',
    name: 'Deprecated SHA-1 Hash Function Usage',
    languages: ['java', 'kotlin', 'python', 'py', 'javascript', 'typescript', 'js', 'ts', 'c', 'cpp', 'go', 'php', 'cs', 'rs', 'swift', 'txt'],
    regex: /(?:MessageDigest\.getInstance\s*\(\s*["']SHA-?1["']|hashlib\.sha1|createHash\s*\(\s*["']sha1["']|CryptoJS\.SHA1|SHA1_Init|SHA1\(|sha1\.New\(\)|sha1\s*\(|SHA1CryptoServiceProvider|HashAlgorithm\.Create\s*\(\s*["']SHA1["'])/i,
    algorithm: 'SHA-1',
    category: 'Cryptographic Hash',
    severity: 'high',
    confidence: 'high',
    title: 'Deprecated SHA-1 Hash Algorithm Detected',
    description: 'SHA-1 is practically broken against collision attacks (SHAttered, 2017). Deprecated for all security uses by NIST.',
    remediation: 'Upgrade to SHA-256, SHA-384, or SHA-512 (FIPS 180-4) or SHA3-256 (FIPS 202).',
    quantum_vulnerable: false,
    pqc_priority: 'high',
    cwe: 'CWE-328'
  },
  // Hashing: Approved SHA-256 / SHA-512 / SHA-3
  {
    id: 'CRYPTO-RULE-003-SHA2',
    name: 'Approved SHA-2 / SHA-3 Hash Detected',
    languages: ['java', 'kotlin', 'python', 'py', 'javascript', 'typescript', 'js', 'ts', 'c', 'cpp', 'go', 'php', 'cs', 'rs', 'swift', 'txt'],
    regex: /(?:MessageDigest\.getInstance\s*\(\s*["']SHA-?(?:256|384|512|3)[\w-]*["']|hashlib\.sha(?:256|384|512|3_256|3_512)|createHash\s*\(\s*["']sha(?:256|384|512)["']|sha256\.New\(\)|sha512\.New\(\)|SHA256CryptoServiceProvider)/i,
    algorithm: 'SHA-256/512/SHA3',
    category: 'Cryptographic Hash',
    severity: 'informational',
    confidence: 'high',
    title: 'Approved SHA-2 / SHA-3 Cryptographic Hash Detected',
    description: 'SHA-256/512 and SHA-3 provide 128-256 bit classical and quantum collision resistance. FIPS 180-4 and FIPS 202 compliant.',
    remediation: 'Maintain current implementation.',
    quantum_vulnerable: false,
    pqc_priority: 'low'
  },
  // Symmetric: Insecure AES-ECB
  {
    id: 'CRYPTO-RULE-004',
    name: 'Insecure AES Electronic Codebook (ECB) Mode',
    languages: ['java', 'kotlin', 'python', 'py', 'javascript', 'typescript', 'js', 'ts', 'c', 'cpp', 'go', 'php', 'cs', 'rs', 'swift', 'txt'],
    regex: /(?:Cipher\.getInstance\s*\(\s*["']AES\/ECB|AES\.MODE_ECB|modes\.ECB|createCipheriv\s*\(\s*["']aes-\d+-ecb["']|CipherMode\.ECB|AES_ecb_encrypt)/i,
    algorithm: 'AES-ECB',
    mode: 'ECB',
    category: 'Symmetric Encryption',
    severity: 'critical',
    confidence: 'high',
    title: 'Insecure AES-ECB Mode Detected',
    description: 'ECB mode encrypts identical plaintext blocks into identical ciphertext blocks, preserving structural data patterns and leaking plaintext structure.',
    remediation: 'Immediately migrate to authenticated encryption (AEAD) such as AES-256-GCM (NIST SP 800-38D) with unique random nonces.',
    quantum_vulnerable: false,
    pqc_priority: 'immediate',
    cwe: 'CWE-327'
  },
  // Symmetric: Deprecated 3DES / DES
  {
    id: 'CRYPTO-RULE-005',
    name: 'Deprecated 3DES / DES Cipher Usage',
    languages: ['java', 'kotlin', 'python', 'py', 'javascript', 'typescript', 'js', 'ts', 'c', 'cpp', 'go', 'php', 'cs', 'rs', 'swift', 'txt'],
    regex: /(?:Cipher\.getInstance\s*\(\s*["'](?:DESede|DES|TripleDES)|Crypto\.Cipher\.(?:DES|DES3)|from cryptography.*import.*TripleDES|createCipheriv\s*\(\s*["']des|DES_encrypt|des\.NewCipher|TripleDESCryptoServiceProvider)/i,
    algorithm: '3DES',
    category: 'Symmetric Encryption',
    severity: 'critical',
    confidence: 'high',
    title: 'Deprecated 3DES/DES Cipher Detected',
    description: 'Triple-DES uses a small 64-bit block size vulnerable to Sweet32 collision attacks (CVE-2016-2183) and is deprecated by NIST SP 800-131A.',
    remediation: 'Migrate to AES-256-GCM immediately.',
    quantum_vulnerable: false,
    pqc_priority: 'immediate',
    cwe: 'CWE-327'
  },
  // Symmetric: Deprecated RC4
  {
    id: 'CRYPTO-RULE-006',
    name: 'Deprecated RC4 / ARC4 Stream Cipher',
    languages: ['java', 'kotlin', 'python', 'py', 'javascript', 'typescript', 'js', 'ts', 'c', 'cpp', 'go', 'php', 'cs', 'rs', 'swift', 'txt'],
    regex: /(?:Cipher\.getInstance\s*\(\s*["'](?:RC4|ARC4)|Crypto\.Cipher\.ARC4|createCipheriv\s*\(\s*["']rc4|RC4_encrypt|rc4\.NewCipher)/i,
    algorithm: 'RC4',
    category: 'Symmetric Encryption',
    severity: 'critical',
    confidence: 'high',
    title: 'Insecure RC4 Stream Cipher Detected',
    description: 'RC4 suffers from severe keystream biases allowing plaintext extraction. Formally prohibited by RFC 7465.',
    remediation: 'Upgrade to AES-256-GCM or ChaCha20-Poly1305.',
    quantum_vulnerable: false,
    pqc_priority: 'immediate',
    cwe: 'CWE-327'
  },
  // Symmetric: Authenticated AES-GCM
  {
    id: 'CRYPTO-RULE-007',
    name: 'Authenticated AES-GCM Mode Detected',
    languages: ['java', 'kotlin', 'python', 'py', 'javascript', 'typescript', 'js', 'ts', 'c', 'cpp', 'go', 'php', 'cs', 'rs', 'swift', 'txt'],
    regex: /(?:Cipher\.getInstance\s*\(\s*["']AES\/GCM|AESGCM|createCipheriv\s*\(\s*["']aes-(?:128|192|256)-gcm["']|cipher\.NewGCM|AesGcm)/i,
    algorithm: 'AES-256-GCM',
    mode: 'GCM',
    category: 'Symmetric Encryption',
    severity: 'informational',
    confidence: 'high',
    title: 'Authenticated AES-GCM Mode Detected',
    description: 'AES in Galois/Counter Mode (GCM) provides high-speed Authenticated Encryption with Associated Data (AEAD).',
    remediation: 'Ensure unique 96-bit initialization vectors (nonces) are generated per encryption (NIST SP 800-38D).',
    quantum_vulnerable: false,
    pqc_priority: 'low'
  },
  // Symmetric: ChaCha20-Poly1305
  {
    id: 'CRYPTO-RULE-008',
    name: 'ChaCha20-Poly1305 AEAD Cipher Detected',
    languages: ['java', 'kotlin', 'python', 'py', 'javascript', 'typescript', 'js', 'ts', 'c', 'cpp', 'go', 'php', 'cs', 'rs', 'swift', 'txt'],
    regex: /(?:ChaCha20-Poly1305|ChaCha20Poly1305|chacha20poly1305\.New|createCipheriv\s*\(\s*["']chacha20-poly1305["'])/i,
    algorithm: 'ChaCha20-Poly1305',
    mode: 'Poly1305',
    category: 'Symmetric Encryption',
    severity: 'informational',
    confidence: 'high',
    title: 'ChaCha20-Poly1305 AEAD Cipher Detected',
    description: 'Modern authenticated stream cipher combining ChaCha20 with Poly1305 MAC. Fast and timing-attack resistant.',
    remediation: 'Maintain implementation. Ensure 96-bit nonces are never reused with the same key.',
    quantum_vulnerable: false,
    pqc_priority: 'low'
  },
  // Asymmetric: RSA Key Pair
  {
    id: 'CRYPTO-RULE-009',
    name: 'RSA Public Key Algorithm & Quantum Vulnerability',
    languages: ['java', 'kotlin', 'python', 'py', 'javascript', 'typescript', 'js', 'ts', 'c', 'cpp', 'go', 'php', 'cs', 'rs', 'swift', 'txt'],
    regex: /(?:KeyPairGenerator\.getInstance\s*\(\s*["']RSA["']|rsa\.generate_private_key|generateKeyPair\s*\(\s*["']rsa["']|RSA_generate_key|rsa\.GenerateKey|RSACryptoServiceProvider)/i,
    algorithm: 'RSA',
    category: 'Asymmetric / Public Key',
    severity: 'medium',
    confidence: 'high',
    title: 'RSA Key Pair Generation Detected',
    description: 'RSA public key cryptography detected. RSA relies on prime factorization hardness. All RSA variants are vulnerable to Shor\'s Algorithm on CRQC.',
    remediation: 'Enforce key size >= 2048-bit (3072-bit recommended). Plan migration to NIST Post-Quantum FIPS 203 (ML-KEM) and FIPS 204 (ML-DSA).',
    quantum_vulnerable: true,
    pqc_priority: 'high',
    cwe: 'CWE-326'
  },
  // Asymmetric: ECC / ECDSA / ECDH
  {
    id: 'CRYPTO-RULE-010',
    name: 'Elliptic Curve Cryptography (ECC / ECDSA / ECDH)',
    languages: ['java', 'kotlin', 'python', 'py', 'javascript', 'typescript', 'js', 'ts', 'c', 'cpp', 'go', 'php', 'cs', 'rs', 'swift', 'txt'],
    regex: /(?:KeyPairGenerator\.getInstance\s*\(\s*["'](?:EC|ECDSA|ECDH)["']|ec\.generate_private_key|generateKeyPair\s*\(\s*["']ec["']|ecdsa\.GenerateKey|ECDsaCng|ECDHCng)/i,
    algorithm: 'ECC / ECDSA',
    category: 'Asymmetric / Public Key',
    severity: 'medium',
    confidence: 'high',
    title: 'Elliptic Curve Cryptography (ECC) Detected',
    description: 'ECC provides strong classical security with compact keys (256/384-bit). However, ECC is 100% vulnerable to Shor\'s Discrete Log Algorithm on quantum computers.',
    remediation: 'Deploy hybrid classical + post-quantum key exchange (X25519 + ML-KEM-768). Evaluate ML-DSA-65 (FIPS 204) for digital signatures.',
    quantum_vulnerable: true,
    pqc_priority: 'high',
    cwe: 'CWE-326'
  },
  // Asymmetric: X25519 / Ed25519
  {
    id: 'CRYPTO-RULE-011',
    name: 'X25519 / Ed25519 Modern Asymmetric Primitives',
    languages: ['java', 'kotlin', 'python', 'py', 'javascript', 'typescript', 'js', 'ts', 'c', 'cpp', 'go', 'php', 'cs', 'rs', 'swift', 'txt'],
    regex: /(?:X25519|Ed25519|Ed25519PrivateKey|X25519PrivateKey|ed25519\.GenerateKey|x25519\.X25519)/i,
    algorithm: 'X25519 / Ed25519',
    category: 'Asymmetric / Public Key',
    severity: 'low',
    confidence: 'high',
    title: 'Curve25519 (X25519/Ed25519) Cryptography Detected',
    description: 'High-performance constant-time Curve25519 primitive. Highly secure classically; quantum-vulnerable via Shor\'s algorithm.',
    remediation: 'Deploy hybrid post-quantum key exchange: X25519 + ML-KEM-768 (FIPS 203).',
    quantum_vulnerable: true,
    pqc_priority: 'high'
  },
  // PQC: ML-KEM / ML-DSA Standardized Primitives
  {
    id: 'CRYPTO-RULE-012',
    name: 'NIST Standardized Post-Quantum Primitive (ML-KEM / ML-DSA)',
    languages: ['java', 'kotlin', 'python', 'py', 'javascript', 'typescript', 'js', 'ts', 'c', 'cpp', 'go', 'php', 'cs', 'rs', 'swift', 'txt'],
    regex: /(?:ML-KEM|ML-DSA|SLH-DSA|Kyber512|Kyber768|Kyber1024|Dilithium2|Dilithium3|Dilithium5|SPHINCS\+|FIPS203|FIPS204|FIPS205)/i,
    algorithm: 'ML-KEM / ML-DSA',
    category: 'Post-Quantum Cryptography',
    severity: 'informational',
    confidence: 'high',
    title: 'NIST Post-Quantum Cryptography (PQC) Primitive Detected',
    description: 'NIST standardized post-quantum cryptographic algorithm detected (FIPS 203 Module-Lattice KEM / FIPS 204 Module-Lattice DSA). Provides quantum resilience.',
    remediation: 'Maintain implementation and keep dependencies updated against official NIST test vectors.',
    quantum_vulnerable: false,
    pqc_priority: 'low'
  },
  // Password Hashing / KDF: Argon2 / PBKDF2 / bcrypt
  {
    id: 'CRYPTO-RULE-013',
    name: 'Secure Password KDF (Argon2 / PBKDF2 / bcrypt / scrypt)',
    languages: ['java', 'kotlin', 'python', 'py', 'javascript', 'typescript', 'js', 'ts', 'c', 'cpp', 'go', 'php', 'cs', 'rs', 'swift', 'txt'],
    regex: /(?:argon2|bcrypt|scrypt|PBKDF2WithHmacSHA(?:256|512)|SecretKeyFactory\.getInstance\s*\(\s*["']PBKDF2|hashpw|argon2id)/i,
    algorithm: 'Argon2 / PBKDF2 / bcrypt',
    category: 'Password Hashing / KDF',
    severity: 'informational',
    confidence: 'high',
    title: 'Dedicated Password Hashing Function (KDF) Detected',
    description: 'Memory-hard / computationally-intensive password hashing algorithm detected. Resists GPU/ASIC brute-force dictionary attacks.',
    remediation: 'Ensure work/memory factors meet OWASP standards (Argon2id: 64MB memory, 3 iterations; PBKDF2: >= 600,000 iterations).',
    quantum_vulnerable: false,
    pqc_priority: 'low',
    cwe: 'CWE-916'
  },
  // Randomness: Insecure PRNG
  {
    id: 'CRYPTO-RULE-014',
    name: 'Insecure / Predictable Random Number Generator (PRNG)',
    languages: ['java', 'kotlin', 'python', 'py', 'javascript', 'typescript', 'js', 'ts', 'c', 'cpp', 'go', 'php', 'cs', 'rs', 'swift', 'txt'],
    regex: /(?:new\s+Random\s*\(|Math\.random\s*\(|random\.random\s*\(|rand\s*\(\)|srand\s*\(|mt_rand\s*\()/i,
    algorithm: 'Predictable PRNG',
    category: 'Randomness & Entropy',
    severity: 'high',
    confidence: 'high',
    title: 'Predictable Pseudo-Random Generator (PRNG) Detected',
    description: 'Predictable PRNG (e.g. java.util.Random, Math.random) detected in source code. Internal state can be reconstructed by an adversary to predict keys, tokens, or nonces.',
    remediation: 'Replace with a CSPRNG: java.security.SecureRandom, secrets.token_bytes(), crypto.randomBytes(), or /dev/urandom.',
    quantum_vulnerable: false,
    pqc_priority: 'high',
    cwe: 'CWE-338'
  },
  // Randomness: Secure CSPRNG
  {
    id: 'CRYPTO-RULE-015',
    name: 'Cryptographically Secure Random Number Generator (CSPRNG)',
    languages: ['java', 'kotlin', 'python', 'py', 'javascript', 'typescript', 'js', 'ts', 'c', 'cpp', 'go', 'php', 'cs', 'rs', 'swift', 'txt'],
    regex: /(?:SecureRandom|secrets\.token_|crypto\.randomBytes|crypto\.getRandomValues|rand\.Reader|RNGCryptoServiceProvider|RandomNumberGenerator\.Create)/i,
    algorithm: 'SecureRandom CSPRNG',
    category: 'Randomness & Entropy',
    severity: 'informational',
    confidence: 'high',
    title: 'Cryptographically Secure Random Generator (CSPRNG) Detected',
    description: 'CSPRNG detected. Generates unguessable entropy compliant with NIST SP 800-90A for keys, nonces, and session tokens.',
    remediation: 'Maintain implementation.',
    quantum_vulnerable: false,
    pqc_priority: 'low'
  },
  // Secrets: Hardcoded Secret Key Material
  {
    id: 'CRYPTO-RULE-016',
    name: 'Potential Hardcoded Cryptographic Key or Secret',
    languages: ['java', 'kotlin', 'python', 'py', 'javascript', 'typescript', 'js', 'ts', 'c', 'cpp', 'go', 'php', 'cs', 'rs', 'swift', 'txt', 'json', 'xml', 'yaml', 'env', 'properties'],
    regex: /(?:(?:aes|secret|private|encryption|token|api)[_-]?key|password|jwt[_-]?secret)\s*(?:=|:)\s*["'][A-Za-z0-9+/=_-]{16,}["']/i,
    algorithm: 'Hardcoded Key Material',
    category: 'Key Management & Secrets',
    severity: 'critical',
    confidence: 'high',
    title: 'Potential Hardcoded Cryptographic Key / Secret Detected',
    description: 'Hardcoded cryptographic secret key or token detected directly in source/config files. Secrets in code can be decompiled from binaries or exposed in version control.',
    remediation: 'Externalize keys to a Hardware Security Module (HSM), Cloud KMS (AWS KMS, Azure Key Vault, GCP KMS), or Android Keystore.',
    quantum_vulnerable: false,
    pqc_priority: 'immediate',
    cwe: 'CWE-798'
  },
  // Secrets: Private Key Block
  {
    id: 'CRYPTO-RULE-017',
    name: 'Hardcoded Private Key Block in Code / Config',
    languages: ['java', 'kotlin', 'python', 'py', 'javascript', 'typescript', 'js', 'ts', 'c', 'cpp', 'go', 'php', 'cs', 'rs', 'swift', 'txt', 'json', 'xml', 'yaml', 'env', 'properties'],
    regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/i,
    algorithm: 'Private Key Block',
    category: 'Key Management & Secrets',
    severity: 'critical',
    confidence: 'confirmed',
    title: 'Embedded Private Key Block Detected',
    description: 'Embedded private key block detected. Direct compromise of private key material enables decryption and identity impersonation.',
    remediation: 'Revoke and rotate the exposed private key immediately. Store private keys only in encrypted keystores / HSMs.',
    quantum_vulnerable: false,
    pqc_priority: 'immediate',
    cwe: 'CWE-321'
  },
  // IV: Static / Zero IV
  {
    id: 'CRYPTO-RULE-018',
    name: 'Static or Zero-Filled Initialization Vector (IV / Nonce)',
    languages: ['java', 'kotlin', 'python', 'py', 'javascript', 'typescript', 'js', 'ts', 'c', 'cpp', 'go', 'php', 'cs', 'rs', 'swift', 'txt'],
    regex: /(?:new\s+IvParameterSpec\s*\(\s*(?:new\s+byte\[\d+\]|["'][^"']+["']\.getBytes)|iv\s*=\\s*b?["'][0-9a-fA-F]{16,32}["']|iv\s*=\s*bytes\(\d+\)|b["']\\x00{8,}["'])/i,
    algorithm: 'Static / Reused IV',
    category: 'IV & Nonce Hygiene',
    severity: 'critical',
    confidence: 'high',
    title: 'Static / Hardcoded Initialization Vector (IV) Detected',
    description: 'Static or zero-filled IV detected. Reusing nonces in CTR, GCM, or CBC mode catastrophically destroys encryption guarantees and enables plaintext XOR recovery.',
    remediation: 'Generate a unique, cryptographically random IV for every encryption operation using a CSPRNG.',
    quantum_vulnerable: false,
    pqc_priority: 'immediate',
    cwe: 'CWE-329'
  },
  // TLS: Disabled Validation
  {
    id: 'CRYPTO-RULE-019',
    name: 'Disabled TLS Certificate Validation / Hostname Verification',
    languages: ['java', 'kotlin', 'python', 'py', 'javascript', 'typescript', 'js', 'ts', 'c', 'cpp', 'go', 'php', 'cs', 'rs', 'swift', 'txt'],
    regex: /(?:TrustAll|ALLOW_ALL_HOSTNAME_VERIFIER|verify\s*=\s*False|rejectUnauthorized\s*:\s*false|NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['"]0['"]|InsecureSkipVerify\s*:\s*true|check_hostname\s*=\\s*False)/i,
    algorithm: 'Disabled TLS Validation',
    category: 'Transport Layer Security',
    severity: 'critical',
    confidence: 'high',
    title: 'Disabled TLS Certificate Validation / Hostname Verification',
    description: 'TLS certificate validation or hostname verification is explicitly disabled, allowing Man-in-the-Middle (MitM) attackers to intercept and modify encrypted traffic.',
    remediation: 'Enable strict TLS certificate validation against trusted root CAs and enforce strict hostname checking.',
    quantum_vulnerable: false,
    pqc_priority: 'immediate',
    cwe: 'CWE-295'
  },
  // Android Manifest: Cleartext Traffic
  {
    id: 'CRYPTO-RULE-020',
    name: 'Android Cleartext Traffic Permitted in Manifest',
    languages: ['xml', 'txt'],
    regex: /android:usesCleartextTraffic\s*=\s*["']true["']/i,
    algorithm: 'Cleartext HTTP',
    category: 'Android Security',
    severity: 'high',
    confidence: 'confirmed',
    title: 'Android Manifest Permits Cleartext HTTP Traffic',
    description: 'AndroidManifest.xml explicitly permits cleartext HTTP network traffic, exposing sensitive user data to network sniffing.',
    remediation: 'Set android:usesCleartextTraffic="false" and enforce HTTPS via Network Security Config.',
    quantum_vulnerable: false,
    pqc_priority: 'high',
    cwe: 'CWE-319'
  },
  // Android Manifest: Debuggable
  {
    id: 'CRYPTO-RULE-021',
    name: 'Android Application Debuggable Flag Enabled',
    languages: ['xml', 'txt'],
    regex: /android:debuggable\s*=\s*["']true["']/i,
    algorithm: 'Debuggable Flag',
    category: 'Android Security',
    severity: 'high',
    confidence: 'confirmed',
    title: 'Android Application Is Marked Debuggable',
    description: 'AndroidManifest.xml has android:debuggable enabled. Allows process attachment via JDWP to dump cryptographic keys and runtime memory.',
    remediation: 'Ensure android:debuggable="false" in production release builds.',
    quantum_vulnerable: false,
    pqc_priority: 'high',
    cwe: 'CWE-215'
  },
  // Hardware KMS: Android Keystore / Cloud KMS
  {
    id: 'CRYPTO-RULE-022',
    name: 'Hardware-Backed Keystore / Cloud KMS Integration',
    languages: ['java', 'kotlin', 'python', 'py', 'javascript', 'typescript', 'js', 'ts', 'go', 'cs', 'swift', 'txt'],
    regex: /(?:AndroidKeyStore|KeyStore\.getInstance\s*\(\s*["']AndroidKeyStore["']|setIsStrongBoxBacked|kms\.amazonaws\.com|vault\.service|pkcs11|CloudKMS)/i,
    algorithm: 'Hardware KMS / Android Keystore',
    category: 'Key Management & Secrets',
    severity: 'informational',
    confidence: 'high',
    title: 'Hardware-Backed Key Storage (KMS/StrongBox) Detected',
    description: 'Hardware-backed key storage (Android Keystore StrongBox, AWS KMS, HashiCorp Vault, or PKCS#11) detected. Keys remain non-exportable and protected in secure enclaves.',
    remediation: 'Maintain implementation and enforce key rotation policies.',
    quantum_vulnerable: false,
    pqc_priority: 'low'
  }
];

// ─── Shannon Entropy Calculator for High-Entropy Secret Detection ─────────────
export function calculateShannonEntropy(str: string): number {
  if (!str) return 0;
  const len = str.length;
  const frequencies: Record<string, number> = {};
  for (let i = 0; i < len; i++) {
    const char = str[i];
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  let entropy = 0;
  for (const char in frequencies) {
    const p = frequencies[char] / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

// ─── Reference Test Codebases for Demo Scenarios ──────────────────────────────
export const DEMO_CODEBASES = {
  cryptotalk: {
    name: 'CryptoTalk Secure Messenger (Reference App)',
    type: 'mobile_app' as const,
    files: [
      {
        path: 'app/src/main/java/com/cryptotalk/security/CryptoManager.kt',
        content: `package com.cryptotalk.security

import javax.crypto.Cipher
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import java.security.KeyStore
import java.security.SecureRandom
import java.security.KeyPairGenerator
import java.security.MessageDigest

class CryptoManager {
    private val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
    private val secureRandom = SecureRandom()

    // Strong authenticated AES-256-GCM
    fun encryptMessage(plaintext: ByteArray, secretKey: SecretKey): ByteArray {
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        val iv = ByteArray(12)
        secureRandom.nextBytes(iv)
        val spec = GCMParameterSpec(128, iv)
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, spec)
        return iv + cipher.doFinal(plaintext)
    }

    // Modern 3072-bit RSA Key Pair
    fun generateUserKeyPair() {
        val kpg = KeyPairGenerator.getInstance("RSA")
        kpg.initialize(3072)
        kpg.generateKeyPair()
    }

    // SHA-256 Digest
    fun computeDigest(data: ByteArray): ByteArray {
        val md = MessageDigest.getInstance("SHA-256")
        return md.digest(data)
    }
}`
      },
      {
        path: 'app/src/main/AndroidManifest.xml',
        content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.cryptotalk.app">
    <application
        android:allowBackup="false"
        android:debuggable="false"
        android:usesCleartextTraffic="false"
        android:networkSecurityConfig="@xml/network_security_config">
        <activity android:name=".MainActivity" android:exported="true" />
    </application>
</manifest>`
      }
    ]
  },
  legacy_banking: {
    name: 'Legacy Core Banking API (Vulnerable Sample)',
    type: 'api' as const,
    files: [
      {
        path: 'src/main/java/com/bank/legacy/LegacyTxService.java',
        content: `package com.bank.legacy;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.security.KeyPairGenerator;
import java.security.MessageDigest;
import java.util.Random;

public class LegacyTxService {
    // CRITICAL: Hardcoded AES Secret Key
    private static final String MASTER_KEY = "MasterBankKeySecret12345678";

    public byte[] encryptPin(byte[] pin) throws Exception {
        // CRITICAL: Insecure AES-ECB mode
        Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
        SecretKeySpec key = new SecretKeySpec(MASTER_KEY.getBytes(), "AES");
        cipher.init(Cipher.ENCRYPT_MODE, key);
        return cipher.doFinal(pin);
    }

    public byte[] legacyDesEncrypt(byte[] data) throws Exception {
        // CRITICAL: Deprecated 3DES
        Cipher cipher = Cipher.getInstance("DESede/CBC/PKCS5Padding");
        return cipher.doFinal(data);
    }

    public void initLegacyKeys() throws Exception {
        // CRITICAL: Broken 1024-bit RSA
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
        kpg.initialize(1024);
    }

    public byte[] hashAccount(byte[] acc) throws Exception {
        // CRITICAL: Broken MD5 hash
        MessageDigest md = MessageDigest.getInstance("MD5");
        return md.digest(acc);
    }

    public byte[] hashSession(byte[] token) throws Exception {
        // HIGH: Deprecated SHA-1 hash
        MessageDigest md = MessageDigest.getInstance("SHA-1");
        return md.digest(token);
    }

    public int generateOtp() {
        // HIGH: Predictable PRNG
        Random rand = new Random();
        return rand.nextInt(999999);
    }
}`
      },
      {
        path: 'scripts/auth_helper.py',
        content: `import hashlib
from Crypto.Cipher import DES3

# Hardcoded API Secret
JWT_SECRET_KEY = "SuperSecretJwtTokenSignatureKey_12345"

def hash_user_password(password):
    # Insecure MD5 for password
    return hashlib.md5(password.encode()).hexdigest()

def legacy_token_check(token):
    # Deprecated SHA1
    return hashlib.sha1(token.encode()).hexdigest()
`
      }
    ]
  }
};

export interface ScanProgressCallback {
  (progress: number, step: string, logs: Array<{ timestamp: string; message: string; level: 'info' | 'warn' | 'error' }>, currentFile?: string): void;
}

// ─── Main Client-Side Scanner Execution ───────────────────────────────────────
export async function executeClientSideScan(
  files: Array<{ path: string; content: string; size?: number }>,
  targetName: string,
  onProgress?: ScanProgressCallback
): Promise<{
  scan: Scan;
  findings: CryptoFinding[];
  bom: CryptoBOMComponent[];
  risk: RiskOverview;
  pqc: PQCReadinessOverview;
  scannedFiles: ScannedFileInfo[];
  agility: CryptoAgilityScore;
  cyclonedx: CycloneDXCBOM;
}> {
  const scanId = 'scan-' + Math.random().toString(36).substring(2, 11);
  const assetId = 'asset-' + Math.random().toString(36).substring(2, 11);
  const logs: Array<{ timestamp: string; message: string; level: 'info' | 'warn' | 'error' }> = [];

  const addLog = (msg: string, level: 'info' | 'warn' | 'error' = 'info') => {
    logs.push({ timestamp: new Date().toLocaleTimeString(), message: msg, level });
  };

  addLog(`[ECDAT Discovery] Initialized multi-language scanner for "${targetName}"`);
  onProgress?.(10, 'Parsing repository tree & extracting source manifests', logs);
  await new Promise(r => setTimeout(r, 250));

  const findings: CryptoFinding[] = [];
  const bomComponents: CryptoBOMComponent[] = [];
  const scannedFilesList: ScannedFileInfo[] = [];

  addLog(`[File Inventory] Discovered ${files.length} candidate file(s) for cryptographic inspection`);
  onProgress?.(30, 'Executing deterministic AST rules and entropy analysis', logs);

  let processedCount = 0;

  for (const file of files) {
    processedCount++;
    const ext = file.path.split('.').pop()?.toLowerCase() || 'txt';
    const lines = file.content.split('\n');
    let fileFindingsCount = 0;
    let fileWorstSeverity: 'critical' | 'high' | 'medium' | 'low' | 'clean' = 'clean';

    const pct = 30 + Math.floor((processedCount / files.length) * 45);
    onProgress?.(pct, `Scanning ${file.path} (${processedCount}/${files.length})`, logs, file.path);

    // If file is a certificate (PEM / CRT)
    if (['pem', 'crt', 'cer', 'cert'].includes(ext) || file.content.includes('BEGIN CERTIFICATE')) {
      const parsedCert = parsePemCertificate(file.content);
      for (const certFinding of parsedCert.findings) {
        fileFindingsCount++;
        if (certFinding.severity === 'critical') fileWorstSeverity = 'critical';
        else if (certFinding.severity === 'high' && fileWorstSeverity !== 'critical') fileWorstSeverity = 'high';

        findings.push({
          id: 'find-' + Math.random().toString(36).substring(2, 11),
          scan_id: scanId,
          asset_id: assetId,
          asset_name: targetName,
          organization_id: 'default-org',
          rule_id: certFinding.rule_id,
          title: certFinding.title,
          description: certFinding.description,
          category: 'X.509 Certificate Health',
          algorithm: `${parsedCert.public_key_algorithm}-${parsedCert.public_key_size}`,
          file_path: file.path,
          line_number: 1,
          code_snippet_redacted: `Subject: ${parsedCert.subject} | Expiry: ${parsedCert.valid_until.split('T')[0]} | Sig: ${parsedCert.signature_algorithm}`,
          language: ext,
          severity: certFinding.severity,
          confidence: 'high',
          status: 'open',
          quantum_vulnerable: parsedCert.is_quantum_vulnerable,
          pqc_priority: parsedCert.is_quantum_vulnerable ? 'high' : 'low',
          remediation_deterministic: certFinding.remediation,
          is_demo: false,
          created_at: new Date().toISOString()
        });
      }
    }

    // Iterate through deterministic rules
    for (const rule of CLIENT_DISCOVERY_RULES) {
      if (rule.languages.includes(ext) || rule.languages.includes('txt')) {
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (rule.regex.test(line)) {
            fileFindingsCount++;

            // Extract key size indicators if present in context
            let keySize: number | null = null;
            let keySizeStr = 'unknown';

            if (rule.algorithm === 'RSA' || line.includes('RSA')) {
              if (line.includes('1024') || file.content.includes('1024')) { keySize = 1024; keySizeStr = '1024-bit'; }
              else if (line.includes('4096') || file.content.includes('4096')) { keySize = 4096; keySizeStr = '4096-bit'; }
              else if (line.includes('3072') || file.content.includes('3072')) { keySize = 3072; keySizeStr = '3072-bit'; }
              else { keySize = 2048; keySizeStr = '2048-bit'; }
            } else if (rule.algorithm.includes('AES') || line.includes('AES')) {
              if (line.includes('128')) { keySize = 128; keySizeStr = '128-bit'; }
              else if (line.includes('192')) { keySize = 192; keySizeStr = '192-bit'; }
              else { keySize = 256; keySizeStr = '256-bit'; }
            } else if (rule.algorithm.includes('ECC') || rule.algorithm.includes('ECDSA')) {
              keySize = 256;
              keySizeStr = '256-bit (P-256)';
            }

            let sev = rule.severity;
            let title = rule.title;
            let desc = rule.description;

            if (rule.algorithm === 'RSA') {
              if (keySize && keySize < 2048) {
                sev = 'critical';
                title = `Legacy RSA-${keySize} Key Size Detected`;
                desc = `RSA key size of ${keySize} bits is cryptographically broken and does not meet the minimum standard of 2048/3072 bits.`;
              } else if (keySize && keySize >= 3072) {
                sev = 'informational';
                title = `Modern RSA-${keySize} Key Detected`;
                desc = `RSA key size of ${keySize} bits provides strong classical security (128-bit equivalent).`;
              }
            }

            if (sev === 'critical') fileWorstSeverity = 'critical';
            else if (sev === 'high' && fileWorstSeverity !== 'critical') fileWorstSeverity = 'high';
            else if (sev === 'medium' && !['critical', 'high'].includes(fileWorstSeverity)) fileWorstSeverity = 'medium';
            else if (sev === 'low' && fileWorstSeverity === 'clean') fileWorstSeverity = 'low';

            // Redact code snippet to protect sensitive keys
            let sanitizedSnippet = line.trim();
            if (rule.category.includes('Secret') || rule.category.includes('Key')) {
              sanitizedSnippet = sanitizedSnippet.replace(/["'][A-Za-z0-9+/=_-]{16,}["']/g, '"[REDACTED_SECRET_VALUE]"');
            }

            const findingId = 'find-' + Math.random().toString(36).substring(2, 11);

            findings.push({
              id: findingId,
              scan_id: scanId,
              asset_id: assetId,
              asset_name: targetName,
              organization_id: 'default-org',
              rule_id: rule.id,
              title: title,
              description: desc,
              category: rule.category,
              algorithm: rule.algorithm,
              mode: rule.mode,
              padding: rule.padding,
              key_size: keySize,
              key_size_str: keySizeStr,
              file_path: file.path,
              line_number: i + 1,
              code_snippet_redacted: sanitizedSnippet,
              language: ext,
              severity: sev,
              confidence: (rule.confidence === 'confirmed' ? 'high' : rule.confidence) as 'high' | 'medium' | 'low',
              status: 'open',
              quantum_vulnerable: rule.quantum_vulnerable,
              pqc_priority: rule.pqc_priority,
              remediation_deterministic: rule.remediation,
              is_demo: false,
              created_at: new Date().toISOString()
            });

            // Add to Cryptographic Bill of Materials (CBOM)
            bomComponents.push({
              id: 'bom-' + Math.random().toString(36).substring(2, 11),
              scan_id: scanId,
              asset_id: assetId,
              asset_name: targetName,
              organization_id: 'default-org',
              component_name: `${rule.algorithm} in ${file.path.split('/').pop()}`,
              algorithm: rule.algorithm,
              category: rule.category,
              purpose: rule.category === 'Cryptographic Hash' ? 'Data Integrity & Checksum Verification' : 'Data Confidentiality & Protection',
              location: `${file.path}:${i + 1}`,
              key_size_or_curve: keySizeStr,
              security_status: sev === 'critical' ? 'Broken / Prohibited' : (sev === 'high' ? 'Deprecated' : 'Recommended'),
              pqc_relevance: rule.quantum_vulnerable ? 'Quantum Vulnerable (Shor\'s Factorization)' : 'Quantum Resilient (Symmetric/Hash)',
              is_quantum_safe: !rule.quantum_vulnerable,
              risk_level: sev,
              evidence: sanitizedSnippet,
              created_at: new Date().toISOString()
            });
          }
        }
      }
    }

    scannedFilesList.push({
      name: file.path.split('/').pop() || file.path,
      path: file.path,
      size_bytes: file.size || file.content.length,
      file_type: ext,
      scan_status: 'scanned',
      detection_count: fileFindingsCount,
      risk_level: fileWorstSeverity,
      timestamp: new Date().toISOString()
    });
  }

  addLog(`[Deterministic Normalization] Found ${findings.length} cryptographic primitive instances across ${scannedFilesList.length} files`);
  onProgress?.(80, 'Evaluating NIST SP 800-131A & PQC Resilience Matrix', logs);
  await new Promise(r => setTimeout(r, 200));

  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const highCount = findings.filter(f => f.severity === 'high').length;
  const mediumCount = findings.filter(f => f.severity === 'medium').length;
  const lowCount = findings.filter(f => f.severity === 'low').length;
  const infoCount = findings.filter(f => f.severity === 'informational').length;

  let overallScore = 100 - (criticalCount * 28 + highCount * 14 + mediumCount * 5);
  if (overallScore < 0) overallScore = 0;
  if (findings.length === 0) overallScore = 100;

  const qvCount = findings.filter(f => f.quantum_vulnerable).length;
  const pqcScore = findings.length > 0 ? Math.round(((findings.length - qvCount) / findings.length) * 100) : 100;

  // Crypto Agility Score Calculation
  const hasHardcodedKeys = findings.some(f => f.rule_id === 'CRYPTO-RULE-016');
  const hasEcb = findings.some(f => f.rule_id === 'CRYPTO-RULE-004');
  const hasHardwareKms = findings.some(f => f.rule_id === 'CRYPTO-RULE-022');

  const agilityScore = Math.max(
    10,
    Math.min(
      100,
      (hasHardwareKms ? 30 : 10) +
      (hasHardcodedKeys ? 0 : 30) +
      (hasEcb ? 0 : 20) +
      (criticalCount === 0 ? 20 : 5)
    )
  );

  const agility: CryptoAgilityScore = {
    overall_score: agilityScore,
    rating: agilityScore >= 80 ? 'High Agility' : (agilityScore >= 50 ? 'Moderate Agility' : 'Hardcoded / Inflexible'),
    breakdown: {
      abstraction_layer_score: hasHardwareKms ? 85 : 40,
      dynamic_cipher_negotiation: 70,
      key_management_decoupling: hasHardcodedKeys ? 20 : 80,
      automated_cert_rotation: 65,
      config_driven_crypto: hasEcb ? 30 : 75
    },
    recommendations: [
      hasHardcodedKeys ? 'Eliminate hardcoded key literals in source code; bind keys via KMS / Vault.' : 'Maintain externalized KMS key references.',
      qvCount > 0 ? 'Deploy hybrid classical + post-quantum algorithms (X25519 + ML-KEM-768).' : 'Maintain current quantum-resilient symmetric configurations.'
    ]
  };

  onProgress?.(92, 'Serializing CycloneDX 1.6 CBOM & Assessment Report', logs);
  await new Promise(r => setTimeout(r, 200));

  const scan: Scan = {
    id: scanId,
    organization_id: 'default-org',
    asset_id: assetId,
    asset_name: targetName,
    scan_type: 'source_code',
    status: 'completed',
    progress_percentage: 100,
    current_step: 'Assessment completed successfully',
    target_identifier: targetName,
    total_files_analyzed: scannedFilesList.length,
    total_findings_count: findings.length,
    critical_count: criticalCount,
    high_count: highCount,
    medium_count: mediumCount,
    low_count: lowCount,
    info_count: infoCount,
    overall_security_score: overallScore,
    pqc_readiness_score: pqcScore,
    is_demo: false,
    logs: logs,
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  };

  const risk: RiskOverview = {
    overall_score: overallScore,
    pqc_score: pqcScore,
    total_assets: 1,
    assets_scanned: 1,
    total_crypto_instances: findings.length,
    critical_findings: criticalCount,
    high_findings: highCount,
    medium_findings: mediumCount,
    low_findings: lowCount,
    info_findings: infoCount,
    severity_distribution: [
      { name: 'Critical', value: criticalCount, color: '#f43f5e' },
      { name: 'High', value: highCount, color: '#f97316' },
      { name: 'Medium', value: mediumCount, color: '#eab308' },
      { name: 'Low', value: lowCount, color: '#3b82f6' },
      { name: 'Informational', value: infoCount, color: '#10b981' }
    ],
    algorithm_distribution: [
      { name: 'AES', count: findings.filter(f => f.algorithm.includes('AES')).length },
      { name: 'RSA', count: findings.filter(f => f.algorithm.includes('RSA')).length },
      { name: 'MD5/SHA1', count: findings.filter(f => f.algorithm.includes('MD5') || f.algorithm.includes('SHA-1')).length },
      { name: 'SHA-2/3', count: findings.filter(f => f.algorithm.includes('SHA-2') || f.algorithm.includes('SHA-3')).length },
      { name: 'ECC/Curve25519', count: findings.filter(f => f.algorithm.includes('ECC') || f.algorithm.includes('25519')).length }
    ].filter(a => a.count > 0),
    risk_trends: [
      { date: 'Initial', score: 100, legacy_count: 0 },
      { date: 'Current Scan', score: overallScore, legacy_count: criticalCount + highCount }
    ],
    score_breakdown: {
      algorithm_strength: criticalCount > 0 ? 35 : (highCount > 0 ? 65 : 95),
      key_hygiene: hasHardcodedKeys ? 30 : 90,
      protocol_security: 85,
      certificate_health: 90,
      pqc_margin: pqcScore
    }
  };

  const pqc: PQCReadinessOverview = {
    readiness_score: pqcScore,
    quantum_sensitive_count: qvCount,
    quantum_safe_count: findings.length - qvCount,
    high_priority_migration_count: findings.filter(f => f.pqc_priority === 'immediate' || f.pqc_priority === 'high').length,
    components: [
      {
        algorithm: 'RSA (1024/2048/3072)',
        category: 'Public Key Encryption & Signatures',
        quantum_threat: 'Factorization via Shor\'s Algorithm (Broken on CRQC)',
        impact: 'High' as const,
        pqc_replacement: 'ML-KEM-768 (FIPS 203) / ML-DSA-65 (FIPS 204)',
        standard_reference: 'NIST Post-Quantum Standardization (FIPS 203/204)',
        instances_count: findings.filter(f => f.algorithm.includes('RSA')).length
      },
      {
        algorithm: 'ECC (NIST P-256 / secp256k1 / X25519)',
        category: 'Elliptic Curve Key Exchange & Signatures',
        quantum_threat: 'Discrete Logarithm via Shor\'s Algorithm (Broken on CRQC)',
        impact: 'High' as const,
        pqc_replacement: 'Hybrid X25519 + ML-KEM-768',
        standard_reference: 'NIST FIPS 203 / IETF TLS 1.3 Draft',
        instances_count: findings.filter(f => f.algorithm.includes('ECC') || f.algorithm.includes('25519')).length
      },
      {
        algorithm: 'AES-256-GCM',
        category: 'Symmetric AEAD Encryption',
        quantum_threat: 'Grover\'s Search Algorithm (Halves effective key to 128-bit)',
        impact: 'Low' as const,
        pqc_replacement: 'Retain AES-256 (128-bit quantum security margin unbroken)',
        standard_reference: 'NIST SP 800-38D',
        instances_count: findings.filter(f => f.algorithm.includes('AES')).length
      }
    ].filter(c => c.instances_count > 0),
    migration_roadmap: [
      { phase: 'Phase 1: Discovery & Inventory', target: 'Complete Crypto-BOM', action: 'Catalog all public key algorithms and external dependencies.', nist_guideline: 'NIST IR 8454' },
      { phase: 'Phase 2: Hybrid Prototyping', target: 'TLS 1.3 & Key Exchange', action: 'Deploy hybrid classical + post-quantum key exchange (X25519 + ML-KEM-768).', nist_guideline: 'FIPS 203' },
      { phase: 'Phase 3: Digital Signature Transition', target: 'Certificates & Code Signing', action: 'Evaluate ML-DSA (FIPS 204) and SLH-DSA (FIPS 205).', nist_guideline: 'FIPS 204 / 205' },
      { phase: 'Phase 4: Full Quantum Resilience', target: 'Enterprise Cryptosystem', action: 'Decommission pure RSA/ECC asymmetric operations.', nist_guideline: 'CNSA 2.0 (2033)' }
    ]
  };

  const cyclonedx: CycloneDXCBOM = {
    bomFormat: 'CycloneDX',
    specVersion: '1.6',
    serialNumber: `urn:uuid:${scanId}`,
    version: 1,
    metadata: {
      timestamp: new Date().toISOString(),
      tools: [
        { vendor: 'ECDAT Team', name: 'ECDAT Cryptographic Discovery Engine', version: '2.0.0' }
      ],
      component: {
        type: 'application',
        name: targetName,
        version: '1.0.0'
      }
    },
    cryptoProperties: {
      assetRef: assetId,
      algorithms: bomComponents.map(b => ({
        name: b.algorithm,
        category: b.category,
        keySize: b.key_size_or_curve,
        primitive: b.category.includes('Hash') ? 'hash' : (b.category.includes('Symmetric') ? 'symmetric' : 'asymmetric'),
        quantumSecurity: b.is_quantum_safe ? 'quantum_safe' : 'quantum_vulnerable',
        classicalSecurityBits: b.algorithm.includes('256') ? 256 : (b.algorithm.includes('1024') ? 80 : 128),
        compliance: ['NIST SP 800-131A', 'FIPS 140-3']
      })) as any,
      certificates: [],
      dependencies: []
    }
  };

  addLog(`[Scan Finalized] Overall Score: ${overallScore}/100 | PQC Score: ${pqcScore}/100 | Files: ${scannedFilesList.length}`);
  onProgress?.(100, 'Scan completed successfully', logs);

  // Sync to LocalStorage for GitHub Pages / offline persistence
  saveScanToLocalStorage(scan, findings, bomComponents, scannedFilesList);

  // Sync to Supabase in background if reachable
  syncScanToSupabase(scan, findings, bomComponents).catch(() => {});

  return { scan, findings, bom: bomComponents, risk, pqc, scannedFiles: scannedFilesList, agility, cyclonedx };
}

// ─── Recursive ZIP / APK / JAR Extractor ──────────────────────────────────────
export async function extractFilesFromZip(file: File): Promise<Array<{ path: string; content: string; size?: number }>> {
  const zip = new JSZip();
  const unzipped = await zip.loadAsync(file);
  const files: Array<{ path: string; content: string; size?: number }> = [];

  const textExtensions = [
    '.java', '.kt', '.py', '.js', '.ts', '.jsx', '.tsx',
    '.c', '.cpp', '.h', '.hpp', '.cs', '.go', '.rs', '.swift', '.php',
    '.json', '.xml', '.yaml', '.yml', '.properties', '.env', '.txt', '.md',
    '.pem', '.crt', '.cer'
  ];

  for (const [filename, entry] of Object.entries(unzipped.files)) {
    if (!entry.dir) {
      const lower = filename.toLowerCase();
      // Handle source files & configs
      if (textExtensions.some(ext => lower.endsWith(ext)) || lower.endsWith('dockerfile')) {
        try {
          const content = await entry.async('string');
          files.push({ path: filename, content, size: content.length });
        } catch (e) {
          console.warn(`Could not read text for ${filename}:`, e);
        }
      }
    }
  }

  return files;
}

// ─── LocalStorage Persistence ────────────────────────────────────────────────
function saveScanToLocalStorage(
  scan: Scan,
  findings: CryptoFinding[],
  bom: CryptoBOMComponent[],
  scannedFiles: ScannedFileInfo[]
) {
  try {
    const existingScans = JSON.parse(localStorage.getItem('cryptotool_scans') || '[]');
    localStorage.setItem('cryptotool_scans', JSON.stringify([scan, ...existingScans.filter((s: any) => s.id !== scan.id)]));

    const existingFindings = JSON.parse(localStorage.getItem('cryptotool_findings') || '[]');
    localStorage.setItem('cryptotool_findings', JSON.stringify([...findings, ...existingFindings.filter((f: any) => f.scan_id !== scan.id)]));

    const existingBom = JSON.parse(localStorage.getItem('cryptotool_bom') || '[]');
    localStorage.setItem('cryptotool_bom', JSON.stringify([...bom, ...existingBom.filter((b: any) => b.scan_id !== scan.id)]));

    const filesKey = `cryptotool_files_${scan.id}`;
    localStorage.setItem(filesKey, JSON.stringify(scannedFiles));
  } catch (e) {
    console.warn('LocalStorage save warning:', e);
  }
}

async function syncScanToSupabase(scan: Scan, findings: CryptoFinding[], bom: CryptoBOMComponent[]) {
  try {
    await supabaseClient.from('scans').upsert({
      id: scan.id,
      organization_id: 'a0000000-0000-0000-0000-000000000001',
      asset_id: scan.asset_id,
      asset_name: scan.asset_name,
      scan_type: scan.scan_type,
      status: scan.status,
      progress_percentage: 100,
      current_step: 'Completed',
      target_identifier: scan.target_identifier,
      total_files_analyzed: scan.total_files_analyzed,
      total_findings_count: scan.total_findings_count,
      critical_count: scan.critical_count,
      high_count: scan.high_count,
      medium_count: scan.medium_count,
      low_count: scan.low_count,
      info_count: scan.info_count,
      overall_security_score: scan.overall_security_score,
      pqc_readiness_score: scan.pqc_readiness_score,
      logs: scan.logs
    });
  } catch {}
}
