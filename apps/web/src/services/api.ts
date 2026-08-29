import {
  Asset,
  Scan,
  CryptoFinding,
  CryptoBOMComponent,
  CertificateEntry,
  RiskOverview,
  PQCReadinessOverview,
  AssessmentReport,
  AuditLogEntry,
  Organization,
  UserMember
} from '../types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<{ status: string; ai_configured: boolean }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchOrganizations(): Promise<Organization[]> {
  const res = await fetch(`${API_BASE}/organizations`);
  if (!res.ok) throw new Error('Failed to fetch organizations');
  return res.json();
}

export async function fetchAuthMe(): Promise<{ user: UserMember; organization: Organization }> {
  const res = await fetch(`${API_BASE}/auth/me`);
  if (!res.ok) throw new Error('Failed to fetch current user');
  return res.json();
}

export async function fetchAssets(): Promise<Asset[]> {
  const res = await fetch(`${API_BASE}/assets`);
  if (!res.ok) throw new Error('Failed to fetch assets');
  return res.json();
}

export async function fetchAssetById(id: string): Promise<Asset> {
  const res = await fetch(`${API_BASE}/assets/${id}`);
  if (!res.ok) throw new Error('Failed to fetch asset');
  return res.json();
}

export async function createAsset(data: Partial<Asset>): Promise<Asset> {
  const res = await fetch(`${API_BASE}/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create asset');
  }
  return res.json();
}

export async function deleteAsset(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/assets/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete asset');
}

export async function fetchScans(): Promise<Scan[]> {
  const res = await fetch(`${API_BASE}/scans`);
  if (!res.ok) throw new Error('Failed to fetch scans');
  return res.json();
}

export async function fetchScanById(id: string): Promise<Scan> {
  const res = await fetch(`${API_BASE}/scans/${id}`);
  if (!res.ok) throw new Error('Failed to fetch scan details');
  return res.json();
}

export async function uploadAndScanZip(formData: FormData): Promise<{ scan_id: string; asset_id: string }> {
  const res = await fetch(`${API_BASE}/scans/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to upload archive');
  }
  return res.json();
}

export async function triggerScan(data: { asset_id?: string; scan_type?: string; target_url?: string; demo_target?: string }): Promise<{ scan_id: string }> {
  const res = await fetch(`${API_BASE}/scans/trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to trigger scan');
  }
  return res.json();
}

export async function cancelScan(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/scans/${id}/cancel`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to cancel scan');
}

export async function fetchFindings(params?: { asset_id?: string; scan_id?: string; severity?: string; status?: string; search?: string }): Promise<CryptoFinding[]> {
  const query = new URLSearchParams();
  if (params?.asset_id) query.set('asset_id', params.asset_id);
  if (params?.scan_id) query.set('scan_id', params.scan_id);
  if (params?.severity) query.set('severity', params.severity);
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);

  const res = await fetch(`${API_BASE}/findings?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch findings');
  return res.json();
}

export async function fetchFindingById(id: string): Promise<CryptoFinding> {
  const res = await fetch(`${API_BASE}/findings/${id}`);
  if (!res.ok) throw new Error('Failed to fetch finding');
  return res.json();
}

export async function updateFindingStatus(id: string, status: string, justification?: string): Promise<CryptoFinding> {
  const res = await fetch(`${API_BASE}/findings/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, justification }),
  });
  if (!res.ok) throw new Error('Failed to update finding status');
  return res.json();
}

export async function fetchCryptoInventory(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/crypto-inventory`);
  if (!res.ok) throw new Error('Failed to fetch inventory');
  return res.json();
}

export async function fetchCryptoBOM(assetId?: string): Promise<CryptoBOMComponent[]> {
  const url = assetId ? `${API_BASE}/crypto-bom/${assetId}` : `${API_BASE}/crypto-bom`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch Crypto-BOM');
  return res.json();
}

export async function fetchRiskOverview(): Promise<RiskOverview> {
  const res = await fetch(`${API_BASE}/risk/overview`);
  if (!res.ok) throw new Error('Failed to fetch risk overview');
  return res.json();
}

export async function fetchPQCOverview(): Promise<PQCReadinessOverview> {
  const res = await fetch(`${API_BASE}/pqc/overview`);
  if (!res.ok) throw new Error('Failed to fetch PQC readiness');
  return res.json();
}

export async function fetchCertificates(): Promise<CertificateEntry[]> {
  const res = await fetch(`${API_BASE}/certificates`);
  if (!res.ok) throw new Error('Failed to fetch certificates');
  return res.json();
}

export async function analyzeFindingWithAI(findingId: string, assetId?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/ai/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ finding_id: findingId, asset_id: assetId }),
  });
  if (!res.ok) throw new Error('AI analysis failed');
  return res.json();
}

export async function askAIAssistant(question: string, assetId?: string): Promise<{ answer: string; references: string[]; is_live_ai: boolean }> {
  const res = await fetch(`${API_BASE}/ai/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, asset_id: assetId }),
  });
  if (!res.ok) throw new Error('AI request failed');
  return res.json();
}

export async function fetchReports(): Promise<AssessmentReport[]> {
  const res = await fetch(`${API_BASE}/reports`);
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function fetchReportById(id: string): Promise<AssessmentReport> {
  const res = await fetch(`${API_BASE}/reports/${id}`);
  if (!res.ok) throw new Error('Failed to fetch report');
  return res.json();
}

export async function createReport(scanId: string, title?: string): Promise<AssessmentReport> {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scan_id: scanId, title }),
  });
  if (!res.ok) throw new Error('Failed to generate report');
  return res.json();
}

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  const res = await fetch(`${API_BASE}/audit-logs`);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

export async function resetDemoStore(): Promise<void> {
  await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
}
