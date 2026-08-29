-- ============================================================
-- CRYPTOTOOL (ECDAT — SIH26164)
-- PostgreSQL / Supabase Migration Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    tier VARCHAR(50) DEFAULT 'enterprise',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Organization Members & Roles (RBAC)
-- Roles: 'owner', 'admin', 'analyst', 'viewer'
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'analyst', 'viewer')),
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 3. Assets Table
-- Types: 'source_code', 'uploaded_project', 'web_app', 'api', 'server', 'mobile_app', 'certificate_endpoint', 'other'
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'uploaded_project',
    url VARCHAR(500),
    repository_url VARCHAR(500),
    owner VARCHAR(255),
    environment VARCHAR(50) DEFAULT 'production' CHECK (environment IN ('production', 'staging', 'development', 'internal')),
    criticality VARCHAR(50) DEFAULT 'high' CHECK (criticality IN ('critical', 'high', 'medium', 'low')),
    exposure VARCHAR(50) DEFAULT 'internal' CHECK (exposure IN ('external', 'internal', 'hybrid', 'isolated')),
    tags JSONB DEFAULT '[]'::jsonb,
    is_demo BOOLEAN DEFAULT FALSE,
    authorization_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    last_scanned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Scans Table
-- Scan Types: 'source_code', 'tls_endpoint', 'full_audit', 'demo_scan'
-- Statuses: 'queued', 'extracting', 'discovering', 'analyzing', 'calculating_risk', 'ai_analysis', 'finalizing', 'completed', 'failed', 'cancelled'
CREATE TABLE IF NOT EXISTS scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    scan_type VARCHAR(50) NOT NULL DEFAULT 'source_code',
    status VARCHAR(50) NOT NULL DEFAULT 'queued',
    progress_percentage INT DEFAULT 0,
    current_step VARCHAR(255) DEFAULT 'Initializing scan environment',
    target_identifier VARCHAR(500),
    total_files_analyzed INT DEFAULT 0,
    total_findings_count INT DEFAULT 0,
    critical_count INT DEFAULT 0,
    high_count INT DEFAULT 0,
    medium_count INT DEFAULT 0,
    low_count INT DEFAULT 0,
    info_count INT DEFAULT 0,
    overall_security_score INT DEFAULT 100,
    pqc_readiness_score INT DEFAULT 100,
    is_demo BOOLEAN DEFAULT FALSE,
    logs JSONB DEFAULT '[]'::jsonb,
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Scan Files (Manifest of analyzed files)
CREATE TABLE IF NOT EXISTS scan_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    file_path VARCHAR(1000) NOT NULL,
    language VARCHAR(50),
    size_bytes BIGINT,
    findings_count INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'analyzed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Cryptographic Findings Table
-- Statuses: 'open', 'in_progress', 'accepted_risk', 'resolved', 'false_positive'
-- Severities: 'critical', 'high', 'medium', 'low', 'informational'
CREATE TABLE IF NOT EXISTS crypto_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    rule_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    algorithm VARCHAR(100) NOT NULL,
    mode VARCHAR(50),
    padding VARCHAR(50),
    key_size INT,
    key_size_str VARCHAR(50) DEFAULT 'unknown',
    digest_size INT,
    curve VARCHAR(100),
    protocol VARCHAR(50),
    file_path VARCHAR(1000),
    line_number INT,
    code_snippet_redacted TEXT,
    api_reference VARCHAR(255),
    language VARCHAR(50),
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'informational')),
    confidence VARCHAR(50) NOT NULL DEFAULT 'high' CHECK (confidence IN ('high', 'medium', 'low')),
    status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'accepted_risk', 'resolved', 'false_positive')),
    status_justification TEXT,
    quantum_vulnerable BOOLEAN DEFAULT FALSE,
    pqc_priority VARCHAR(50) DEFAULT 'low',
    remediation_deterministic TEXT,
    ai_remediation_suggestion TEXT,
    references JSONB DEFAULT '[]'::jsonb,
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Crypto-BOM / Cryptographic Components
CREATE TABLE IF NOT EXISTS crypto_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    component_name VARCHAR(255) NOT NULL,
    algorithm VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    location VARCHAR(1000) NOT NULL,
    key_size_or_curve VARCHAR(50) DEFAULT 'unknown',
    security_status VARCHAR(50) NOT NULL,
    pqc_relevance VARCHAR(100),
    is_quantum_safe BOOLEAN DEFAULT FALSE,
    risk_level VARCHAR(50) NOT NULL,
    evidence TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TLS & Certificate Inventory
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    scan_id UUID REFERENCES scans(id) ON DELETE SET NULL,
    endpoint VARCHAR(500) NOT NULL,
    tls_version VARCHAR(50) NOT NULL,
    cipher_suite VARCHAR(255),
    subject VARCHAR(500) NOT NULL,
    issuer VARCHAR(500) NOT NULL,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    days_until_expiry INT NOT NULL,
    public_key_algorithm VARCHAR(100) NOT NULL,
    public_key_size INT,
    signature_algorithm VARCHAR(100) NOT NULL,
    sans JSONB DEFAULT '[]'::jsonb,
    chain_status VARCHAR(50) DEFAULT 'valid',
    health_status VARCHAR(50) DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'expiring_soon', 'expired', 'legacy_config', 'insecure')),
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Risk Scores & Trends
CREATE TABLE IF NOT EXISTS risk_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    scan_id UUID REFERENCES scans(id) ON DELETE CASCADE,
    overall_score INT NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
    pqc_score INT NOT NULL CHECK (pqc_score BETWEEN 0 AND 100),
    algorithm_strength_score INT NOT NULL,
    key_hygiene_score INT NOT NULL,
    protocol_security_score INT NOT NULL,
    certificate_health_score INT NOT NULL,
    calculation_breakdown JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Post-Quantum Cryptography (PQC) Assessment Matrix
