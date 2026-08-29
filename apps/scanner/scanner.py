#!/usr/bin/env python3
"""
CryptoTool — Enterprise Cryptographic Discovery & Analysis Engine (SIH26164)
Multi-layer AST and pattern-based discovery for Java, Kotlin, Python, JavaScript, and TypeScript.
"""

import os
import re
import sys
import json
import uuid
import zipfile
import shutil
from typing import Dict, List, Any, Optional

# Patterns for Cryptographic Discovery
DISCOVERY_RULES = [
    # ------------------ JAVA / KOTLIN ------------------
    {
        "id": "JAVA-CIPHER-AES-GCM",
        "lang": ["java", "kotlin"],
        "regex": r'Cipher\.getInstance\s*\(\s*["\']AES/GCM/(?:NoPadding|PKCS5Padding)["\']',
        "algorithm": "AES",
        "mode": "GCM",
        "padding": "NoPadding",
        "category": "Symmetric Encryption",
        "family": "AES",
        "default_severity": "informational",
        "confidence": "high",
        "title": "Authenticated AES-GCM Encryption Detected",
        "description": "AES in Galois/Counter Mode (GCM) provides confidentiality and built-in cryptographic integrity (AEAD).",
        "remediation": "Maintain current implementation. Ensure 96-bit unique IVs (nonces) are generated randomly per encryption.",
        "quantum_vulnerable": False,
        "pqc_priority": "low",
        "api": "javax.crypto.Cipher"
    },
    {
        "id": "JAVA-CIPHER-AES-CBC",
        "lang": ["java", "kotlin"],
        "regex": r'Cipher\.getInstance\s*\(\s*["\']AES/CBC/(?:PKCS5Padding|PKCS7Padding|NoPadding)["\']',
        "algorithm": "AES",
        "mode": "CBC",
        "padding": "PKCS5Padding",
        "category": "Symmetric Encryption",
        "family": "AES",
        "default_severity": "medium",
        "confidence": "high",
        "title": "AES-CBC Mode in Use",
        "description": "Cipher Block Chaining mode lacks cryptographic authenticity. If decrypted without HMAC verification, it may be susceptible to padding oracle attacks.",
        "remediation": "Migrate to an AEAD mode such as AES-256-GCM or ChaCha20-Poly1305.",
        "quantum_vulnerable": False,
        "pqc_priority": "low",
        "api": "javax.crypto.Cipher"
    },
    {
        "id": "JAVA-CIPHER-AES-ECB",
        "lang": ["java", "kotlin"],
        "regex": r'Cipher\.getInstance\s*\(\s*["\']AES(?:/ECB/(?:PKCS5Padding|NoPadding))?["\']',
        "algorithm": "AES",
        "mode": "ECB",
        "padding": "PKCS5Padding",
        "category": "Symmetric Encryption",
        "family": "AES",
        "default_severity": "high",
        "confidence": "high",
        "title": "Insecure AES-ECB Mode Detected",
        "description": "Electronic Codebook (ECB) mode encrypts identical plaintext blocks into identical ciphertext blocks, leaking structural data patterns.",
        "remediation": "Immediately replace ECB mode with AES-GCM or ChaCha20-Poly1305 with random initialization vectors.",
        "quantum_vulnerable": False,
        "pqc_priority": "immediate",
        "api": "javax.crypto.Cipher"
    },
    {
        "id": "JAVA-CIPHER-DES-3DES",
        "lang": ["java", "kotlin"],
        "regex": r'Cipher\.getInstance\s*\(\s*["\'](?:DESede|DES|TripleDES)/',
        "algorithm": "3DES",
        "mode": "CBC",
        "padding": "PKCS5Padding",
        "category": "Symmetric Encryption",
        "family": "DES",
        "default_severity": "high",
        "confidence": "high",
        "title": "Deprecated 3DES/DES Cipher Detected",
        "description": "Triple-DES (DESede) utilizes a 64-bit block size that is vulnerable to collision attacks (Sweet32 / CVE-2016-2183) and is deprecated by NIST.",
        "remediation": "Migrate data encryption to AES-256-GCM.",
        "quantum_vulnerable": False,
        "pqc_priority": "immediate",
        "api": "javax.crypto.Cipher"
    },
    {
        "id": "JAVA-KEYGEN-RSA",
        "lang": ["java", "kotlin"],
        "regex": r'KeyPairGenerator\.getInstance\s*\(\s*["\']RSA["\']',
        "algorithm": "RSA",
        "category": "Asymmetric / Public Key",
        "family": "RSA",
        "default_severity": "medium",
        "confidence": "high",
        "title": "RSA Key Pair Generator Instantiated",
        "description": "RSA public-key generation detected. Key size determines security: 1024-bit is broken, 2048-bit is legacy-acceptable, 3072-bit is recommended classically, all are quantum-vulnerable.",
        "remediation": "Enforce minimum 2048-bit (preferably 3072-bit) key size. Plan transition to post-quantum hybrid schemes (ML-KEM / ML-DSA).",
        "quantum_vulnerable": True,
        "pqc_priority": "high",
        "api": "java.security.KeyPairGenerator"
    },
    {
        "id": "JAVA-DIGEST-SHA1",
        "lang": ["java", "kotlin"],
        "regex": r'MessageDigest\.getInstance\s*\(\s*["\']SHA-?1["\']',
        "algorithm": "SHA-1",
        "category": "Cryptographic Hash",
        "family": "SHA-1",
        "digest_size": 160,
        "default_severity": "high",
        "confidence": "high",
        "title": "Deprecated SHA-1 Hash Detected",
        "description": "SHA-1 collision resistance is practically broken (SHAttered attack). Using SHA-1 for signatures or integrity checks exposes systems to forgery.",
        "remediation": "Replace SHA-1 with SHA-256, SHA-384, or SHA3-256.",
        "quantum_vulnerable": False,
        "pqc_priority": "immediate",
        "api": "java.security.MessageDigest"
    },
    {
        "id": "JAVA-DIGEST-MD5",
        "lang": ["java", "kotlin"],
        "regex": r'MessageDigest\.getInstance\s*\(\s*["\']MD5["\']',
        "algorithm": "MD5",
        "category": "Cryptographic Hash",
        "family": "MD5",
        "digest_size": 128,
        "default_severity": "critical",
        "confidence": "high",
        "title": "Vulnerable MD5 Hash Detected",
        "description": "MD5 is cryptographically broken and vulnerable to rapid collision and preimage generation.",
        "remediation": "Replace with SHA-256 for data integrity or Argon2id/PBKDF2 for password hashing.",
        "quantum_vulnerable": False,
        "pqc_priority": "immediate",
        "api": "java.security.MessageDigest"
    },
    {
        "id": "JAVA-DIGEST-SHA256",
        "lang": ["java", "kotlin"],
        "regex": r'MessageDigest\.getInstance\s*\(\s*["\']SHA-?256["\']',
        "algorithm": "SHA-256",
        "category": "Cryptographic Hash",
        "family": "SHA-2",
        "digest_size": 256,
        "default_severity": "informational",
        "confidence": "high",
        "title": "Standard SHA-256 Digest Detected",
        "description": "SHA-256 is an accepted, collision-resistant secure hash algorithm (FIPS 180-4).",
        "remediation": "No remediation required. Compliant with current standards.",
        "quantum_vulnerable": False,
        "pqc_priority": "low",
        "api": "java.security.MessageDigest"
    },
    {
        "id": "JAVA-KEYAGREE-ECDH",
        "lang": ["java", "kotlin"],
        "regex": r'KeyAgreement\.getInstance\s*\(\s*["\'](?:ECDH|X25519|DH)["\']',
        "algorithm": "ECDH / Key Agreement",
        "category": "Key Exchange",
        "family": "Diffie-Hellman / ECC",
        "default_severity": "informational",
        "confidence": "high",
        "title": "Elliptic Curve Key Agreement (ECDH/X25519)",
        "description": "ECDH/X25519 provides forward-secret session key establishment classically.",
        "remediation": "Classically strong. Plan migration to hybrid post-quantum KEMs (X25519 + ML-KEM-768 / FIPS 203).",
        "quantum_vulnerable": True,
        "pqc_priority": "high",
        "api": "javax.crypto.KeyAgreement"
    },
    {
        "id": "JAVA-ANDROID-KEYSTORE",
        "lang": ["java", "kotlin"],
        "regex": r'KeyStore\.getInstance\s*\(\s*["\']AndroidKeyStore["\']',
        "algorithm": "Hardware-backed Keystore",
        "category": "Hardware Security / Key Storage",
        "family": "TEE / StrongBox",
        "default_severity": "informational",
        "confidence": "high",
        "title": "Android Keystore Hardware Protection in Use",
        "description": "Cryptographic key material is isolated within the Android Secure Element or TEE, preventing extraction even from rooted devices.",
        "remediation": "Excellent security hygiene. Ensure StrongBox is enabled on supported devices.",
        "quantum_vulnerable": False,
        "pqc_priority": "low",
        "api": "java.security.KeyStore"
    },

    # ------------------ PYTHON ------------------
    {
        "id": "PY-AES-GCM",
        "lang": ["python"],
        "regex": r'(?:AESGCM|modes\.GCM|AES\.MODE_GCM)',
        "algorithm": "AES",
        "mode": "GCM",
        "category": "Symmetric Encryption",
        "family": "AES",
        "default_severity": "informational",
        "confidence": "high",
        "title": "Python AES-GCM AEAD Encryption",
        "description": "AES in GCM mode via cryptography or PyCryptodome provides authenticated encryption.",
        "remediation": "Maintain 96-bit fresh nonces per encryption.",
        "quantum_vulnerable": False,
        "pqc_priority": "low",
        "api": "cryptography.hazmat.primitives.ciphers.aead.AESGCM"
    },
    {
        "id": "PY-AES-ECB",
        "lang": ["python"],
        "regex": r'(?:modes\.ECB|AES\.MODE_ECB)',
        "algorithm": "AES",
        "mode": "ECB",
        "category": "Symmetric Encryption",
        "family": "AES",
        "default_severity": "high",
        "confidence": "high",
        "title": "Python AES in Insecure ECB Mode",
        "description": "ECB mode encrypts blocks independently without an IV, leaking pattern information.",
        "remediation": "Switch to AESGCM or ChaCha20Poly1305.",
        "quantum_vulnerable": False,
        "pqc_priority": "immediate",
        "api": "cryptography.hazmat.primitives.ciphers.modes.ECB"
    },
    {
        "id": "PY-HASHLIB-MD5",
        "lang": ["python"],
        "regex": r'hashlib\.md5\s*\(',
        "algorithm": "MD5",
        "category": "Cryptographic Hash",
        "family": "MD5",
        "digest_size": 128,
        "default_severity": "critical",
        "confidence": "high",
        "title": "MD5 Usage in Python hashlib",
        "description": "MD5 is vulnerable to collision attacks and cannot be trusted for cryptographic validation.",
        "remediation": "Replace with hashlib.sha256() or hashlib.sha3_256().",
        "quantum_vulnerable": False,
        "pqc_priority": "immediate",
        "api": "hashlib.md5"
    },
    {
        "id": "PY-HASHLIB-SHA1",
        "lang": ["python"],
        "regex": r'hashlib\.sha1\s*\(',
        "algorithm": "SHA-1",
        "category": "Cryptographic Hash",
        "family": "SHA-1",
        "digest_size": 160,
        "default_severity": "high",
        "confidence": "high",
        "title": "SHA-1 Usage in Python hashlib",
        "description": "SHA-1 is deprecated for digital signatures and data integrity.",
        "remediation": "Upgrade to hashlib.sha256() or hashlib.sha384().",
        "quantum_vulnerable": False,
        "pqc_priority": "immediate",
        "api": "hashlib.sha1"
    },
    {
        "id": "PY-RSA-KEYGEN",
        "lang": ["python"],
        "regex": r'rsa\.generate_private_key\s*\(|RSA\.generate\s*\(',
        "algorithm": "RSA",
        "category": "Asymmetric / Public Key",
        "family": "RSA",
        "default_severity": "medium",
        "confidence": "high",
        "title": "Python RSA Key Generation",
        "description": "RSA key generation in Python. Vulnerable to Shor's algorithm on quantum computers.",
        "remediation": "Ensure key size is at least 2048 bits (3072 recommended). Plan PQC migration.",
        "quantum_vulnerable": True,
        "pqc_priority": "high",
        "api": "cryptography.hazmat.primitives.asymmetric.rsa"
    },

    # ------------------ JAVASCRIPT / TYPESCRIPT ------------------
    {
        "id": "JS-SUBTLE-AES-GCM",
        "lang": ["javascript", "typescript"],
        "regex": r'name\s*:\s*["\']AES-GCM["\']|subtle\.(?:encrypt|decrypt|generateKey)\s*\(\s*\{\s*name\s*:\s*["\']AES-GCM["\']',
        "algorithm": "AES",
        "mode": "GCM",
        "category": "Symmetric Encryption",
        "family": "AES",
        "default_severity": "informational",
        "confidence": "high",
        "title": "Web Crypto API AES-GCM Usage",
        "description": "Web Cryptography API using standard AES-GCM authenticated encryption.",
        "remediation": "Ensure random 12-byte IV is used for every subtle.encrypt call.",
        "quantum_vulnerable": False,
        "pqc_priority": "low",
        "api": "crypto.subtle"
    },
    {
        "id": "JS-NODE-CRYPTO-DES",
        "lang": ["javascript", "typescript"],
        "regex": r'crypto\.createCipheriv\s*\(\s*["\']des',
        "algorithm": "DES",
        "mode": "CBC",
        "category": "Symmetric Encryption",
        "family": "DES",
        "default_severity": "critical",
        "confidence": "high",
        "title": "Node.js Legacy DES Cipher Detected",
        "description": "Single DES key length is 56 bits and can be brute-forced in hours.",
        "remediation": "Replace with crypto.createCipheriv('aes-256-gcm', key, iv).",
        "quantum_vulnerable": False,
        "pqc_priority": "immediate",
        "api": "node:crypto"
    },
    {
        "id": "JS-SUBTLE-SHA1",
        "lang": ["javascript", "typescript"],
        "regex": r'name\s*:\s*["\']SHA-1["\']|createHash\s*\(\s*["\']sha1["\']',
        "algorithm": "SHA-1",
        "category": "Cryptographic Hash",
        "family": "SHA-1",
        "digest_size": 160,
        "default_severity": "high",
        "confidence": "high",
        "title": "SHA-1 in JavaScript / Node.js",
        "description": "SHA-1 is deprecated due to collision risks.",
        "remediation": "Replace with 'SHA-256' in subtle.digest or createHash('sha256').",
        "quantum_vulnerable": False,
        "pqc_priority": "immediate",
        "api": "crypto.subtle / node:crypto"
    }
]

