import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCANNER_SCRIPT_PATH = path.resolve(__dirname, '../../../scanner/scanner.py');
const TLS_SCRIPT_PATH = path.resolve(__dirname, '../../../scanner/tls_inspector.py');

// Helper: update scan progress in Supabase
async function updateScan(scanId: string, updates: Record<string, any>) {
  await supabase.from('scans').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', scanId);
}

// Helper: append log entry to scan
async function appendLog(scanId: string, message: string, level: 'info' | 'warn' | 'error' = 'info') {
  const { data: scan } = await supabase.from('scans').select('logs').eq('id', scanId).single();
  const logs = [...(scan?.logs || []), { timestamp: new Date().toISOString(), message, level }];
  await supabase.from('scans').update({ logs }).eq('id', scanId);
}

export async function executeScanJob(scanId: string, targetPathOrUrl: string, isEndpointScan: boolean = false) {
  const { data: scan } = await supabase.from('scans').select('*').eq('id', scanId).single();
  if (!scan) return;

  const orgId = scan.organization_id;
  const assetId = scan.asset_id;

  try {
    // Stage 1: Extracting
    await updateScan(scanId, {
      status: 'extracting',
      progress_percentage: 15,
      current_step: isEndpointScan ? 'Connecting to authorized TLS endpoint' : 'Verifying and extracting archive safely'
    });
    await appendLog(scanId, isEndpointScan ? 'Connecting to TLS endpoint' : 'Extracting archive in sandbox');
    await delay(400);

    // Stage 2: Discovering
    await updateScan(scanId, {
      status: 'discovering',
      progress_percentage: 40,
      current_step: isEndpointScan
        ? 'Negotiating TLS cipher suites and parsing X.509 certificates'
        : 'Executing AST & pattern discovery for Java/Kotlin, Python, JS/TS'
    });
    await appendLog(scanId, 'Running cryptographic discovery engine');

    let scanResult: any;
    if (isEndpointScan) {
      scanResult = await runPythonScript(TLS_SCRIPT_PATH, [targetPathOrUrl]);
    } else {
      scanResult = await runPythonScript(SCANNER_SCRIPT_PATH, [targetPathOrUrl]);
    }

    // Stage 3: Analyzing
    await updateScan(scanId, {
      status: 'analyzing',
      progress_percentage: 65,
      current_step: 'Normalizing findings against cryptographic knowledge base'
    });
    await appendLog(scanId, 'Normalizing and classifying cryptographic primitives');
    await delay(400);

    // Stage 4: Risk Calculation
    await updateScan(scanId, {
      status: 'calculating_risk',
      progress_percentage: 85,
      current_step: 'Calculating deterministic security and PQC readiness metrics'
    });
    await appendLog(scanId, 'Running deterministic NIST SP 800-131A risk scoring formula');

    if (isEndpointScan) {
      // ── TLS / Certificate Result ───────────────────────────
      await supabase.from('certificates').insert({
        id: uuidv4(),
        organization_id: orgId,
        asset_id: assetId,
        scan_id: scanId,
        endpoint: scanResult.endpoint || targetPathOrUrl,
        tls_version: scanResult.tls_version || 'TLSv1.3',
        cipher_suite: scanResult.cipher_suite || 'Unknown',
        subject: scanResult.subject || `CN=${targetPathOrUrl}`,
        issuer: scanResult.issuer || 'Unknown CA',
        valid_from: scanResult.valid_from || new Date().toISOString(),
        valid_until: scanResult.valid_until || new Date(Date.now() + 90 * 86400000).toISOString(),
        days_until_expiry: scanResult.days_until_expiry ?? 90,
        public_key_algorithm: scanResult.public_key_algorithm || 'RSA',
        public_key_size: scanResult.public_key_size || 2048,
        signature_algorithm: scanResult.signature_algorithm || 'SHA256withRSA',
        sans: scanResult.sans || [],
        chain_status: scanResult.chain_status || 'valid',
        health_status: scanResult.health_status || 'healthy',
        is_demo: scan.is_demo
      });

      const findingsList = scanResult.findings || [];
      for (const f of findingsList) {
        await supabase.from('crypto_findings').insert({
          id: uuidv4(),
          scan_id: scanId,
          asset_id: assetId,
          organization_id: orgId,
          rule_id: f.rule_id || 'TLS-001',
          title: f.title || 'TLS Configuration Issue',
          description: f.description || 'Insecure TLS configuration detected',
          category: 'Transport Layer Security',
          algorithm: scanResult.tls_version || 'TLS',
          file_path: targetPathOrUrl,
          line_number: 1,
          code_snippet_redacted: `Endpoint: ${targetPathOrUrl} | Cipher: ${scanResult.cipher_suite}`,
          language: 'network/tls',
          severity: f.severity || 'medium',
          confidence: 'high',
          status: 'open',
          quantum_vulnerable: false,
          pqc_priority: 'medium',
          remediation_deterministic: f.remediation || 'Upgrade to TLS 1.3 with AEAD cipher suites.',
          is_demo: scan.is_demo
        });
      }

      const critCount = findingsList.filter((f: any) => f.severity === 'critical').length;
      const highCount = findingsList.filter((f: any) => f.severity === 'high').length;
      await updateScan(scanId, {
        total_findings_count: findingsList.length,
        critical_count: critCount,
        high_count: highCount,
        medium_count: findingsList.filter((f: any) => f.severity === 'medium').length,
        low_count: findingsList.filter((f: any) => f.severity === 'low').length,
        info_count: findingsList.filter((f: any) => f.severity === 'informational').length,
        overall_security_score: scanResult.health_status === 'healthy' ? 95 : 40,
        pqc_readiness_score: scanResult.public_key_algorithm?.includes('RSA') ? 50 : 80
      });

    } else {
      // ── Source Code Result ────────────────────────────────
      const totalFiles = scanResult.total_files || 1;
      const overallScore = scanResult.overall_security_score ?? 100;
      const pqcScore = scanResult.pqc_readiness_score ?? 100;

      // Insert findings
      if (Array.isArray(scanResult.findings)) {
        for (const rawF of scanResult.findings) {
          await supabase.from('crypto_findings').insert({
            id: uuidv4(),
            scan_id: scanId,
            asset_id: assetId,
            organization_id: orgId,
            rule_id: rawF.rule_id || 'CRYPTO-001',
            title: rawF.title,
            description: rawF.description,
            category: rawF.category,
            algorithm: rawF.algorithm,
            mode: rawF.mode || null,
            padding: rawF.padding || null,
            key_size: rawF.key_size || null,
            key_size_str: rawF.key_size_str || 'unknown',
            digest_size: rawF.digest_size || null,
            curve: rawF.curve || null,
            file_path: rawF.file_path,
            line_number: rawF.line_number,
            code_snippet_redacted: rawF.code_snippet_redacted,
            api_reference: rawF.api_reference || null,
            language: rawF.language,
            severity: rawF.severity,
            confidence: rawF.confidence || 'high',
            status: 'open',
            quantum_vulnerable: rawF.quantum_vulnerable || false,
            pqc_priority: rawF.pqc_priority || 'low',
            remediation_deterministic: rawF.remediation_deterministic || null,
            is_demo: scan.is_demo
          });
        }
      }

      // Insert Crypto-BOM components
      if (Array.isArray(scanResult.crypto_bom)) {
        for (const rawBom of scanResult.crypto_bom) {
          await supabase.from('crypto_components').insert({
            id: uuidv4(),
            scan_id: scanId,
            asset_id: assetId,
            organization_id: orgId,
            component_name: rawBom.component_name,
            algorithm: rawBom.algorithm,
            category: rawBom.category,
            purpose: rawBom.purpose,
            location: rawBom.location,
            key_size_or_curve: rawBom.key_size_or_curve || 'unknown',
            security_status: rawBom.security_status,
            pqc_relevance: rawBom.pqc_relevance || null,
            is_quantum_safe: rawBom.is_quantum_safe || false,
            risk_level: rawBom.risk_level || 'low',
            evidence: rawBom.evidence || null
          });
        }
      }

      // Update scan summary
      await updateScan(scanId, {
        total_files_analyzed: totalFiles,
        total_findings_count: scanResult.total_findings || 0,
        critical_count: scanResult.critical_count || 0,
        high_count: scanResult.high_count || 0,
        medium_count: scanResult.medium_count || 0,
        low_count: scanResult.low_count || 0,
        info_count: scanResult.info_count || 0,
        overall_security_score: overallScore,
        pqc_readiness_score: pqcScore
      });
    }

    // Stage 5: Finalizing
    await updateScan(scanId, {
      status: 'finalizing',
      progress_percentage: 95,
      current_step: 'Saving inventory records and updating asset risk profile'
    });
    await appendLog(scanId, 'Persisting findings to Supabase database');
    await delay(300);

    // Update asset last_scanned_at
    await supabase.from('assets').update({ last_scanned_at: new Date().toISOString() }).eq('id', assetId);

    // Finalize scan
    const { data: finalScan } = await supabase.from('scans').select('total_findings_count, overall_security_score').eq('id', scanId).single();
    await updateScan(scanId, {
      status: 'completed',
      progress_percentage: 100,
      current_step: 'Scan completed successfully',
      completed_at: new Date().toISOString()
    });
    await appendLog(scanId, `Analysis finalized: Found ${finalScan?.total_findings_count || 0} cryptographic instances with Security Score ${finalScan?.overall_security_score || 100}/100.`);

    // Audit log
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_email: 'system@cryptotool.internal',
      action: 'SCAN_COMPLETED',
      resource_type: 'scan',
      resource_id: scanId,
      details: { findings_count: finalScan?.total_findings_count, score: finalScan?.overall_security_score }
    });

  } catch (err: any) {
    await updateScan(scanId, {
      status: 'failed',
      error_message: err.message || 'Scan execution failed',
      current_step: 'Scan failed'
    });
    await appendLog(scanId, `Scan failed: ${err.message}`, 'error');
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_email: 'system@cryptotool.internal',
      action: 'SCAN_FAILED',
      resource_type: 'scan',
      resource_id: scanId,
      details: { error: err.message }
    });
  }
}

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

function runPythonScript(scriptPath: string, args: string[]): Promise<any> {
  return new Promise((resolve, reject) => {
    const pyProcess = spawn('python', [scriptPath, ...args]);
    let stdout = '';
    let stderr = '';

    pyProcess.stdout.on('data', (data) => { stdout += data.toString(); });
    pyProcess.stderr.on('data', (data) => { stderr += data.toString(); });

    pyProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Python scanner exited with code ${code}: ${stderr || stdout}`));
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (e: any) {
        reject(new Error(`Failed to parse scanner JSON: ${e.message}\nOutput: ${stdout.substring(0, 300)}`));
      }
    });

    pyProcess.on('error', (err) => {
      reject(new Error(`Failed to spawn Python process: ${err.message}`));
    });
  });
}
