import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './db.js';
import { executeScanJob } from './services/scanner.service.js';
import { generateFindingAnalysis, askAIAssistant } from './services/ai.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Upload Directory ────────────────────────────────────────────────────────
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${uuidv4()}_${sanitized}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.zip', '.java', '.kt', '.py', '.js', '.ts', '.jsx', '.tsx', '.json'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  }
});

// ─── Helper: get or create default org ──────────────────────────────────────
async function getDefaultOrg(): Promise<string> {
  const { data, error } = await supabase.from('organizations').select('id').limit(1).single();
  if (data) return data.id;
  // Create one on first boot
  const { data: created } = await supabase.from('organizations').insert({
    name: 'Default Organization',
    slug: 'default-org',
    description: 'Auto-created on first launch',
    tier: 'enterprise'
  }).select('id').single();
  return created!.id;
}

// ─── Helper: audit log ───────────────────────────────────────────────────────
async function addAuditLog(orgId: string, email: string, action: string, resourceType: string, resourceId: string, details?: any) {
  await supabase.from('audit_logs').insert({
    organization_id: orgId,
    user_email: email,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    details: details || {},
    ip_address: '127.0.0.1'
  });
}

// ============================================================
// 1. Health
// ============================================================
app.get('/api/health', (req, res) => {
  const geminiConfigured = !!process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here' &&
    !process.env.GEMINI_API_KEY.startsWith('your-');
  res.json({
    status: 'ok',
    version: '1.0.0',
    name: 'CryptoTool API (ECDAT - SIH26164)',
    ai_configured: geminiConfigured,
    supabase_url: process.env.SUPABASE_URL || 'not configured',
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// 2. Organizations
// ============================================================
app.get('/api/organizations', async (req, res) => {
  const { data, error } = await supabase.from('organizations').select('*').order('created_at', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/organizations', async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const { data, error } = await supabase.from('organizations').insert({ name, slug, description, tier: 'enterprise' }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.get('/api/auth/me', async (req, res) => {
  const orgId = await getDefaultOrg();
  const { data: org } = await supabase.from('organizations').select('*').eq('id', orgId).single();
  res.json({
    user: { id: orgId, email: 'admin@cryptotool.internal', name: 'Security Administrator', role: 'owner' },
    organization: org
  });
});

// ============================================================
// 3. Assets
// ============================================================
app.get('/api/assets', async (req, res) => {
  const { data, error } = await supabase.from('assets').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/assets/:id', async (req, res) => {
  const { data, error } = await supabase.from('assets').select('*').eq('id', req.params.id).single();
  if (error || !data) return res.status(404).json({ error: 'Asset not found' });
  res.json(data);
});

app.post('/api/assets', async (req, res) => {
  const { name, description, type, url, repository_url, owner, environment, criticality, exposure, tags, authorization_confirmed } = req.body;
  if (!name) return res.status(400).json({ error: 'Asset name is required' });
  if (!authorization_confirmed) return res.status(400).json({ error: 'Authorization confirmation required' });

  const orgId = await getDefaultOrg();
  const { data, error } = await supabase.from('assets').insert({
    organization_id: orgId, name, description: description || '',
    type: type || 'uploaded_project', url, repository_url,
    owner: owner || 'Security Team', environment: environment || 'production',
    criticality: criticality || 'high', exposure: exposure || 'internal',
    tags: Array.isArray(tags) ? tags : [], is_demo: false, authorization_confirmed: true
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  await addAuditLog(orgId, 'admin@cryptotool.internal', 'CREATE_ASSET', 'asset', data.id, { name: data.name });
  res.status(201).json(data);
});

app.delete('/api/assets/:id', async (req, res) => {
  const { data: asset } = await supabase.from('assets').select('*').eq('id', req.params.id).single();
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  const { error } = await supabase.from('assets').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  await addAuditLog(asset.organization_id, 'admin@cryptotool.internal', 'DELETE_ASSET', 'asset', req.params.id, { name: asset.name });
  res.json({ message: 'Asset deleted successfully' });
});

// ============================================================
// 4. Scans
// ============================================================
app.get('/api/scans', async (req, res) => {
  const { data, error } = await supabase.from('scans').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/scans/:id', async (req, res) => {
  const { data, error } = await supabase.from('scans').select('*').eq('id', req.params.id).single();
  if (error || !data) return res.status(404).json({ error: 'Scan not found' });
  res.json(data);
});

// Upload ZIP and scan
app.post('/api/scans/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const { asset_id, scan_name } = req.body;
    const orgId = await getDefaultOrg();

    let assetId = asset_id;
    if (!assetId) {
      const { data: newAsset } = await supabase.from('assets').insert({
        organization_id: orgId,
        name: scan_name || file.originalname.replace(/\.[^/.]+$/, ''),
        description: `Uploaded archive: ${file.originalname}`,
        type: 'uploaded_project', owner: 'Security Analyst',
        environment: 'production', criticality: 'high', exposure: 'internal',
        tags: ['uploaded-zip'], is_demo: false, authorization_confirmed: true
      }).select('id').single();
      assetId = newAsset!.id;
    }

    const { data: scan } = await supabase.from('scans').insert({
      id: uuidv4(),
      organization_id: orgId,
      asset_id: assetId,
      asset_name: scan_name || file.originalname,
      scan_type: 'source_code',
      status: 'queued',
      progress_percentage: 5,
      current_step: 'Scan job queued in background worker',
      target_identifier: file.originalname,
      is_demo: false,
      logs: [{ timestamp: new Date().toISOString(), message: `Uploaded archive ${file.originalname} (${(file.size / 1024).toFixed(1)} KB)`, level: 'info' }],
      started_at: new Date().toISOString()
    }).select().single();

    await addAuditLog(orgId, 'admin@cryptotool.internal', 'TRIGGER_SCAN', 'scan', scan!.id, { file: file.originalname });

    // Fire & forget background scan
    executeScanJob(scan!.id, file.path, false);

    res.status(202).json({ message: 'Scan started', scan_id: scan!.id, asset_id: assetId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Trigger scan by demo_target, asset_id, or target_url
app.post('/api/scans/trigger', async (req, res) => {
  const { asset_id, scan_type, target_url, demo_target } = req.body;
  const orgId = await getDefaultOrg();

  // ── Demo Targets ──────────────────────────────────────────
  if (demo_target === 'cryptotalk' || demo_target === 'legacy_banking') {
    const isCryptoTalk = demo_target === 'cryptotalk';
    const sampleDir = path.resolve(__dirname, `../../../samples/${demo_target}`);

    // Upsert demo asset
    const assetName = isCryptoTalk ? 'CryptoTalk Secure Messenger' : 'Legacy Banking API Service';
    const { data: existingAsset } = await supabase.from('assets').select('id').ilike('name', `%${isCryptoTalk ? 'CryptoTalk' : 'Legacy Banking'}%`).single();

    let demoAssetId = existingAsset?.id;
    if (!demoAssetId) {
      const { data: newAsset } = await supabase.from('assets').insert({
        organization_id: orgId,
        name: assetName,
        description: isCryptoTalk ? 'Reference secure encrypted messaging application' : 'Legacy core banking system with outdated cryptography',
        type: isCryptoTalk ? 'mobile_app' : 'api',
        owner: isCryptoTalk ? 'Mobile Security Team' : 'Core Infrastructure',
        environment: 'production', criticality: 'critical', exposure: 'external',
        tags: isCryptoTalk ? ['reference-app', 'e2ee'] : ['legacy', 'banking'],
        is_demo: true, authorization_confirmed: true
      }).select('id').single();
      demoAssetId = newAsset!.id;
    }

    const { data: scan } = await supabase.from('scans').insert({
      id: uuidv4(),
      organization_id: orgId,
      asset_id: demoAssetId,
      asset_name: assetName,
      scan_type: 'source_code',
      status: 'queued',
      progress_percentage: 5,
      current_step: `Starting ${assetName} discovery pipeline`,
      target_identifier: `samples/${demo_target}`,
      is_demo: true,
      logs: [{ timestamp: new Date().toISOString(), message: `Initiating scan for ${assetName}`, level: 'info' }],
      started_at: new Date().toISOString()
    }).select().single();

    executeScanJob(scan!.id, sampleDir, false);
    return res.status(202).json({ message: 'Demo scan started', scan_id: scan!.id });
  }

  // ── TLS Endpoint ─────────────────────────────────────────
  const isEndpoint = scan_type === 'tls_endpoint' || !!target_url;
  if (!asset_id && !target_url) return res.status(400).json({ error: 'asset_id or target_url required' });

  const target = target_url || 'https://localhost';
  let assetId = asset_id;

  if (!assetId) {
    const { data: newAsset } = await supabase.from('assets').insert({
      organization_id: orgId, name: target_url || 'Endpoint Asset',
      description: `Authorized endpoint assessment for ${target}`,
      type: 'certificate_endpoint', url: target,
      owner: 'Security Team', environment: 'production', criticality: 'high',
      exposure: 'external', tags: ['tls-endpoint'], is_demo: false, authorization_confirmed: true
    }).select('id').single();
    assetId = newAsset!.id;
  }

  const { data: scan } = await supabase.from('scans').insert({
    id: uuidv4(),
    organization_id: orgId,
    asset_id: assetId,
    asset_name: target,
    scan_type: isEndpoint ? 'tls_endpoint' : 'source_code',
    status: 'queued',
    progress_percentage: 5,
    current_step: isEndpoint ? 'Queued TLS handshake inspection' : 'Queued source-code analysis',
    target_identifier: target,
    is_demo: false,
    logs: [{ timestamp: new Date().toISOString(), message: `Scan initiated for ${target}`, level: 'info' }],
    started_at: new Date().toISOString()
  }).select().single();

  executeScanJob(scan!.id, target, isEndpoint);
  res.status(202).json({ message: 'Scan triggered', scan_id: scan!.id });
});

app.post('/api/scans/:id/cancel', async (req, res) => {
  const { data: scan } = await supabase.from('scans').select('*').eq('id', req.params.id).single();
  if (!scan) return res.status(404).json({ error: 'Scan not found' });
  if (['completed', 'failed'].includes(scan.status)) return res.status(400).json({ error: 'Cannot cancel finished scan' });

  const logs = [...(scan.logs || []), { timestamp: new Date().toISOString(), message: 'Scan cancelled by administrator', level: 'warn' }];
  await supabase.from('scans').update({ status: 'cancelled', current_step: 'Cancelled by user', logs }).eq('id', req.params.id);
  res.json({ message: 'Scan cancelled' });
});

// ============================================================
// 5. Findings
// ============================================================
app.get('/api/findings', async (req, res) => {
  const { asset_id, scan_id, severity, status, search } = req.query;
  let query = supabase.from('crypto_findings').select('*');
  if (asset_id) query = query.eq('asset_id', asset_id as string);
  if (scan_id) query = query.eq('scan_id', scan_id as string);
  if (severity) query = query.eq('severity', severity as string);
  if (status) query = query.eq('status', status as string);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });

  let results = data || [];
  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter((f: any) =>
      f.algorithm?.toLowerCase().includes(q) ||
      f.title?.toLowerCase().includes(q) ||
      f.file_path?.toLowerCase().includes(q)
    );
  }

  // Sort by severity
  const sevOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1, informational: 0 };
  results.sort((a: any, b: any) => (sevOrder[b.severity] || 0) - (sevOrder[a.severity] || 0));
  res.json(results);
});

app.get('/api/findings/:id', async (req, res) => {
  const { data, error } = await supabase.from('crypto_findings').select('*').eq('id', req.params.id).single();
  if (error || !data) return res.status(404).json({ error: 'Finding not found' });
  res.json(data);
});

app.patch('/api/findings/:id/status', async (req, res) => {
  const { status, justification } = req.body;
  const { data: finding } = await supabase.from('crypto_findings').select('*').eq('id', req.params.id).single();
  if (!finding) return res.status(404).json({ error: 'Finding not found' });

  const { data: updated, error } = await supabase.from('crypto_findings')
    .update({ status, status_justification: justification, updated_at: new Date().toISOString() })
    .eq('id', req.params.id).select().single();

  if (error) return res.status(500).json({ error: error.message });
  await addAuditLog(finding.organization_id, 'admin@cryptotool.internal', 'UPDATE_FINDING_STATUS', 'finding', req.params.id, { new_status: status, justification });
  res.json(updated);
});

// ============================================================
// 6. Crypto-BOM & Inventory
// ============================================================
app.get('/api/crypto-inventory', async (req, res) => {
  const { data } = await supabase.from('crypto_findings').select('algorithm, category, severity');
  const algoMap = new Map<string, { algorithm: string; category: string; count: number; status: string }>();

  (data || []).forEach((f: any) => {
    const existing = algoMap.get(f.algorithm) || {
      algorithm: f.algorithm, category: f.category, count: 0,
      status: f.severity === 'critical' ? 'Broken' : f.severity === 'high' ? 'Deprecated' : 'Recommended'
    };
    existing.count++;
    algoMap.set(f.algorithm, existing);
  });
  res.json(Array.from(algoMap.values()));
});

app.get('/api/crypto-bom', async (req, res) => {
  const { asset_id } = req.query;
  let query = supabase.from('crypto_components').select('*');
  if (asset_id) query = query.eq('asset_id', asset_id as string);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

app.get('/api/crypto-bom/:assetId', async (req, res) => {
  const { data, error } = await supabase.from('crypto_components').select('*').eq('asset_id', req.params.assetId);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

app.get('/api/crypto-bom/export/csv', async (req, res) => {
  const { data } = await supabase.from('crypto_components').select('*');
  let csv = 'Component,Algorithm,Category,Purpose,Location,Key Size/Curve,Security Status,PQC Relevance,Risk Level\n';
  (data || []).forEach((c: any) => {
    csv += `"${c.component_name}","${c.algorithm}","${c.category}","${c.purpose}","${c.location}","${c.key_size_or_curve}","${c.security_status}","${c.pqc_relevance}","${c.risk_level}"\n`;
  });
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="crypto-bom.csv"');
  res.send(csv);
});

// ============================================================
// 7. Risk Dashboard
// ============================================================
app.get('/api/risk/overview', async (req, res) => {
  const [{ data: scans }, { data: findings }, { data: assets }] = await Promise.all([
    supabase.from('scans').select('overall_security_score, pqc_readiness_score').eq('status', 'completed'),
    supabase.from('crypto_findings').select('severity, algorithm, quantum_vulnerable'),
    supabase.from('assets').select('id, last_scanned_at')
  ]);

  const f = findings || [];
  const s = scans || [];
  const a = assets || [];

  const critical = f.filter((x: any) => x.severity === 'critical').length;
  const high = f.filter((x: any) => x.severity === 'high').length;
  const medium = f.filter((x: any) => x.severity === 'medium').length;
  const low = f.filter((x: any) => x.severity === 'low').length;
  const info = f.filter((x: any) => x.severity === 'informational').length;

  const overallScore = s.length > 0
    ? Math.round(s.reduce((sum: number, x: any) => sum + (x.overall_security_score || 0), 0) / s.length)
    : 100;
  const pqcScore = s.length > 0
    ? Math.round(s.reduce((sum: number, x: any) => sum + (x.pqc_readiness_score || 0), 0) / s.length)
    : 100;

  const algoCountMap: Record<string, number> = {};
  f.forEach((x: any) => {
    const family = (x.algorithm || '').split(/[- /]/)[0];
    algoCountMap[family] = (algoCountMap[family] || 0) + 1;
  });

  res.json({
    overall_score: overallScore,
    pqc_score: pqcScore,
    total_assets: a.length,
    assets_scanned: a.filter((x: any) => x.last_scanned_at).length,
    total_crypto_instances: f.length,
    critical_findings: critical,
    high_findings: high,
    medium_findings: medium,
    low_findings: low,
    info_findings: info,
    severity_distribution: [
      { name: 'Critical', value: critical, color: '#f43f5e' },
      { name: 'High', value: high, color: '#f97316' },
      { name: 'Medium', value: medium, color: '#eab308' },
      { name: 'Low', value: low, color: '#3b82f6' },
      { name: 'Informational', value: info, color: '#10b981' }
    ],
    algorithm_distribution: Object.entries(algoCountMap).map(([name, count]) => ({ name, count })),
    risk_trends: [
      { date: 'Week -4', score: 100, legacy_count: 0 },
      { date: 'Week -3', score: 100, legacy_count: 0 },
      { date: 'Week -2', score: 100, legacy_count: 0 },
      { date: 'Week -1', score: 100, legacy_count: 0 },
      { date: 'Today', score: overallScore, legacy_count: critical + high }
    ],
    score_breakdown: {
      algorithm_strength: critical > 0 ? 45 : 95,
      key_hygiene: critical > 0 ? 50 : 90,
      protocol_security: 85,
      certificate_health: 90,
      pqc_margin: pqcScore
    }
  });
});

// ============================================================
// 8. PQC Readiness
// ============================================================
app.get('/api/pqc/overview', async (req, res) => {
  const { data: findings } = await supabase.from('crypto_findings').select('algorithm, quantum_vulnerable, pqc_priority');
  const f = findings || [];

  const qSensitive = f.filter((x: any) => x.quantum_vulnerable).length;
  const qSafe = f.filter((x: any) => !x.quantum_vulnerable).length;
  const readinessScore = f.length > 0 ? Math.round((qSafe / f.length) * 100) : 100;

  res.json({
    readiness_score: readinessScore,
    quantum_sensitive_count: qSensitive,
    quantum_safe_count: qSafe,
    high_priority_migration_count: f.filter((x: any) => x.pqc_priority === 'immediate' || x.pqc_priority === 'high').length,
    components: [
      {
        algorithm: 'RSA (1024/2048/3072)', category: 'Public Key Encryption & Signatures',
        quantum_threat: "Factorization via Shor's Algorithm (100% Broken on CRQC)", impact: 'High',
        pqc_replacement: 'ML-KEM (FIPS 203) / ML-DSA (FIPS 204)',
        standard_reference: 'NIST Post-Quantum Standardization',
        instances_count: f.filter((x: any) => x.algorithm?.includes('RSA')).length
      },
      {
        algorithm: 'ECDSA / ECDH (P-256 / X25519)', category: 'Key Exchange & Digital Signatures',
        quantum_threat: "Discrete Logarithm via Shor's Algorithm", impact: 'High',
        pqc_replacement: 'ML-KEM-768 / Hybrid X25519+Kyber',
        standard_reference: 'FIPS 203 & RFC draft-ietf-tls-hybrid-design',
        instances_count: f.filter((x: any) => x.algorithm?.includes('ECDH') || x.algorithm?.includes('EC')).length
      },
      {
        algorithm: 'AES-256-GCM', category: 'Symmetric AEAD Encryption',
        quantum_threat: "Grover's Algorithm (Halves effective key to 128-bit)", impact: 'Low',
        pqc_replacement: 'Retain AES-256 (128-bit quantum security is unbroken)',
        standard_reference: 'NIST SP 800-38D',
        instances_count: f.filter((x: any) => x.algorithm?.includes('AES')).length
      },
      {
        algorithm: 'SHA-256 / SHA-384', category: 'Cryptographic Hash Function',
        quantum_threat: 'Grover Collision Search (Reduces to 128-bit collision resistance)', impact: 'Low',
        pqc_replacement: 'Maintain SHA-256/384 or adopt SHA3-384',
        standard_reference: 'FIPS 180-4',
        instances_count: f.filter((x: any) => x.algorithm?.includes('SHA')).length
      }
    ],
    migration_roadmap: [
      { phase: 'Phase 1: Discovery & Inventory', target: 'Complete Crypto-BOM', action: 'Catalog all public key algorithms and external dependencies across applications.', nist_guideline: 'NIST IR 8454' },
      { phase: 'Phase 2: Hybrid Prototyping', target: 'TLS 1.3 & Key Exchange', action: 'Deploy hybrid classical + post-quantum key exchange (X25519 + ML-KEM-768).', nist_guideline: 'FIPS 203' },
      { phase: 'Phase 3: Digital Signature Transition', target: 'Certificates & Code Signing', action: 'Evaluate ML-DSA (FIPS 204) and SLH-DSA (FIPS 205) for enterprise PKI.', nist_guideline: 'FIPS 204 / 205' },
      { phase: 'Phase 4: Full Quantum Resilience', target: 'Enterprise Cryptosystem', action: 'Decommission all pure RSA/ECC asymmetric operations.', nist_guideline: 'CNSA 2.0 (2030-2033 Horizon)' }
    ]
  });
});

// ============================================================
// 9. TLS & Certificates
// ============================================================
app.get('/api/certificates', async (req, res) => {
  const { data, error } = await supabase.from('certificates').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

// ============================================================
// 10. AI Security Analyst
// ============================================================
app.post('/api/ai/analyze', async (req, res) => {
  const { finding_id, asset_id } = req.body;
  const { data: finding } = await supabase.from('crypto_findings').select('*').eq('id', finding_id).single();
  if (!finding) return res.status(404).json({ error: 'Finding not found' });

  const { data: asset } = asset_id
    ? await supabase.from('assets').select('name').eq('id', asset_id || finding.asset_id).single()
    : { data: null };

  const analysis = await generateFindingAnalysis(finding, asset?.name);
  res.json(analysis);
});

app.post('/api/ai/ask', async (req, res) => {
  const { question, asset_id } = req.body;
  if (!question) return res.status(400).json({ error: 'Question is required' });

  // Gather live context from Supabase for grounding
  const { data: findings } = await supabase.from('crypto_findings').select('algorithm, severity, title, file_path').limit(20);
  const result = await askAIAssistant(question, asset_id, findings || []);
  res.json(result);
});

// ============================================================
// 11. Reports
// ============================================================
app.get('/api/reports', async (req, res) => {
  const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

app.get('/api/reports/:id', async (req, res) => {
  const { data, error } = await supabase.from('reports').select('*').eq('id', req.params.id).single();
  if (error || !data) return res.status(404).json({ error: 'Report not found' });
  res.json(data);
});

app.post('/api/reports', async (req, res) => {
  const { scan_id, title } = req.body;
  if (!scan_id) return res.status(400).json({ error: 'scan_id is required' });

  const { data: scan } = await supabase.from('scans').select('*, assets(name)').eq('id', scan_id).single();
  if (!scan) return res.status(404).json({ error: 'Scan not found' });

  const [{ data: findings }, { data: bom }] = await Promise.all([
    supabase.from('crypto_findings').select('*').eq('scan_id', scan_id),
    supabase.from('crypto_components').select('*').eq('scan_id', scan_id)
  ]);

  const f = findings || [];
  const b = bom || [];

  const remediation = [
    ...(f.filter((x: any) => x.severity === 'critical').slice(0, 3).map((x: any, i: number) => ({
      priority: i + 1, action: `Remediate ${x.algorithm}: ${x.title}`, timeframe: 'Immediate (0-30 days)'
    }))),
    ...(f.filter((x: any) => x.severity === 'high').slice(0, 2).map((x: any, i: number) => ({
      priority: i + 4, action: `Address ${x.algorithm}: ${x.title}`, timeframe: 'Short-term (30-90 days)'
    })))
  ];

  const summaryData = {
    metadata: { organization: 'Enterprise', asset_name: scan.asset_name || 'Unknown', asset_type: scan.scan_type, scan_date: scan.completed_at || new Date().toISOString() },
    scores: { overall_security_score: scan.overall_security_score, pqc_readiness_score: scan.pqc_readiness_score, critical_count: scan.critical_count, total_findings: scan.total_findings_count },
    executive_summary: `This cryptographic security assessment of "${scan.asset_name}" identified ${f.length} cryptographic primitives across ${scan.total_files_analyzed} analyzed files. The system achieved a security score of ${scan.overall_security_score}/100 and a PQC readiness score of ${scan.pqc_readiness_score}/100. ${scan.critical_count} critical-severity findings require immediate remediation to maintain compliance with NIST SP 800-131A and FIPS standards.`,
    remediation_roadmap: remediation,
    crypto_bom: b.map((c: any) => ({ algorithm: c.algorithm, category: c.category, security_status: c.security_status, pqc_relevance: c.pqc_relevance })),
    findings: f.slice(0, 20).map((x: any) => ({ id: x.id, title: x.title, algorithm: x.algorithm, severity: x.severity, description: x.description, file_path: x.file_path, line_number: x.line_number }))
  };

  const orgId = await getDefaultOrg();
  const { data: report, error } = await supabase.from('reports').insert({
    organization_id: orgId,
    asset_id: scan.asset_id,
    scan_id,
    title: title || `Cryptographic Assessment — ${scan.asset_name} — ${new Date().toLocaleDateString()}`,
    report_type: 'executive_summary',
    format: 'pdf',
    generated_by: 'CryptoTool Engine v1.0',
    summary_data: summaryData
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  await addAuditLog(orgId, 'admin@cryptotool.internal', 'GENERATE_REPORT', 'report', report.id, { scan_id, title: report.title });
  res.status(201).json(report);
});

// ============================================================
// 12. Audit Logs
// ============================================================
app.get('/api/audit-logs', async (req, res) => {
  const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  CryptoTool API Engine on port ${PORT}`);
  console.log(`  Supabase: ${process.env.SUPABASE_URL || 'NOT CONFIGURED'}`);
  console.log(`  Gemini AI: ${process.env.GEMINI_API_KEY ? 'CONFIGURED' : 'OFFLINE — deterministic fallback active'}`);
  console.log(`====================================================`);
});