# Key Size Extraction Patterns
KEY_SIZE_PATTERNS = [
    (r'keySize\s*[:=]\s*(\d+)', 1),
    (r'initialize\s*\(\s*(\d+)\s*\)', 1),
    (r'key_size\s*=\s*(\d+)', 1),
    (r'RSA\.generate\s*\(\s*(\d+)\s*\)', 1),
    (r'generate_private_key\s*\([^)]*key_size\s*=\s*(\d+)', 1),
    (r'["\'](?:AES|RSA|DES)-(\d+)["\']', 1),
]

def sanitize_code_snippet(line: str) -> str:
    """Safely redact secrets, passwords, or private key strings from snippets."""
    redacted = line.strip()
    # Mask private key blocks
    redacted = re.sub(r'-----BEGIN [A-Z ]+PRIVATE KEY-----.*?-----END [A-Z ]+PRIVATE KEY-----', '[REDACTED_PRIVATE_KEY]', redacted, flags=re.DOTALL)
    # Mask inline tokens / secret assignments
    redacted = re.sub(r'(password|secret|apikey|token|privateKey)\s*[:=]\s*["\'][^"\']+["\']', r'\1: "[REDACTED]"', redacted, flags=re.IGNORECASE)
    return redacted[:300]

def get_file_language(filename: str) -> Optional[str]:
    ext = os.path.splitext(filename)[1].lower()
    mapping = {
        '.java': 'java',
        '.kt': 'kotlin',
        '.py': 'python',
        '.js': 'javascript',
        '.jsx': 'javascript',
        '.ts': 'typescript',
        '.tsx': 'typescript',
    }
    return mapping.get(ext)

