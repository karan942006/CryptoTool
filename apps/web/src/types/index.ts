export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'informational';
export type FindingStatus = 'open' | 'in_progress' | 'accepted_risk' | 'resolved' | 'false_positive';
export type ScanStatus = 'queued' | 'extracting' | 'discovering' | 'analyzing' | 'calculating_risk' | 'ai_analysis' | 'finalizing' | 'completed' | 'failed' | 'cancelled';
export type AssetType = 'source_code' | 'uploaded_project' | 'web_app' | 'api' | 'server' | 'mobile_app' | 'certificate_endpoint' | 'other';
export type UserRole = 'owner' | 'admin' | 'analyst' | 'viewer';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  tier: string;
  created_at: string;
  updated_at: string;
}

export interface UserMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: UserRole;
  email: string;
  full_name: string;
  created_at: string;
}

export interface Asset {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  type: AssetType;
  url?: string;
  repository_url?: string;
  owner: string;
  environment: 'production' | 'staging' | 'development' | 'internal';
  criticality: 'critical' | 'high' | 'medium' | 'low';
  exposure: 'external' | 'internal' | 'hybrid' | 'isolated';
  tags: string[];
  is_demo: boolean;
  authorization_confirmed: boolean;
  last_scanned_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Scan {
  id: string;
  organization_id: string;
  asset_id: string;
  asset_name?: string;
  scan_type: string;
  status: ScanStatus;
  progress_percentage: number;
  current_step: string;
  target_identifier: string;
  total_files_analyzed: number;
  total_findings_count: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  info_count: number;
  overall_security_score: number;
  pqc_readiness_score: number;
  is_demo: boolean;
  logs: { timestamp: string; message: string; level: 'info' | 'warn' | 'error' }[];
  error_message?: string;
  started_at: string;
  completed_at?: string;
  created_at: string;
}

export interface CryptoFinding {
  id: string;
  scan_id: string;
  asset_id: string;
  asset_name?: string;
  organization_id: string;
  rule_id: string;
  title: string;
  description: string;
  category: string;
  algorithm: string;
  mode?: string;
  padding?: string;
  key_size?: number | null;
  key_size_str?: string;
  digest_size?: number | null;
  curve?: string | null;
  protocol?: string;
  file_path: string;
  line_number: number;
  code_snippet_redacted: string;
  api_reference?: string;
  language: string;
  severity: Severity;
  confidence: 'high' | 'medium' | 'low';
  status: FindingStatus;
  status_justification?: string;
  quantum_vulnerable: boolean;
  pqc_priority: 'immediate' | 'high' | 'medium' | 'low';
  remediation_deterministic: string;
  ai_remediation_suggestion?: string;
  references?: string[];
  is_demo: boolean;
  created_at: string;
}

export interface CryptoBOMComponent {
  id: string;
  scan_id: string;
  asset_id: string;
  asset_name?: string;
  organization_id: string;
  component_name: string;
  algorithm: string;
  category: string;
  purpose: string;
  location: string;
  key_size_or_curve: string;
  security_status: string;
  pqc_relevance: string;
  is_quantum_safe: boolean;
  risk_level: string;
  evidence: string;
  created_at: string;
}

export interface CertificateEntry {
  id: string;
  organization_id: string;
  asset_id: string;
  scan_id?: string;
  endpoint: string;
  tls_version: string;
  cipher_suite: string;
  subject: string;
  issuer: string;
  valid_from: string;
  valid_until: string;
  days_until_expiry: number;
  public_key_algorithm: string;
  public_key_size: number;
  signature_algorithm: string;
  sans: string[];
  chain_status: string;
  health_status: 'healthy' | 'expiring_soon' | 'expired' | 'legacy_config' | 'insecure';
  is_demo: boolean;
  created_at: string;
}

export interface RiskOverview {
  overall_score: number;
  pqc_score: number;
  total_assets: number;
  assets_scanned: number;
  total_crypto_instances: number;
  critical_findings: number;
  high_findings: number;
  medium_findings: number;
  low_findings: number;
  info_findings: number;
  severity_distribution: { name: string; value: number; color: string }[];
  algorithm_distribution: { name: string; count: number }[];
  risk_trends: { date: string; score: number; legacy_count: number }[];
  score_breakdown: {
    algorithm_strength: number;
    key_hygiene: number;
    protocol_security: number;
    certificate_health: number;
    pqc_margin: number;
  };
}

export interface PQCReadinessOverview {
  readiness_score: number;
  quantum_sensitive_count: number;
  quantum_safe_count: number;
  high_priority_migration_count: number;
  components: {
    algorithm: string;
    category: string;
    quantum_threat: string;
    impact: 'High' | 'Medium' | 'Low';
    pqc_replacement: string;
    standard_reference: string;
    instances_count: number;
  }[];
  migration_roadmap: {
    phase: string;
    target: string;
    action: string;
    nist_guideline: string;
  }[];
}

export interface AssessmentReport {
  id: string;
  organization_id: string;
  asset_id: string;
  scan_id: string;
  title: string;
  report_type: string;
  format: 'pdf' | 'json';
  generated_by: string;
  summary_data: any;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  organization_id: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: any;
  ip_address: string;
  created_at: string;
}