CREATE TABLE IF NOT EXISTS pqc_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    scan_id UUID REFERENCES scans(id) ON DELETE CASCADE,
    readiness_score INT NOT NULL CHECK (readiness_score BETWEEN 0 AND 100),
    quantum_sensitive_count INT DEFAULT 0,
    quantum_safe_count INT DEFAULT 0,
    high_priority_migration_count INT DEFAULT 0,
    assessment_matrix JSONB DEFAULT '[]'::jsonb,
    nist_target_standards JSONB DEFAULT '["FIPS 203 (ML-KEM)", "FIPS 204 (ML-DSA)", "FIPS 205 (SLH-DSA)"]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AI Analysis & Chat Explanations
CREATE TABLE IF NOT EXISTS ai_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    scan_id UUID REFERENCES scans(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    finding_id UUID REFERENCES crypto_findings(id) ON DELETE CASCADE,
    prompt_context JSONB,
    executive_summary TEXT,
    technical_explanation TEXT,
    business_impact TEXT,
    remediation_roadmap TEXT,
    pqc_migration_path TEXT,
    confidence_notes TEXT,
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Assessment Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    scan_id UUID REFERENCES scans(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) DEFAULT 'executive_summary',
    format VARCHAR(20) DEFAULT 'pdf',
    file_path VARCHAR(1000),
    file_size_bytes BIGINT,
    generated_by VARCHAR(255),
    summary_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Audit Logs Table (Tamper-evident activity trail)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'critical', 'success')),
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_assets_org ON assets(organization_id);
CREATE INDEX IF NOT EXISTS idx_scans_asset ON scans(asset_id);
CREATE INDEX IF NOT EXISTS idx_scans_org ON scans(organization_id);
CREATE INDEX IF NOT EXISTS idx_findings_scan ON crypto_findings(scan_id);
CREATE INDEX IF NOT EXISTS idx_findings_asset ON crypto_findings(asset_id);
CREATE INDEX IF NOT EXISTS idx_findings_severity ON crypto_findings(severity);
CREATE INDEX IF NOT EXISTS idx_components_asset ON crypto_components(asset_id);
CREATE INDEX IF NOT EXISTS idx_certificates_org ON certificates(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_org ON audit_logs(organization_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE pqc_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current authenticated user belongs to org
CREATE OR REPLACE FUNCTION is_org_member(target_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = target_org_id
      AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policy: Users can select their organizations
CREATE POLICY org_member_select ON organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = organizations.id
              AND organization_members.user_id = auth.uid()
        )
    );

-- RLS Policy: Assets accessible only to member organizations
CREATE POLICY assets_org_policy ON assets
    FOR ALL USING (is_org_member(organization_id));

-- RLS Policy: Scans accessible only to member organizations
CREATE POLICY scans_org_policy ON scans
    FOR ALL USING (is_org_member(organization_id));

-- RLS Policy: Crypto Findings accessible only to member organizations
CREATE POLICY findings_org_policy ON crypto_findings
    FOR ALL USING (is_org_member(organization_id));

-- RLS Policy: Components / BOM accessible only to member organizations
CREATE POLICY components_org_policy ON crypto_components
    FOR ALL USING (is_org_member(organization_id));

-- RLS Policy: Certificates accessible only to member organizations
CREATE POLICY certificates_org_policy ON certificates
    FOR ALL USING (is_org_member(organization_id));

-- RLS Policy: Reports accessible only to member organizations
CREATE POLICY reports_org_policy ON reports
    FOR ALL USING (is_org_member(organization_id));

-- RLS Policy: Audit logs accessible to member organizations (analysts & admins)
CREATE POLICY audit_logs_org_policy ON audit_logs
    FOR SELECT USING (is_org_member(organization_id));