def scan_file_content(file_path: str, rel_path: str, content: str, lang: str) -> List[Dict[str, Any]]:
    findings = []
    lines = content.splitlines()

    for line_idx, line in enumerate(lines, start=1):
        for rule in DISCOVERY_RULES:
            if lang not in rule["lang"]:
                continue

            match = re.search(rule["regex"], line, re.IGNORECASE)
            if match:
                # Attempt to extract key size if near this context
                key_size = None
                key_size_str = "unknown"
                
                # Check current and next 3 lines for key size indicators
                context_chunk = "\n".join(lines[max(0, line_idx - 2):min(len(lines), line_idx + 3)])
                for kp, group_idx in KEY_SIZE_PATTERNS:
                    km = re.search(kp, context_chunk, re.IGNORECASE)
                    if km:
                        try:
                            val = int(km.group(group_idx))
                            if val in [56, 64, 128, 192, 256, 512, 1024, 2048, 3072, 4096]:
                                key_size = val
                                key_size_str = str(val)
                                break
                        except Exception:
                            pass

                # Dynamic severity adjustment based on verified key size
                severity = rule["default_severity"]
                if rule["algorithm"] == "RSA":
                    if key_size and key_size < 2048:
                        severity = "critical"
                        title = f"Legacy RSA-{key_size} Key Size Detected"
                        desc = f"RSA key size of {key_size} bits is cryptographically broken and does not meet the minimum modern standard of 2048/3072 bits."
                    elif key_size and key_size >= 3072:
                        severity = "informational"
                        title = f"Modern RSA-{key_size} Key Detected"
                        desc = f"RSA key size of {key_size} bits provides a strong classical security margin (128-bit equivalent)."
                    elif key_size == 2048:
                        severity = "low"
                        title = "RSA-2048 Key Detected"
                        desc = "RSA-2048 provides acceptable classical security through 2030, but requires planning for post-quantum migration."
                    else:
                        title = rule["title"]
                        desc = rule["description"]
                else:
                    title = rule["title"]
                    desc = rule["description"]

                finding = {
                    "rule_id": rule["id"],
                    "title": title,
                    "description": desc,
                    "category": rule["category"],
                    "algorithm": rule["algorithm"],
                    "mode": rule.get("mode"),
                    "padding": rule.get("padding"),
                    "key_size": key_size,
                    "key_size_str": key_size_str,
                    "digest_size": rule.get("digest_size"),
                    "curve": rule.get("curve"),
                    "file_path": rel_path,
                    "line_number": line_idx,
                    "code_snippet_redacted": sanitize_code_snippet(line),
                    "api_reference": rule.get("api"),
                    "language": lang,
                    "severity": severity,
                    "confidence": rule["confidence"],
                    "status": "open",
                    "quantum_vulnerable": rule.get("quantum_vulnerable", False),
                    "pqc_priority": rule.get("pqc_priority", "low"),
                    "remediation_deterministic": rule["remediation"],
                }
                findings.append(finding)

    return findings

