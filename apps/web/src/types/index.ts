export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'informational';
export type FindingStatus = 'open' | 'in_progress' | 'accepted_risk' | 'resolved' | 'false_positive';
export type ScanStatus = 'queued' | 'extracting' | 'discovering' | 'analyzing' | 'calculating_risk' | 'ai_analysis' | 'finalizing' | 'completed' | 'failed' | 'cancelled';
export type AssetType = 'source_code' | 'uploaded_project' | 'web_app' | 'api' | 'server' | 'mobile_app' | 'certificate_endpoint' | 'binary_firmware' | 'container_image' | 'cloud_kms' | 'other';
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
  code_diff_suggestion?: {
    original: string;
    replacement: string;
    explanation: string;
  };
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

export interface KeyMetadataEntry {
  id: string;
  organization_id: string;
  asset_id: string;
  asset_name: string;
  key_alias: string;
  key_type: 'asymmetric_private' | 'asymmetric_public' | 'symmetric' | 'hmac' | 'secret_token';
  algorithm: string;
  key_size: number;
  owner: string;
  application: string;
  creation_date: string;
  expiration_date: string;
  last_rotated_date?: string;
  rotation_status: 'compliant' | 'near_expiry' | 'overdue' | 'never_rotated';
  storage_location: 'AWS KMS (HSM)' | 'Azure Key Vault' | 'GCP Cloud KMS' | 'Android Keystore / StrongBox' | 'PKCS#11 HSM' | 'Software File (Insecure)';
  is_quantum_vulnerable: boolean;
  pqc_candidate?: string;
  data_sensitivity: 'Top Secret / Government' | 'Financial / PCI-DSS' | 'Personal Data (GDPR/DPDP)' | 'Operational / Internal';
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

// ─── Digital Twin Types (THE WOW FACTOR) ─────────────────────────────────────
export type DigitalTwinNodeType = 'enterprise' | 'app' | 'server' | 'cloud' | 'crypto' | 'quantum_threat' | 'pqc_solution';

export interface DigitalTwinNode {
  id: string;
  label: string;
  type: DigitalTwinNodeType;
  category: string;
  status: 'critical' | 'high' | 'medium' | 'safe' | 'pqc_ready';
  x: number;
  y: number;
  details: {
    algorithm?: string;
    usage?: string;
    key_size?: string;
    quantum_status: 'Vulnerable' | 'Resistant' | 'Protected';
    data_sensitivity: 'Critical' | 'High' | 'Medium' | 'Low';
    data_lifetime_years: number;
    migration_time_years: number;
    hndl_risk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    business_criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    recommended_pqc: string;
    hybrid_candidate: string;
    migration_difficulty: 'LOW' | 'MEDIUM' | 'HIGH' | 'COMPLEX';
    estimated_cost_inr: string;
    priority: 'P0' | 'P1' | 'P2' | 'P3';
    affected_files?: string[];
    affected_services?: string[];
  };
}

export interface DigitalTwinEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  style?: 'dashed' | 'solid';
  color?: string;
}

export interface DigitalTwinGraph {
  nodes: DigitalTwinNode[];
  edges: DigitalTwinEdge[];
  summary: {
    total_nodes: number;
    vulnerable_nodes: number;
    pqc_ready_nodes: number;
    highest_risk_node: string;
    overall_posture: string;
  };
}

// ─── Mosca Theorem & Quantum Risk Types ─────────────────────────────────────
export interface MoscaSimulationParams {
  data_lifetime_X: number; // X in years
  migration_time_Y: number; // Y in years
  crqc_arrival_Z: number;   // Z (e.g. 2035 - current_year)
}

export interface MoscaRiskResult {
  data_lifetime_X: number;
  migration_time_Y: number;
  time_until_crqc_Z: number;
  crqc_year: number;
  sum_XY: number;
  is_vulnerable: boolean;
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  headline: string;
  explanation: string;
  action_required: string;
}

export interface HNDLRiskRecord {
  id: string;
  asset_name: string;
  data_classification: string;
  algorithm: string;
  key_size: number;
  data_retention_years: number;
  estimated_migration_years: number;
  hndl_threat_score: number; // 0 - 100
  hndl_status: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommended_immediate_action: string;
}

