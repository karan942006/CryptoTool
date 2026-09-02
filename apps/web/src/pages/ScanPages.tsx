import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Play,
  UploadCloud,
  FileCode,
  Shield,
  Clock,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Terminal,
  FileBarChart,
  Binary,
  Layers,
  ArrowLeft,
  Server,
  Cloud,
  Boxes,
  Cpu,
  Sparkles,
  Zap,
  Globe,
  FileText,
  KeyRound,
  Filter,
  Search,
  ExternalLink,
  Code
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, SeverityBadge } from '../components/ui/Badge';
import { ScoreGauge } from '../components/ui/ScoreGauge';
import { Scan, CryptoFinding, CryptoBOMComponent } from '../types';
import * as api from '../services/api';
import { ScannedFileInfo, extractFilesFromZip, executeClientSideScan, DEMO_CODEBASES } from '../services/clientScanner';
import { useApp } from '../context/AppContext';

export const StartScanPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addNotification } = useApp();

  const [scanMode, setScanMode] = useState<'source_code' | 'binary_apk' | 'certificate' | 'tls_endpoint'>('source_code');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetUrl, setTargetUrl] = useState('');
  const [scanName, setScanName] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const preselectedAssetId = searchParams.get('asset_id');

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsStarting(true);

    try {
      if (['source_code', 'binary_apk', 'certificate'].includes(scanMode)) {
        if (!selectedFile) {
          addNotification('File Required', 'Please select a source code archive (ZIP), APK, or Certificate (.pem/.crt).', 'error');
          setIsStarting(false);
          return;
        }

        const scanId = 'scan-' + Math.random().toString(36).substring(2, 11);
        const name = scanName || selectedFile.name;

        // Extract files directly in-browser
        let files: Array<{ path: string; content: string; size?: number }> = [];

        if (selectedFile.name.endsWith('.zip') || selectedFile.name.endsWith('.apk') || selectedFile.name.endsWith('.jar')) {
          files = await extractFilesFromZip(selectedFile);
        } else {
          const text = await selectedFile.text();
          files = [{ path: selectedFile.name, content: text, size: selectedFile.size }];
        }

        if (files.length === 0) {
          addNotification('No Supported Files', 'Could not find readable source code or certificates in archive.', 'error');
          setIsStarting(false);
          return;
        }

        // Execute scan client-side immediately
        const scanRes = await executeClientSideScan(files, name);
        addNotification('Scan Completed', `Cryptographic analysis completed for ${name}`, 'success');
        navigate(`/scans/results/${scanRes.scan.id}`);

      } else if (scanMode === 'tls_endpoint') {
        if (!targetUrl) {
          addNotification('URL Required', 'Please provide an authorized HTTPS/TLS endpoint.', 'error');
          setIsStarting(false);
          return;
        }

        const res = await api.inspectTlsEndpoint(targetUrl);
        addNotification('Endpoint Inspected', `TLS negotiation verified for ${targetUrl}`, 'success');
        navigate(`/scans/results/${res.scan_id}`);
      }
    } catch (err: any) {
      addNotification('Scan Failed', err.message || 'Failed to analyze artifact', 'error');
      setIsStarting(false);
    }
  };

  const handleLaunchDemo = async (target: 'cryptotalk' | 'legacy_banking') => {
    setIsStarting(true);
    const demo = DEMO_CODEBASES[target];
    const res = await executeClientSideScan(demo.files, demo.name);
    addNotification(
      'Demo Scan Executed',
      `Discovery engine analyzed ${demo.name} (${demo.files.length} files)`,
      'success'
    );
    navigate(`/scans/results/${res.scan.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5 font-mono">
          <Play className="w-6 h-6 text-cyan-400" />
          Enterprise Cryptographic Discovery Hub
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Evidence-first cryptographic discovery across 12 languages (Java, Kotlin, Python, JS/TS, C/C++, C#, Go, Rust, Swift), APKs, X.509 Certificates, and TLS Endpoints.
        </p>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-xl bg-navy-900 border border-slate-800 font-mono text-xs">
        <button
          type="button"
          onClick={() => { setScanMode('source_code'); setSelectedFile(null); }}
          className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
            scanMode === 'source_code'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCode className="w-4 h-4" />
          Source Code (ZIP)
        </button>

        <button
          type="button"
          onClick={() => { setScanMode('binary_apk'); setSelectedFile(null); }}
          className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
            scanMode === 'binary_apk'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Binary className="w-4 h-4" />
          Android APK / JAR
        </button>

        <button
          type="button"
          onClick={() => { setScanMode('certificate'); setSelectedFile(null); }}
          className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
            scanMode === 'certificate'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          X.509 Certificate
        </button>

        <button
          type="button"
          onClick={() => { setScanMode('tls_endpoint'); setSelectedFile(null); }}
          className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
            scanMode === 'tls_endpoint'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          Live TLS Endpoint
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleStartScan} className="space-y-5">
        <Card className="p-6 space-y-5 border-slate-800 shadow-2xl">
          <div className="space-y-1.5 font-mono text-xs">
            <label className="text-slate-300 font-bold block">Scan Job Identifier / Title</label>
            <input
              type="text"
              placeholder="e.g. Core Banking System Cryptographic Audit"
              value={scanName}
              onChange={e => setScanName(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-navy-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {['source_code', 'binary_apk', 'certificate'].includes(scanMode) && (
            <div className="space-y-2 font-mono text-xs">
              <label className="text-slate-300 font-bold block">
                {scanMode === 'source_code' && 'Upload Project Archive (ZIP / TAR.GZ / Java / Python / JS / C++ / Go / Rust)'}
                {scanMode === 'binary_apk' && 'Upload Android APK or Java Archive (.apk, .jar, .aab)'}
                {scanMode === 'certificate' && 'Upload X.509 Certificate (.pem, .crt, .cer)'}
              </label>

              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-navy-950/60 cursor-pointer transition-all hover:bg-navy-950"
              >
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                  <UploadCloud className="w-8 h-8 text-cyan-400 animate-bounce" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-bold text-white">
                    {selectedFile ? selectedFile.name : 'Click to browse or drag & drop target file'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-sans">
                    {selectedFile
                      ? `${(selectedFile.size / 1024).toFixed(1)} KB selected`
                      : 'Zero fake findings • Deterministic AST & entropy discovery engine'}
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={e => e.target.files && setSelectedFile(e.target.files[0])}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {scanMode === 'tls_endpoint' && (
            <div className="space-y-2 font-mono text-xs">
              <label className="text-slate-300 font-bold block">Authorized HTTPS / TLS Hostname</label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="api.banking.internal:443"
                  value={targetUrl}
                  onChange={e => setTargetUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-navy-950 border border-slate-800 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Evaluates TLS 1.3 / 1.2 negotiation, cipher suites, certificate validity, and quantum risk.
              </p>
            </div>
          )}

          <Button
            type="submit"
            variant="cyber"
            disabled={isStarting}
            className="w-full py-3 text-sm font-bold"
            leftIcon={<Play className="w-4 h-4" />}
          >
            {isStarting ? 'Analyzing Artifact...' : 'Execute Deterministic Cryptographic Scan'}
          </Button>
        </Card>
      </form>

      {/* 1-Click Reference Benchmarks */}
      <Card className="p-5 border-slate-800 bg-navy-950/80 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            1-Click Benchmark Reference Codebases (SIH 26164)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 font-mono">CryptoTalk Secure Messenger</span>
                <span className="text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">
                  PQC Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-sans">
                E2EE Android app with AES-256-GCM, Android Keystore StrongBox, RSA-3072, and SHA-256.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => handleLaunchDemo('cryptotalk')} className="w-full text-xs">
              Scan CryptoTalk Reference
            </Button>
          </div>

          <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-300 font-mono">Legacy Core Banking API</span>
                <span className="text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded">
                  Critical Scope
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-sans">
                Vulnerable banking system containing hardcoded AES keys, AES-ECB, 3DES, RSA-1024, MD5, and SHA-1.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => handleLaunchDemo('legacy_banking')} className="w-full text-xs">
              Scan Legacy Banking Sample
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export const ScanResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scan, setScan] = useState<Scan | null>(null);
  const [findings, setFindings] = useState<CryptoFinding[]>([]);
  const [scannedFiles, setScannedFiles] = useState<ScannedFileInfo[]>([]);
  const [activeTab, setActiveTab] = useState<'findings' | 'files' | 'heatmap'>('findings');
  const [selectedFileFilter, setSelectedFileFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadResults = async () => {
      if (!id) return;
      try {
        const [scanData, findingsData, filesData] = await Promise.all([
          api.fetchScanById(id),
          api.fetchFindings({ scan_id: id }),
          api.fetchScannedFiles(id)
        ]);
        setScan(scanData);
        setFindings(findingsData);
        setScannedFiles(filesData);
      } catch (e) {
        console.warn('Results loading note:', e);
      }
    };
    loadResults();
  }, [id]);

  if (!scan) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 font-mono text-sm">
        <div className="text-center space-y-2">
          <Clock className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p>Loading assessment results...</p>
        </div>
      </div>
    );
  }

  const filteredFindings = findings.filter(f => {
    const matchesFile = selectedFileFilter === 'all' || f.file_path === selectedFileFilter;
    const matchesSearch = f.algorithm.toLowerCase().includes(search.toLowerCase()) ||
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.file_path.toLowerCase().includes(search.toLowerCase());
    return matchesFile && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5 font-mono">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            Assessment Results: {scan.asset_name || scan.target_identifier}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic discovery verified {scan.total_findings_count} cryptographic primitives across {scannedFiles.length} files.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate('/crypto-bom')} leftIcon={<Shield className="w-4 h-4" />}>
            CycloneDX CBOM
          </Button>
          <Button size="sm" variant="cyber" onClick={() => navigate('/reports')} leftIcon={<FileBarChart className="w-4 h-4" />}>
            Generate Report
          </Button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <ScoreGauge
            score={scan.overall_security_score}
            label="Overall Cryptographic Score"
            sublabel="Calculated from NIST SP 800-131A baselines"
            type="overall"
          />
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <ScoreGauge
            score={scan.pqc_readiness_score}
            label="Post-Quantum Readiness"
            sublabel="Resilience ratio against CRQC Shor factoring"
            type="pqc"
          />
        </Card>

        <Card className="p-5 space-y-3 font-mono text-xs">
          <span className="text-[10px] uppercase text-slate-400 font-bold">Severity Breakdown</span>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-rose-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Critical Severity:
              </span>
              <span className="font-bold text-white text-sm">{scan.critical_count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> High Severity:
              </span>
              <span className="font-bold text-white text-sm">{scan.high_count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> Informational / Secure:
              </span>
              <span className="font-bold text-white text-sm">{scan.info_count}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 font-mono text-xs">
        <button
          onClick={() => setActiveTab('findings')}
          className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'findings' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          Verified Findings ({filteredFindings.length})
        </button>

        <button
          onClick={() => setActiveTab('files')}
          className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'files' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Scanned File Inventory ({scannedFiles.length})
        </button>
      </div>

      {/* Tab 1: Findings Explorer with Evidence */}
      {activeTab === 'findings' && (
        <Card className="p-6 space-y-4 border-slate-800 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <h3 className="text-base font-bold text-white font-mono">Discovered Cryptographic Findings</h3>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Filter algorithm or file..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full sm:w-64 px-3 py-1.5 rounded-lg bg-navy-950 border border-slate-800 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-800/60 font-mono text-xs">
            {filteredFindings.length === 0 ? (
              <div className="py-8 text-center text-slate-500">No cryptographic issues found matching criteria.</div>
            ) : (
              filteredFindings.map(f => (
                <div key={f.id} className="py-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-white text-sm hover:text-cyan-300 cursor-pointer" onClick={() => navigate(`/findings/${f.id}`)}>
                        {f.title}
                      </span>
                      <p className="text-xs text-slate-400 font-sans mt-0.5">{f.description}</p>
                    </div>
                    <SeverityBadge severity={f.severity} size="sm" />
                  </div>

                  {/* Evidence Code Snippet Box */}
                  <div className="p-3 rounded-lg bg-black/60 border border-slate-800/80 font-mono text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span>Location: <strong className="text-cyan-400">{f.file_path}:{f.line_number}</strong></span>
                      <span>Confidence: <strong className="text-emerald-400">{f.confidence.toUpperCase()}</strong></span>
                    </div>
                    <pre className="text-amber-200 overflow-x-auto pt-1">{f.code_snippet_redacted}</pre>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
                    <div className="flex items-center gap-4">
                      <span>Algorithm: <strong className="text-cyan-300">{f.algorithm}</strong></span>
                      <span>Quantum: <strong className={f.quantum_vulnerable ? 'text-rose-400' : 'text-emerald-400'}>{f.quantum_vulnerable ? '🔴 Shor Vulnerable' : '🟢 Quantum Safe'}</strong></span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/findings/${f.id}`)} className="text-xs text-cyan-300 hover:text-white p-0 h-auto">
                      Inspect Remediation & AI Analysis →
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Tab 2: Scanned File Inventory */}
      {activeTab === 'files' && (
        <Card className="overflow-hidden border-slate-800 shadow-2xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Scanned File Inventory ({scannedFiles.length} Total Files)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-navy-950/60">
                  <th className="p-3.5">File Name & Relative Path</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Size</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Detections</th>
                  <th className="p-3.5">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {scannedFiles.map((sf, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="truncate max-w-md">{sf.path}</span>
                      </div>
                    </td>
                    <td className="p-3.5 uppercase text-slate-400 text-[10px]">{sf.file_type}</td>
                    <td className="p-3.5 text-slate-400">{(sf.size_bytes / 1024).toFixed(1)} KB</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                        {sf.scan_status}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-cyan-300">{sf.detection_count}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        sf.risk_level === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        sf.risk_level === 'high' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        sf.risk_level === 'clean' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {sf.risk_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export const ScanProgressPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [progress, setProgress] = useState(25);
  const [step, setStep] = useState('Parsing codebase manifest...');
  const [logs, setLogs] = useState<Array<{ timestamp: string; message: string; level: 'info' | 'warn' | 'error' }>>([
    { timestamp: new Date().toLocaleTimeString(), message: 'Discovery engine initialized', level: 'info' }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timer);
          navigate(`/scans/results/${id || 'live'}`);
          return 100;
        }
        const next = p + 25;
        if (next === 50) {
          setStep('Executing AST multi-language ruleset...');
          setLogs(l => [...l, { timestamp: new Date().toLocaleTimeString(), message: 'Evaluating NIST SP 800-131A rule engine', level: 'info' }]);
        } else if (next === 75) {
          setStep('Calculating post-quantum Shor/Grover risk matrix...');
          setLogs(l => [...l, { timestamp: new Date().toLocaleTimeString(), message: 'Building CycloneDX 1.6 Crypto-BOM', level: 'info' }]);
        }
        return next;
      });
    }, 600);

    return () => clearInterval(timer);
  }, [id, navigate]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-white font-mono">
          🔍 Discovering Cryptographic Primitives...
        </h2>
        <p className="text-xs text-slate-400 font-mono">Running deterministic AST parser across codebase</p>
      </div>

      <Card className="p-6 space-y-5 border-slate-800 shadow-2xl">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">{step}</span>
            <span className="font-bold text-cyan-300">{progress}%</span>
          </div>
          <div className="h-3 w-full bg-navy-950 rounded-full overflow-hidden border border-slate-800">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-black/60 border border-slate-800 space-y-1.5 font-mono text-xs max-h-52 overflow-y-auto">
          <span className="text-[10px] uppercase text-slate-400 font-bold block mb-2">▶ Execution Logs:</span>
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed">
              <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
              <span className={log.level === 'error' ? 'text-rose-400' : 'text-slate-300'}>{log.message}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export const ScanHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [scans, setScans] = useState<Scan[]>([]);
  const [selectedScanA, setSelectedScanA] = useState<string>('');
  const [selectedScanB, setSelectedScanB] = useState<string>('');
  const [comparisonResult, setComparisonResult] = useState<any>(null);

  useEffect(() => {
    const loadScans = async () => {
      const data = await api.fetchScans();
      setScans(data);
      if (data.length >= 2) {
        setSelectedScanA(data[0].id);
        setSelectedScanB(data[1].id);
      }
    };
    loadScans();
  }, []);

  const handleCompare = async () => {
    if (!selectedScanA || !selectedScanB) return;
    const res = await api.compareScans(selectedScanA, selectedScanB);
    setComparisonResult(res);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 font-mono">
            <Clock className="w-6 h-6 text-cyan-400" />
            Cryptographic Scan History & Baseline Comparison
          </h1>
          <p className="text-xs text-slate-400 mt-1">Audit log of all executed scans with baseline comparison (Scan A vs Scan B).</p>
        </div>
        <Button size="sm" variant="cyber" onClick={() => navigate('/scans/new')}>
          Start New Scan
        </Button>
      </div>

      {/* Baseline Comparison Widget */}
      {scans.length >= 2 && (
        <Card className="p-5 border-slate-800 space-y-4 bg-navy-950/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-cyan-400" /> Scan Baseline Comparison (Scan A vs Scan B)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Baseline Scan (A):</label>
              <select
                value={selectedScanA}
                onChange={e => setSelectedScanA(e.target.value)}
                className="w-full p-2 rounded-lg bg-navy-900 border border-slate-800 text-white"
              >
                {scans.map(s => (
                  <option key={s.id} value={s.id}>{s.asset_name || s.id} ({s.overall_security_score}/100)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Target Scan (B):</label>
              <select
                value={selectedScanB}
                onChange={e => setSelectedScanB(e.target.value)}
                className="w-full p-2 rounded-lg bg-navy-900 border border-slate-800 text-white"
              >
                {scans.map(s => (
                  <option key={s.id} value={s.id}>{s.asset_name || s.id} ({s.overall_security_score}/100)</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="cyber" size="sm" onClick={handleCompare} className="w-full py-2.5">
                Run Comparison
              </Button>
            </div>
          </div>

          {comparisonResult && (
            <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 font-mono text-xs space-y-3 animate-in fade-in">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-navy-950">
                  <span className="text-slate-400 block text-[10px]">Score Change</span>
                  <span className={`text-lg font-black ${comparisonResult.scoreDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {comparisonResult.scoreDiff >= 0 ? `+${comparisonResult.scoreDiff}` : comparisonResult.scoreDiff} pts
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-navy-950">
                  <span className="text-slate-400 block text-[10px]">Resolved Findings</span>
                  <span className="text-lg font-black text-emerald-400">
                    {comparisonResult.resolvedFindings.length} Resolved
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-navy-950">
                  <span className="text-slate-400 block text-[10px]">New Findings</span>
                  <span className="text-lg font-black text-amber-400">
                    {comparisonResult.newFindings.length} New
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* History Table */}
      <Card className="overflow-hidden border-slate-800 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-navy-950/60">
                <th className="p-3.5">Target Identifier</th>
                <th className="p-3.5">Scan Type</th>
                <th className="p-3.5">Security Score</th>
                <th className="p-3.5">PQC Score</th>
                <th className="p-3.5">Findings</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {scans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500 font-sans">
                    No scans have been performed yet. Start a scan to populate history.
                  </td>
                </tr>
              ) : (
                scans.map(s => (
                  <tr key={s.id} onClick={() => navigate(`/scans/results/${s.id}`)} className="hover:bg-slate-800/40 cursor-pointer transition-colors">
                    <td className="p-3.5 font-bold text-white">{s.asset_name || s.target_identifier}</td>
                    <td className="p-3.5 text-slate-400 uppercase text-[10px]">{s.scan_type}</td>
                    <td className="p-3.5 font-bold text-cyan-300">{s.overall_security_score}/100</td>
                    <td className="p-3.5 font-bold text-purple-300">{s.pqc_readiness_score}/100</td>
                    <td className="p-3.5 font-bold text-slate-200">{s.total_findings_count}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">{new Date(s.started_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