def safe_extract_zip(zip_path: str, extract_to: str, max_files: int = 1000, max_total_size_mb: int = 100) -> List[str]:
    """Safely extract ZIP archive preventing Zip Slip, symlink attacks, and decompression bombs."""
    extracted_files = []
    total_size = 0
    max_bytes = max_total_size_mb * 1024 * 1024

    with zipfile.ZipFile(zip_path, 'r') as zf:
        # Check total file count
        infolist = zf.infolist()
        if len(infolist) > max_files:
            raise ValueError(f"Archive exceeds maximum file count limit ({max_files} files)")

        real_target_dir = os.path.realpath(extract_to)

        for member in infolist:
            # Check uncompressed size
            total_size += member.file_size
            if total_size > max_bytes:
                raise ValueError(f"Archive exceeds maximum uncompressed size limit ({max_total_size_mb} MB)")

            # Prevent Zip Slip / Path Traversal
            target_path = os.path.realpath(os.path.join(extract_to, member.filename))
            if not target_path.startswith(real_target_dir + os.sep) and target_path != real_target_dir:
                raise ValueError(f"Security Violation: Malicious path traversal detected in archive ({member.filename})")

            # Extract regular files only (ignore symlinks/FIFOs)
            if not member.is_dir():
                zf.extract(member, extract_to)
                extracted_files.append(target_path)

    return extracted_files

