import React, { useEffect, useState } from 'react';
import {
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Clock,
  AlertTriangle,
  UploadCloud,
  FileCode,
  CheckCircle2,
  ExternalLink,
  Shield,
  Cpu,
  Plus
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CertificateEntry } from '../types';
import * as api from '../services/api';
import { parsePemCertificate, ParsedCertificateInfo } from '../services/certParser';
import { useApp } from '../context/AppContext';

export const CertificatesPage: React.FC = () => {
  const { addNotification } = useApp();
  const [certs, setCerts] = useState<CertificateEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'inventory' | 'inspector' | 'lifecycle'>('inventory');
  const [pemInput, setPemInput] = useState('');
  const [inspectedCert, setInspectedCert] = useState<ParsedCertificateInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCerts = async () => {
      try {
        setIsLoading(true);
        const data = await api.fetchCertificates();
        setCerts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadCerts();
  }, []);

  const handleInspectPem = () => {
    if (!pemInput.trim()) {
      addNotification('PEM Required', 'Please paste valid X.509 PEM certificate content.', 'error');
      return;
    }
    try {
      const parsed = parsePemCertificate(pemInput);
      setInspectedCert(parsed);
      addNotification('Certificate Parsed', `Parsed X.509 cert: ${parsed.subject}`, 'success');
    } catch (e: any) {
      addNotification('Parse Failed', e.message || 'Could not parse certificate', 'error');
    }
  };

  const expiringSoonCount = certs.filter(c => c.days_until_expiry <= 30 && c.days_until_expiry > 0).length;
  const expiredCount = certs.filter(c => c.days_until_expiry <= 0).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5 font-mono">
            <KeyRound className="w-6 h-6 text-cyan-400" />
            TLS & X.509 Certificate Lifecycle Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time inspection of public key certificates, expiration horizons, key algorithms, signature schemes, and quantum vulnerabilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="cyber"
            onClick={() => setActiveTab('inspector')}
            leftIcon={<UploadCloud className="w-4 h-4" />}
          >
            Inspect PEM Certificate
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 font-mono text-xs">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'inventory' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          Monitored Certificates ({certs.length})
        </button>

        <button
          onClick={() => setActiveTab('inspector')}
          className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'inspector' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          Live Certificate Parser
        </button>
      </div>

      {/* Tab 1: Monitored Certificates */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certs.map(c => {
            const isHealthy = c.health_status === 'healthy';
            const isExpired = c.health_status === 'expired' || c.days_until_expiry <= 0;
            return (
              <Card
                key={c.id}
                glow={isExpired ? 'purple' : (isHealthy ? 'blue' : 'none')}
                className={isExpired ? 'border-rose-500/40' : ''}
              >
                <div className="space-y-4 text-xs font-mono">
                  <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 font-semibold">Endpoint</span>
                      <h3 className="text-sm font-bold text-white mt-0.5">{c.endpoint}</h3>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        isExpired
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : isHealthy
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {c.health_status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-500">Negotiated TLS:</span>
                      <p className="font-bold text-cyan-300 mt-0.5">{c.tls_version}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Cipher Suite:</span>
                      <p className="font-semibold text-slate-200 mt-0.5 truncate">{c.cipher_suite}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Public Key:</span>
                      <p className="font-semibold text-slate-200 mt-0.5">{c.public_key_algorithm}-{c.public_key_size || 2048}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Signature Scheme:</span>
                      <p className="font-semibold text-slate-200 mt-0.5">{c.signature_algorithm}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px]">
                    <div><span className="text-slate-500">Subject:</span> <span className="text-slate-300">{c.subject}</span></div>
                    <div><span className="text-slate-500">Issuer:</span> <span className="text-slate-300">{c.issuer}</span></div>
                    <div>
                      <span className="text-slate-500">Validity Horizon:</span>{' '}
                      <span className={c.days_until_expiry < 30 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                        {c.days_until_expiry} days remaining ({new Date(c.valid_until).toLocaleDateString()})
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tab 2: Live PEM Parser */}
      {activeTab === 'inspector' && (
        <div className="space-y-6 font-mono text-xs">
          <Card className="p-6 space-y-4 border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-white">Paste X.509 PEM Certificate or OpenSSL Text</h3>
            <textarea
              rows={8}
              placeholder="-----BEGIN CERTIFICATE-----&#10;MIIDdTCCAl2gAwIBAgIU...&#10;-----END CERTIFICATE-----"
              value={pemInput}
              onChange={e => setPemInput(e.target.value)}
              className="w-full p-3 rounded-xl bg-navy-950 border border-slate-800 text-cyan-300 font-mono text-xs placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
            />
            <div className="flex justify-end">
              <Button variant="cyber" onClick={handleInspectPem} leftIcon={<KeyRound className="w-4 h-4" />}>
                Parse & Inspect Certificate
              </Button>
            </div>
          </Card>

          {inspectedCert && (
            <Card className="p-6 space-y-5 border-slate-800 shadow-2xl animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-semibold">Parsed Subject</span>
                  <h3 className="text-base font-bold text-white mt-0.5">{inspectedCert.subject}</h3>
                </div>
                <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase ${
                  inspectedCert.health_status === 'healthy' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  inspectedCert.health_status === 'expired' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {inspectedCert.health_status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Public Key Algorithm</span>
                  <span className="text-sm font-bold text-cyan-300">{inspectedCert.public_key_algorithm} ({inspectedCert.public_key_size}-bit)</span>
                </div>
                <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Signature Scheme</span>
                  <span className="text-sm font-bold text-white">{inspectedCert.signature_algorithm}</span>
                </div>
                <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Days Remaining</span>
                  <span className={`text-sm font-bold ${inspectedCert.days_until_expiry < 30 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {inspectedCert.days_until_expiry} days
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Post-Quantum Threat</span>
                  <span className={`text-sm font-bold ${inspectedCert.is_quantum_vulnerable ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {inspectedCert.is_quantum_vulnerable ? '🔴 Shor Vulnerable' : '🟢 Quantum Resilient'}
                  </span>
                </div>
              </div>

              {/* Certificate Findings */}
              {inspectedCert.findings.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Security Observations:</span>
                  <div className="space-y-2">
                    {inspectedCert.findings.map((f, i) => (
                      <div key={i} className="p-3 rounded-lg bg-navy-950 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{f.title}</span>
                          <Badge variant={f.severity === 'critical' ? 'critical' : 'medium'}>{f.severity.toUpperCase()}</Badge>
                        </div>
                        <p className="text-slate-400 text-[11px] font-sans">{f.description}</p>
                        <p className="text-cyan-400 text-[11px] font-sans"><strong>Remediation:</strong> {f.remediation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
