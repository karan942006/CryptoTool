# CryptoTool — Enterprise Cryptographic Discovery & Analysis Tool (ECDAT)
### Smart India Hackathon 2026 — Problem Statement ID: SIH26164

> **Discover. Analyze. Quantify. Modernize.**

CryptoTool (ECDAT) is an authorized enterprise-grade cybersecurity platform that discovers cryptographic usage across source-code repositories, application archives, and infrastructure endpoints. It normalizes primitives into a centralized **Crypto-BOM (Cryptographic Bill of Materials)**, calculates **deterministic security risk scores** (with zero AI hallucinations), evaluates **Post-Quantum Cryptography (PQC) readiness** against NIST standards (FIPS 203 ML-KEM, FIPS 204 ML-DSA), and provides **AI-assisted explanations** and executive PDF assessment reports.

---

## 🏛️ 1. SIH26164 Problem Statement Alignment

| SIH26164 Requirement | CryptoTool Implementation |
| :--- | :--- |
| **Cryptographic Discovery** | Multi-language AST & pattern discovery for Java/Kotlin, Python, JavaScript/TypeScript + safe TLS 1.0-1.3 & X.509 certificate handshake inspection. |
| **Crypto-BOM Generation** | Full inventory of algorithms, modes, key sizes, curves, and locations with instant JSON & CSV export. |
| **Deterministic Risk Engine** | Strict scoring based on NIST SP 800-57/131A guidelines and transparent mathematical formulas ("Why this score?"). |
| **Post-Quantum (PQC) Readiness** | Shor & Grover algorithm vulnerability matrix, ML-KEM/ML-DSA migration candidates, and 4-phase transition roadmap. |
| **AI Security Analyst** | Context-grounded Gemini 1.5 Flash integration explaining verified technical findings without inventing CVEs or key lengths. |
| **Executive Reporting** | Print/PDF generation with executive summary, Crypto-BOM, findings breakdown, and prioritized remediation roadmap. |
| **Reference Application** | **CryptoTalk** integrated as the reference secure messaging application to validate cryptographic posture. |

---

## ⚡ 2. Architecture & System Flow

```
                      ENTERPRISE / GOV TARGETS
       ┌─────────────────────────┼─────────────────────────┐
       ▼                         ▼                         ▼
Source Archives (.zip)    HTTPS Endpoints         Mobile / APIs
       │                         │                         │
       └─────────────────────────┼─────────────────────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │ Python Scanner Engine │
                     │  - AST Code Inspector │
                     │  - TLS / Cert Auditor │
                     │  - Secret Redactor    │
                     └───────────┬───────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │ Crypto Normalization  │
                     │  & Knowledge Base     │
                     └───────────┬───────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │ Deterministic Rules   │
                     │  & Risk Engine        │
                     └───────────┬───────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            ▼                    ▼                    ▼
     PostgreSQL/Supabase    Gemini AI Analyst    Crypto-BOM
      (Tenant Isolated)     (Grounded Model)   (JSON / CSV)
            │                    │                    │
            └────────────────────┼────────────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │ React 18 Cyber Console  │
                    │  - 27 Dedicated Pages   │
                    │  - Real-Time Pipelines  │
                    │  - PDF Report Generator │
                    └─────────────────────────┘
```

---

## 🚀 3. Quick Start & Local Setup

### Prerequisites
- **Node.js**: v20.x or v24.x LTS (`node -v`)
- **Python**: v3.11 or v3.12 (`python --version`)
- **Git**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/enterprise/CryptoTool.git
   cd CryptoTool
   ```

2. **Install all dependencies**:
   ```bash
   npm install --prefix apps/api
   npm install --prefix apps/web
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Start the Development Platform**:
   - In terminal 1 (Backend API):
     ```bash
     cd apps/api
     npm run dev
     ```
   - In terminal 2 (Frontend Web Console):
     ```bash
     cd apps/web
     npm run dev
     ```
   - Open browser at `http://localhost:5173`.

---

## 🎯 4. Demonstration Scenarios (SIH Demo Workflow)

CryptoTool includes two built-in reference target environments:

### Demo 1: Analyze Reference Secure App (CryptoTalk)
1. Navigate to the **Main Dashboard** or click **Analyze CryptoTalk** in the sidebar.
2. The scanner extracts `CryptoTalkManager.java` and identifies:
   - `AES-256-GCM` (Authenticated AEAD)
   - `X25519 / ECDH` (Forward-secret key agreement)
   - `Android Keystore (StrongBox)` (Hardware key isolation)
   - `SHA-256` (FIPS 180-4 standard digest)
3. Deterministic score calculated: **100/100**.
4. Post-Quantum assessment notes: ECDH is quantum-sensitive; hybrid ML-KEM migration recommended.

### Demo 2: Analyze Legacy Vulnerable Target (Legacy Banking API)
1. Click **Analyze Legacy Banking API Core** on the dashboard.
2. The scanner discovers:
   - `RSA-1024` (Critical — under 80 bits of security)
   - `MD5` & `SHA-1` (Critical/High — collision vulnerability)
   - `3DES-CBC` (High — Sweet32 64-bit block collision)
   - `AES-ECB` (High — pattern leakage)
   - `TLS 1.0` (Critical — deprecated by RFC 8996)
3. Deterministic score calculated: **35/100 (Critical Risk)**.
4. Generates prioritized remediation roadmap (P1: TLS 1.0, P2: RSA-1024, P3: SHA-1/MD5, P4: AES-ECB).
5. Click **Generate PDF Report** to view and print the executive summary.

---

## 🛡️ 5. Security & Safety Principles

1. **Zero Execution Policy**: Source code is parsed strictly as static text and AST tokens; uploaded scripts are never executed.
2. **Zip Slip & Path Traversal Protection**: Archive extraction validates canonical destination boundaries and prevents `../` path traversals or symlink attacks.
3. **Secret Redaction**: Embedded private keys, tokens, and credential strings are automatically masked with `[REDACTED]` before storage or AI ingestion.
4. **Tenant Isolation**: Row Level Security (RLS) policies enforce organization boundary access control.
5. **No AI Hallucinations**: All technical findings (algorithm, line number, key size, severity) are deterministically produced by the scanner engine; AI only explains verified findings.

---

## 📄 6. License
Licensed under the Apache License, Version 2.0.