def scan_directory(target_dir: str) -> Dict[str, Any]:
    """Recursively scan a directory for cryptographic usage."""
    all_findings = []
    scanned_files = []

    for root, dirs, files in os.walk(target_dir):
        # Ignore node_modules, .git, venv, build artifacts
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'venv', '__pycache__', 'dist', 'build', '.gradle']]

        for file in files:
            file_path = os.path.join(root, file)
            lang = get_file_language(file)
            if not lang:
                continue

            try:
                rel_path = os.path.relpath(file_path, target_dir).replace('\\', '/')
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()

                findings = scan_file_content(file_path, rel_path, content, lang)
                scanned_files.append({
                    "file_path": rel_path,
                    "language": lang,
                    "size_bytes": os.path.getsize(file_path),
                    "findings_count": len(findings)
                })
                all_findings.extend(findings)
            except Exception as e:
                # Log non-fatal file read error
                print(f"Warning: Failed to read {file_path}: {e}", file=sys.stderr)

    # Aggregate metrics
    critical = sum(1 for f in all_findings if f["severity"] == "critical")
    high = sum(1 for f in all_findings if f["severity"] == "high")
    medium = sum(1 for f in all_findings if f["severity"] == "medium")
    low = sum(1 for f in all_findings if f["severity"] == "low")
    info = sum(1 for f in all_findings if f["severity"] == "informational")

    # Deterministic overall security score calculation (0 - 100)
    score_deduction = (critical * 25) + (high * 15) + (medium * 5) + (low * 1)
    overall_score = max(0, min(100, 100 - score_deduction))

    # PQC Readiness Score calculation
    q_vulnerable = sum(1 for f in all_findings if f["quantum_vulnerable"])
    q_safe = sum(1 for f in all_findings if not f["quantum_vulnerable"] and f["category"] in ["Symmetric Encryption", "Cryptographic Hash"])
    total_crypto = len(all_findings)
    if total_crypto == 0:
        pqc_score = 100
    else:
        pqc_score = max(10, min(100, int(((total_crypto - q_vulnerable) / total_crypto) * 100)))

    # Generate Crypto-BOM items
    crypto_bom = []
    seen_bom = set()
    for f in all_findings:
        bom_key = f"{f['algorithm']}:{f.get('mode') or ''}:{f['file_path']}"
        if bom_key not in seen_bom:
            seen_bom.add(bom_key)
            crypto_bom.append({
                "component_name": f"{f['algorithm']} in {os.path.basename(f['file_path'])}",
                "algorithm": f"{f['algorithm']}{('-' + f['mode']) if f.get('mode') else ''}",
                "category": f["category"],
                "purpose": "Data Confidentiality / Authentication",
                "location": f"{f['file_path']}:{f['line_number']}",
                "key_size_or_curve": f["key_size_str"],
                "security_status": "Recommended" if f["severity"] in ["informational", "low"] else ("Legacy / Weak" if f["severity"] == "medium" else "Critical Weakness"),
                "pqc_relevance": "Quantum Vulnerable (Shor's Algorithm)" if f["quantum_vulnerable"] else "Classical / Quantum Resistant",
                "is_quantum_safe": not f["quantum_vulnerable"],
                "risk_level": f["severity"].capitalize(),
                "evidence": f["code_snippet_redacted"]
            })

    return {
        "total_files": len(scanned_files),
        "total_findings": len(all_findings),
        "critical_count": critical,
        "high_count": high,
        "medium_count": medium,
        "low_count": low,
        "info_count": info,
        "overall_security_score": overall_score,
        "pqc_readiness_score": pqc_score,
        "scanned_files": scanned_files,
        "findings": all_findings,
        "crypto_bom": crypto_bom
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scanner.py <path_to_directory_or_zip>")
        sys.exit(1)

    target = sys.argv[1]
    if not os.path.exists(target):
        print(f"Error: Target path {target} does not exist", file=sys.stderr)
        sys.exit(1)

    temp_dir = None
    try:
        if zipfile.is_zipfile(target):
            temp_dir = os.path.join(os.path.dirname(target), f"tmp_scan_{uuid.uuid4().hex[:8]}")
            os.makedirs(temp_dir, exist_ok=True)
            safe_extract_zip(target, temp_dir)
            results = scan_directory(temp_dir)
        else:
            results = scan_directory(target)

        print(json.dumps(results, indent=2))
    finally:
        if temp_dir and os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)
