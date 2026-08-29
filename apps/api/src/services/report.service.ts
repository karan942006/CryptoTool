import { v4 as uuidv4 } from 'uuid';
import { store } from '../store.js';
import { AssessmentReport, Scan, Asset } from '../types.js';

export function generateReport(scanId: string, reportTitle?: string, generatedBy: string = 'Security Analyst'): AssessmentReport {
  const scan = store.scans.get(scanId);
  if (!scan) {
    throw new Error(`Scan ${scanId} not found`);
  }

  const asset = store.assets.get(scan.asset_id);
  const org = store.organizations.get(scan.organization_id);

  const findings = Array.from(store.findings.values()).filter(f => f.scan_id === scanId);
  const components = Array.from(store.components.values()).filter(f => f.scan_id === scanId);
  const certs = Array.from(store.certificates.values()).filter(c => c.asset_id === scan.asset_id);

  const summaryData = {
    metadata: {
      report_id: uuidv4(),
      title: reportTitle || `Cryptographic Assessment Report: ${asset?.name || 'Asset'}`,
      generated_at: new Date().toISOString(),
      generated_by: generatedBy,
      organization: org?.name || 'Authorized Enterprise',
      asset_name: asset?.name || 'Unknown Asset',
      asset_type: asset?.type || 'source_code',
      environment: asset?.environment || 'production',
      criticality: asset?.criticality || 'high',
      exposure: asset?.exposure || 'external',
      scan_date: scan.completed_at || scan.started_at,
    },
    scores: {
      overall_security_score: scan.overall_security_score,
      pqc_readiness_score: scan.pqc_readiness_score,
      critical_count: scan.critical_count,
      high_count: scan.high_count,
      medium_count: scan.medium_count,
      low_count: scan.low_count,
      info_count: scan.info_count,
      total_findings: scan.total_findings_count,
      total_files: scan.total_files_analyzed,
    },
    executive_summary: scan.overall_security_score >= 80
      ? `The cryptographic posture for ${asset?.name} demonstrates robust modern security practices. Primitives such as authenticated AES-GCM and SHA-256 adhere to current NIST recommendations. Post-quantum migration planning is recommended for public key components.`
      : `The assessment identified critical legacy cryptographic vulnerabilities in ${asset?.name} that fail to meet baseline enterprise standards. Obsolete algorithms (e.g. RSA-1024, SHA-1, 3DES) require prioritized replacement to prevent data compromise and audit failures.`,
    remediation_roadmap: [
      { priority: 1, action: 'Disable obsolete TLS versions (TLS 1.0/1.1) and re-issue expired/SHA-1 certificates.', timeframe: 'Immediate (< 7 days)' },
      { priority: 2, action: 'Upgrade all asymmetric key lengths to minimum 2048-bit (3072-bit recommended) and remove RSA-1024.', timeframe: 'Urgent (< 30 days)' },
      { priority: 3, action: 'Replace MD5 and SHA-1 in cryptographic checksums and digital signatures with SHA-256.', timeframe: 'High (< 60 days)' },
      { priority: 4, action: 'Eliminate AES-ECB mode; migrate to authenticated AES-256-GCM or ChaCha20-Poly1305.', timeframe: 'Medium (< 90 days)' },
      { priority: 5, action: 'Develop Post-Quantum Cryptography (PQC) migration inventory referencing NIST FIPS 203/204.', timeframe: 'Strategic (2026-2028)' },
    ],
    crypto_bom: components,
    findings: findings,
    certificates: certs,
  };

  const report: AssessmentReport = {
    id: uuidv4(),
    organization_id: scan.organization_id,
    asset_id: scan.asset_id,
    scan_id: scan.id,
    title: summaryData.metadata.title,
    report_type: 'executive_assessment',
    format: 'json',
    generated_by: generatedBy,
    summary_data: summaryData,
    created_at: new Date().toISOString(),
  };

  store.reports.set(report.id, report);
  store.addAuditLog(
    generatedBy,
    'GENERATE_REPORT',
    'report',
    report.id,
    { scan_id: scan.id, asset_id: scan.asset_id, title: report.title }
  );

  return report;
}
