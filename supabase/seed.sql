-- ============================================================
-- CRYPTOTOOL (ECDAT — SIH26164)
-- Initial Seed Fixtures & Reference Datasets
-- ============================================================

-- 1. Demo Organization
INSERT INTO organizations (id, name, slug, description, tier)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'National Cyber Defense Agency',
    'national-cyber-defense',
    'Authorized Enterprise Security Assessment Unit (SIH26164 Demonstration Tenant)',
    'enterprise'
) ON CONFLICT (id) DO NOTHING;

-- 2. Demo User / Members
INSERT INTO organization_members (id, organization_id, user_id, role, email, full_name)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'owner',
    'admin@cryptotool.internal',
    'Chief Security Officer'
) ON CONFLICT (id) DO NOTHING;

-- 3. Assets: Reference Systems
-- Asset 1: CryptoTalk (Secure Reference System)
INSERT INTO assets (
    id, organization_id, name, description, type, url, repository_url,
    owner, environment, criticality, exposure, tags, is_demo, authorization_confirmed, last_scanned_at
) VALUES (
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'CryptoTalk Secure Messenger',
    'Reference secure end-to-end encrypted messaging application utilizing AES-256-GCM, Android Keystore, and X25519/ECDH.',
    'mobile_app',
    'https://cryptotalk.internal',
    'https://github.com/enterprise/cryptotalk-app',
    'Mobile Cryptography Team',
    'production',
    'critical',
    'external',
    '["mobile", "e2ee", "android", "messaging", "reference-app"]'::jsonb,
    TRUE,
    TRUE,
    NOW() - INTERVAL '2 hours'
) ON CONFLICT (id) DO NOTHING;

-- Asset 2: Legacy Banking API (Vulnerable / Legacy System)
INSERT INTO assets (
    id, organization_id, name, description, type, url, repository_url,
    owner, environment, criticality, exposure, tags, is_demo, authorization_confirmed, last_scanned_at
) VALUES (
    'd0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Legacy Banking API Service',
    'Core transactional API service with legacy cryptographic algorithms (RSA-1024, SHA-1, 3DES, TLS 1.0).',
    'api',
    'https://api.legacybanking.internal',
    'https://github.com/enterprise/legacy-banking-api',
    'Core Banking Infrastructure',
    'production',
    'critical',
    'external',
    '["api", "banking", "legacy", "pci-scope"]'::jsonb,
    TRUE,
    TRUE,
    NOW() - INTERVAL '5 hours'
) ON CONFLICT (id) DO NOTHING;

-- Asset 3: Government Employee Portal
INSERT INTO assets (
    id, organization_id, name, description, type, url, repository_url,
    owner, environment, criticality, exposure, tags, is_demo, authorization_confirmed, last_scanned_at
) VALUES (
    'd0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'Government Employee Portal',
    'Internal identity, authentication, and HR management portal.',
    'web_app',
    'https://portal.mahadoc.gov.in',
    NULL,
    'E-Governance Team',
    'production',
    'high',
    'internal',
    '["portal", "e-gov", "auth", "sso"]'::jsonb,
    TRUE,
    TRUE,
    NOW() - INTERVAL '1 day'
) ON CONFLICT (id) DO NOTHING;

-- Asset 4: Secure Document Vault
INSERT INTO assets (
    id, organization_id, name, description, type, url, repository_url,
    owner, environment, criticality, exposure, tags, is_demo, authorization_confirmed, last_scanned_at
) VALUES (
    'd0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'Secure Document Vault Microservice',
    'Encrypted file storage microservice using AES-256-CBC, RSA-3072, and SHA-384.',
    'server',
    'https://vault.internal.infra',
    'https://github.com/enterprise/doc-vault',
    'Cloud Security Team',
    'staging',
    'medium',
    'internal',
    '["vault", "storage", "encryption", "microservice"]'::jsonb,
    TRUE,
    TRUE,
    NOW() - INTERVAL '3 days'
) ON CONFLICT (id) DO NOTHING;
