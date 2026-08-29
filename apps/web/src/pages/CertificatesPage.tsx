import React, { useEffect, useState } from 'react';
import {
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Clock,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CertificateEntry } from '../types';
import * as api from '../services/api';

export const CertificatesPage: React.FC = () => {
  const [certs, setCerts] = useState<CertificateEntry[]>([]);
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <KeyRound className="w-6 h-6 text-brand-400" />
          TLS Configuration & X.509 Certificate Inventory
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Inspection of public key certificates, expiration horizons, key algorithms, signature schemes, and SANs.
        </p>
      </div>

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
    </div>
  );
};