// ─── PQC Benchmarking Lab & Performance Types ────────────────────────────────
export interface PQCBenchmarkItem {
  algorithm: string;
  type: 'KEM' | 'Signature';
  standard: 'FIPS 203' | 'FIPS 204' | 'FIPS 205' | 'NIST Selected Round 4';
  security_category: number; // NIST Level 1, 3, 5
  public_key_bytes: number;
  ciphertext_or_sig_bytes: number;
  secret_key_bytes: number;
  keygen_cpu_cycles_k: number;
  encaps_or_sign_cpu_cycles_k: number;
  decaps_or_verify_cpu_cycles_k: number;
  estimated_latency_ms: number;
  memory_peak_kb: number;
  status: 'Standardized' | 'Selected';
}

export interface PerformanceImpactComparison {
  classical_algorithm: string;
  classical_latency_ms: number;
  classical_pubkey_bytes: number;
  classical_overhead_bytes: number;
  pqc_algorithm: string;
  pqc_latency_ms: number;
  pqc_pubkey_bytes: number;
  pqc_overhead_bytes: number;
  latency_multiplier: number;
  bandwidth_multiplier: number;
  handshake_fragmentation_risk: boolean;
  recommendation: string;
}

export interface MigrationCostParams {
  num_applications: number;
  num_certificates: number;
  num_hardware_hsms: number;
  developer_hourly_rate_inr: number;
  estimated_developer_days_per_app: number;
}

export interface MigrationCostResult {
  developer_effort_cost_inr: number;
  infrastructure_upgrade_inr: number;
  certificate_replacement_inr: number;
  hardware_hsm_upgrade_inr: number;
  testing_audit_cost_inr: number;
  total_estimated_cost_inr: number;
  total_estimated_cost_formatted: string;
  total_estimated_cost_usd_formatted: string;
  roi_risk_reduction_percentage: number;
}

export interface CryptoAgilityScore {
  overall_score: number; // 0 - 100
  rating: 'High Agility' | 'Moderate Agility' | 'Low Agility' | 'Hardcoded / Inflexible';
  breakdown: {
    abstraction_layer_score: number;
    dynamic_cipher_negotiation: number;
    key_management_decoupling: number;
    automated_cert_rotation: number;
    config_driven_crypto: number;
  };
  recommendations: string[];
}

// ─── Standardized CycloneDX 1.6 / SPDX 3.0 CBOM ─────────────────────────────
export interface CycloneDXCBOM {
  bomFormat: 'CycloneDX';
  specVersion: '1.6';
  serialNumber: string;
  version: number;
  metadata: {
    timestamp: string;
    tools: { vendor: string; name: string; version: string }[];
    component: {
      type: string;
      name: string;
      version: string;
    };
  };
  cryptoProperties: {
    assetRef: string;
    algorithms: {
      name: string;
      mode?: string;
      padding?: string;
      keySize?: number;
      curve?: string;
      primitive: 'symmetric' | 'asymmetric' | 'hash' | 'kem' | 'signature' | 'kdf';
      quantumSecurity: 'quantum_vulnerable' | 'quantum_safe' | 'quantum_hybrid';
      classicalSecurityBits: number;
      compliance: string[];
    }[];
    certificates: {
      subject: string;
      issuer: string;
      algorithm: string;
      keySize: number;
      expiry: string;
    }[];
    dependencies: {
      library: string;
      version: string;
      vulnerabilitiesCount: number;
    }[];
  };
}

// ─── Crypto Testing & Supply Chain Types ─────────────────────────────────────
export interface CryptoStrengthMatrixItem {
  primitive: string;
  family: string;
  classical_status: 'Secure' | 'Acceptable (Legacy)' | 'Deprecated' | 'Broken';
  quantum_status: 'Quantum Resistant' | 'Quantum Vulnerable (Shor)' | 'Quantum Halved (Grover)' | 'Broken';
  nist_standard_ref: string;
  recommended_pqc_alternative: string;
  urgency: 'P0' | 'P1' | 'P2' | 'P3' | 'Compliant';
}

export interface AssessmentReport {
  id: string;
  organization_id: string;
  asset_id: string;
  scan_id: string;
  title: string;
  report_type: string;
  format: 'pdf' | 'json' | 'cyclonedx';
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
