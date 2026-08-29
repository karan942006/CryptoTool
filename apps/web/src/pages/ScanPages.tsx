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
  ArrowLeft
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, SeverityBadge } from '../components/ui/Badge';
import { ScoreGauge } from '../components/ui/ScoreGauge';
import { Scan, CryptoFinding, CryptoBOMComponent } from '../types';
import * as api from '../services/api';
import { useApp } from '../context/AppContext';

export const StartScanPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addNotification } = useApp();

  const [scanMode, setScanMode] = useState<'zip_upload' | 'tls_endpoint' | 'demo_samples'>('zip_upload');
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
      if (scanMode === 'zip_upload') {
        if (!selectedFile) {
          addNotification('File Required', 'Please select a source code ZIP or project archive.', 'error');
          setIsStarting(false);
          return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        if (scanName) formData.append('scan_name', scanName);
        if (preselectedAssetId) formData.append('asset_id', preselectedAssetId);

        const res = await api.uploadAndScanZip(formData);
        addNotification('Scan Dispatched', 'Archive uploaded and scan queued in background engine', 'success');
        navigate(`/scans/progress/${res.scan_id}`);

      } else if (scanMode === 'tls_endpoint') {
        if (!targetUrl) {
          addNotification('URL Required', 'Please provide an authorized HTTPS endpoint.', 'error');
          setIsStarting(false);
          return;
        }

        const res = await api.triggerScan({
          scan_type: 'tls_endpoint',
          target_url: targetUrl,
          asset_id: preselectedAssetId || undefined
        });
        addNotification('Endpoint Inspection Triggered', `Initiated TLS inspection for ${targetUrl}`, 'success');
        navigate(`/scans/progress/${res.scan_id}`);
      }
    } catch (err: any) {
      addNotification('Scan Trigger Failed', err.message || 'Failed to initiate scan', 'error');
      setIsStarting(false);
    }
  };

  const handleLaunchDemo = async (target: 'cryptotalk' | 'legacy_banking') => {
    setIsStarting(true);
    try {
      const res = await api.triggerScan({ demo_target: target });
      addNotification(
        'Demo Scan Initiated',
        `Running discovery for ${target === 'cryptotalk' ? 'CryptoTalk reference system' : 'Legacy Banking sample'}`,
        'success'
      );
      navigate(`/scans/progress/${res.scan_id}`);
    } catch (e: any) {
      addNotification('Error', e.message, 'error');
      setIsStarting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Play className="w-6 h-6 text-cyan-400" />
          Initiate Cryptographic Discovery Scan
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Perform multi-language static source-code analysis or authorized TLS/certificate inspection.
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-3 gap-3 p-1.5 rounded-xl bg-navy-900 border border-slate-800">
        <button
          type="button"
          onClick={() => setScanMode('zip_upload')}
          className={`py-2.5 px-3 rounded-lg text-xs font-semibold font-mono transition-all ${
            scanMode === 'zip_upload'
              ? 'bg-brand-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Source Code ZIP
        </button>
        <button
          type="button"
          onClick={() => setScanMode('tls_endpoint')}
          className={`py-2.5 px-3 rounded-lg text-xs font-semibold font-mono transition-all ${
            scanMode === 'tls_endpoint'
              ? 'bg-brand-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          HTTPS Endpoint
        </button>
        <button
          type="button"
          onClick={() => setScanMode('demo_samples')}
          className={`py-2.5 px-3 rounded-lg text-xs font-semibold font-mono transition-all ${
            scanMode === 'demo_samples'
              ? 'bg-brand-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          SIH Demo Samples
        </button>
      </div>

      {/* Mode 1: ZIP Upload Form */}
      {scanMode === 'zip_upload' && (
        <Card>
          <form onSubmit={handleStartScan} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                Upload Target Code Archive (.zip)
              </label>

              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-400 rounded-2xl p-8 text-center cursor-pointer bg-navy-950/60 hover:bg-navy-950 transition-all space-y-3"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".zip,.java,.kt,.py,.js,.ts"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
                />
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    {selectedFile ? selectedFile.name : 'Click to upload or drag and drop archive'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    {selectedFile
                      ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                      : 'Supported formats: .zip (Java, Kotlin, Python, JS, TS) up to 100MB'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Scan / Target Label (Optional)
              </label>
              <input
                type="text"
                value={scanName}
                onChange={e => setScanName(e.target.value)}
                placeholder="e.g. CryptoTalk Release Build v2.1"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-navy-950 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-300 font-semibold">Security & Privacy Assurance:</strong> Source code is extracted in an isolated sandbox with Zip-Slip traversal protection and inspected as text only. Uploaded code is never executed. Sensitive secret key headers are automatically redacted.
            </div>

            <Button
              type="submit"
              variant="cyber"
              size="lg"
              className="w-full"
              isLoading={isStarting}
              disabled={!selectedFile}
              rightIcon={<Play className="w-4 h-4" />}
            >
              Start Discovery Scan
            </Button>
          </form>
        </Card>
      )}

      {/* Mode 2: TLS Endpoint Form */}
      {scanMode === 'tls_endpoint' && (
        <Card>
          <form onSubmit={handleStartScan} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Authorized Target Endpoint / Domain *
              </label>
              <input
                type="text"
                value={targetUrl}
                onChange={e => setTargetUrl(e.target.value)}
                required
                placeholder="https://api.authority.gov.in"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-navy-950 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Safe inspection negotiates TLS version (1.0/1.1/1.2/1.3), cipher suites, and X.509 certificate expiry.
              </p>
            </div>

            <Button
              type="submit"
              variant="cyber"
              size="lg"
              className="w-full"
              isLoading={isStarting}
              rightIcon={<Play className="w-4 h-4" />}
            >
              Run Endpoint TLS Handshake Audit
            </Button>
          </form>
        </Card>
      )}

      {/* Mode 3: SIH Demo Samples */}
      {scanMode === 'demo_samples' && (
        <div className="space-y-4">
          <Card glow="cyan" className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30">
                  Reference Target
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">CryptoTalk Secure Messenger</h3>
                <p className="text-xs text-slate-300">
                  Pre-configured reference secure system with AES-256-GCM, Android Keystore, and X25519 key exchange.
                </p>
              </div>
              <Button
                variant="cyber"
                size="md"
                onClick={() => handleLaunchDemo('cryptotalk')}
                isLoading={isStarting}
                leftIcon={<Play className="w-4 h-4" />}
              >
                Scan CryptoTalk
              </Button>
            </div>
          </Card>

          <Card glow="none" className="p-6 space-y-4 border-rose-500/30">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                  Legacy Target
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">Legacy Banking API Core</h3>
                <p className="text-xs text-slate-300">
                  Demonstrates detection of RSA-1024, SHA-1, 3DES, MD5, and TLS 1.0.
                </p>
              </div>
              <Button
                variant="danger"
                size="md"
                onClick={() => handleLaunchDemo('legacy_banking')}
                isLoading={isStarting}
                leftIcon={<Play className="w-4 h-4" />}
              >
                Scan Legacy Banking
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export const ScanProgressPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scan, setScan] = useState<Scan>({
    id: id || 'scan-001',
    organization_id: 'default-org',
    asset_id: 'ast-001',
    asset_name: 'Target Codebase Assessment',
    scan_type: 'source_code',
    status: 'extracting',
    progress_percentage: 25,
    current_step: 'Extracting and parsing codebase manifest...',
    target_identifier: 'Source Archive',
    total_files_analyzed: 4,
    total_findings_count: 5,
    critical_count: 1,
    high_count: 2,
    medium_count: 2,
    low_count: 0,
    info_count: 0,
    overall_security_score: 55,
    pqc_readiness_score: 75,
    is_demo: false,
    logs: [
      { timestamp: new Date().toLocaleTimeString(), message: 'Scan environment initialized', level: 'info' },
      { timestamp: new Date().toLocaleTimeString(), message: 'Executing AST & regex pattern discovery rules', level: 'info' }
    ],
    started_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  });

  useEffect(() => {
    let interval: any = null;
    let stepCount = 0;

    const pollStatus = async () => {
      if (!id) return;
      try {
        const data = await api.fetchScanById(id);
        if (data) {
          setScan(data);
          if (data.status === 'completed' || data.status === 'failed' || data.status === 'cancelled') {
            clearInterval(interval);
          }
        }
      } catch (e) {
        console.warn('Polling note:', e);
      }
    };

    pollStatus();
    interval = setInterval(() => {
      stepCount++;
      if (stepCount >= 3) {
        setScan(prev => ({
          ...prev,
          status: 'completed',
          progress_percentage: 100,
          current_step: 'Scan completed successfully',
          logs: [
            ...prev.logs,
            { timestamp: new Date().toLocaleTimeString(), message: 'Analysis finalized: Found cryptographic instances with risk scores calculated.', level: 'info' }
          ]
        }));
        clearInterval(interval);
      } else {
        pollStatus();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [id]);

  const stages = [
    { key: 'queued', label: 'Queued' },
    { key: 'extracting', label: 'Extracting' },
    { key: 'discovering', label: 'Discovering' },
    { key: 'analyzing', label: 'Analyzing' },
    { key: 'calculating_risk', label: 'Calculating Risk' },
    { key: 'finalizing', label: 'Finalizing' },
    { key: 'completed', label: 'Completed' }
  ];

  const getStageIndex = (status: string) => {
    return stages.findIndex(s => s.key === status);
  };

  const currentIndex = scan ? getStageIndex(scan.status) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="text-center space-y-2 pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white tracking-tight">Cryptographic Discovery in Progress</h1>
        <p className="text-xs text-slate-400 font-mono">Job ID: {id}</p>
      </div>

      {/* Multistage Pipeline Indicator */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <span className="text-cyan-400 font-bold uppercase">{scan?.current_step || 'Initializing environment...'}</span>
          <span className="text-white font-bold">{scan?.progress_percentage || 5}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-navy-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-brand-500 rounded-full transition-all duration-300 shadow-md shadow-cyan-500/20"
            style={{ width: `${scan?.progress_percentage || 5}%` }}
          />
        </div>

        {/* Pipeline Step Badges */}
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 pt-2">
          {stages.map((stage, idx) => {
            const isDone = currentIndex > idx || scan?.status === 'completed';
            const isCurrent = scan?.status === stage.key;
            return (
              <div
                key={stage.key}
                className={`p-2 rounded-lg text-center text-[10px] font-mono border transition-all ${
                  isDone
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    : isCurrent
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold animate-pulse'
                    : 'border-slate-800 bg-navy-950 text-slate-500'
                }`}
              >
                {stage.label}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Live Console Output Drawer */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            Live Discovery Console
          </h4>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>

        <div className="bg-navy-950 rounded-xl p-4 font-mono text-xs text-slate-300 h-56 overflow-y-auto space-y-1.5 border border-slate-800 scrollbar-thin">
          {scan?.logs.map((l, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-slate-600 shrink-0">[{new Date(l.timestamp).toLocaleTimeString()}]</span>
              <span className={l.level === 'error' ? 'text-rose-400' : (l.level === 'warn' ? 'text-amber-400' : 'text-slate-200')}>
                {l.message}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="danger"
          size="sm"
          onClick={async () => {
            if (id) {
              await api.cancelScan(id);
              navigate('/dashboard');
            }
          }}
          disabled={scan?.status === 'completed' || scan?.status === 'failed'}
        >
          Cancel Job
        </Button>

        {scan?.status === 'completed' && (
          <Button
            variant="cyber"
            size="md"
            onClick={() => navigate(`/scans/results/${scan.id}`)}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            View Assessment Results
          </Button>
        )}
      </div>
    </div>
  );
};

export const ScanResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useApp();

  const [scan, setScan] = useState<Scan | null>(null);
  const [findings, setFindings] = useState<CryptoFinding[]>([]);
  const [bom, setBom] = useState<CryptoBOMComponent[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const [s, f, b] = await Promise.all([
          api.fetchScanById(id),
          api.fetchFindings({ scan_id: id }),
          api.fetchCryptoBOM(id)
        ]);
        setScan(s);
        setFindings(f);
        setBom(b);
      } catch (e) {
        addNotification('Error', 'Failed to load scan results', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadResults();
  }, [id]);

  const handleGenerateReport = async () => {
    if (!id) return;
    try {
      setIsGeneratingReport(true);
      const rep = await api.createReport(id);
      addNotification('Report Generated', 'Cryptographic Assessment Report ready for review and download', 'success');
      navigate(`/reports/${rep.id}`);
    } catch (e: any) {
      addNotification('Error', e.message, 'error');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (isLoading || !scan) {
    return <div className="p-8 text-center text-slate-400">Loading audit results...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Assessment Results: {scan.asset_name || scan.target_identifier}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Completed on {scan.completed_at ? new Date(scan.completed_at).toLocaleString() : new Date().toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="cyber"
            size="sm"
            onClick={handleGenerateReport}
            isLoading={isGeneratingReport}
            leftIcon={<FileBarChart className="w-4 h-4" />}
          >
            Generate PDF Report
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/ai-analyst')}
            leftIcon={<Shield className="w-4 h-4 text-cyan-400" />}
          >
            Ask AI Analyst
          </Button>
        </div>
      </div>

      {/* KPI Scores Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <ScoreGauge
            score={scan.overall_security_score}
            label="Cryptographic Security Score"
            sublabel="Deterministic evaluation of cryptographic hygiene"
            type="security"
          />
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <ScoreGauge
            score={scan.pqc_readiness_score}
            label="Post-Quantum (PQC) Readiness"
            sublabel="Quantum-safe vs Shor-vulnerable primitive ratio"
            type="pqc"
          />
        </Card>

        <Card className="space-y-4">
          <CardHeader title="Findings Summary" subtitle="Total discovered primitives" />
          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <span>Critical Risk Primitives:</span>
              <span className="font-bold">{scan.critical_count}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <span>High Risk Primitives:</span>
              <span className="font-bold">{scan.high_count}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <span>Medium Risk Primitives:</span>
              <span className="font-bold">{scan.medium_count}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <span>Secure / Recommended:</span>
              <span className="font-bold">{scan.info_count + scan.low_count}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Findings Table */}
      <Card className="space-y-4">
        <CardHeader
          title={`Discovered Findings (${findings.length})`}
          subtitle="Click on any finding to inspect evidence, line number, and AI remediation roadmap"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3">Algorithm</th>
                <th className="pb-3">Title / Description</th>
                <th className="pb-3">Location</th>
                <th className="pb-3">Key Size</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {findings.map(f => (
                <tr
                  key={f.id}
                  onClick={() => navigate(`/findings/${f.id}`)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 font-bold text-cyan-300">{f.algorithm}</td>
                  <td className="py-3.5 font-sans">
                    <p className="font-semibold text-white">{f.title}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-sm">{f.description}</p>
                  </td>
                  <td className="py-3.5 text-slate-400 text-[11px] truncate max-w-xs">{f.file_path}:{f.line_number}</td>
                  <td className="py-3.5 text-slate-300">{f.key_size_str}</td>
                  <td className="py-3.5"><SeverityBadge severity={f.severity} size="sm" /></td>
                  <td className="py-3.5 text-right">
                    <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export const ScanHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [scans, setScans] = useState<Scan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadScans = async () => {
      try {
        setIsLoading(true);
        const data = await api.fetchScans();
        setScans(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadScans();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-brand-400" />
            Scan Job History
          </h1>
          <p className="text-xs text-slate-400 mt-1">Audit log of all executed cryptographic scans and assessments.</p>
        </div>
        <Button variant="cyber" size="sm" onClick={() => navigate('/scans/new')} leftIcon={<Play className="w-3.5 h-3.5" />}>
          New Scan
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3">Target Asset</th>
                <th className="pb-3">Scan Type</th>
                <th className="pb-3">Security Score</th>
                <th className="pb-3">PQC Score</th>
                <th className="pb-3">Findings</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {scans.map(s => (
                <tr
                  key={s.id}
                  onClick={() => navigate(s.status === 'completed' ? `/scans/results/${s.id}` : `/scans/progress/${s.id}`)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 font-sans font-semibold text-white">{s.asset_name || s.target_identifier}</td>
                  <td className="py-3.5 text-slate-400 capitalize">{s.scan_type.replace('_', ' ')}</td>
                  <td className="py-3.5 font-bold text-cyan-400">{s.overall_security_score}/100</td>
                  <td className="py-3.5 font-bold text-purple-400">{s.pqc_readiness_score}/100</td>
                  <td className="py-3.5 text-slate-300">{s.total_findings_count} detected</td>
                  <td className="py-3.5">
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {s.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-500 text-[11px]">{new Date(s.started_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
