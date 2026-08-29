import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Layers,
  Plus,
  Search,
  ExternalLink,
  Shield,
  Clock,
  Trash2,
  Play,
  CheckCircle2,
  FileCode,
  Globe,
  Server,
  Smartphone,
  ArrowLeft
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { DependencyGraph } from '../components/ui/DependencyGraph';
import { Asset, CryptoBOMComponent, CryptoFinding } from '../types';
import * as api from '../services/api';
import { useApp } from '../context/AppContext';

export const AssetsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadAssets = async () => {
    try {
      setIsLoading(true);
      const data = await api.fetchAssets();
      setAssets(data);
    } catch (e) {
      addNotification('Error', 'Failed to load asset inventory', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const filtered = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.owner.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || a.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mobile_app': return <Smartphone className="w-4 h-4 text-cyan-400" />;
      case 'web_app': return <Globe className="w-4 h-4 text-brand-400" />;
      case 'server': return <Server className="w-4 h-4 text-purple-400" />;
      default: return <FileCode className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-brand-400" />
            Authorized Systems & Assets
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Maintain authorized enterprise software repositories, API services, and infrastructure endpoints.
          </p>
        </div>

        <Button
          variant="cyber"
          size="sm"
          onClick={() => navigate('/assets/new')}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Asset
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search asset name or owner..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-700 bg-navy-900 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['all', 'uploaded_project', 'mobile_app', 'api', 'web_app', 'server'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-colors shrink-0 ${
                filterType === t
                  ? 'bg-brand-600/30 text-cyan-300 border border-brand-500/40 font-bold'
                  : 'bg-navy-900/60 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono tracking-wider">
                <th className="pb-3">System Name</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Criticality</th>
                <th className="pb-3">Environment</th>
                <th className="pb-3">Last Scan</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No matching assets found.
                  </td>
                </tr>
              ) : (
                filtered.map(a => (
                  <tr
                    key={a.id}
                    onClick={() => navigate(`/assets/${a.id}`)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60">
                          {getTypeIcon(a.type)}
                        </div>
                        <div>
                          <p className="font-bold text-white tracking-tight">{a.name}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs">{a.owner}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 font-mono capitalize text-slate-300">
                      {a.type.replace('_', ' ')}
                    </td>
                    <td className="py-3.5">
                      <Badge
                        variant={a.criticality === 'critical' ? 'critical' : a.criticality === 'high' ? 'high' : 'low'}
                        size="sm"
                      >
                        {a.criticality.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3.5 font-mono capitalize text-slate-300">
                      {a.environment}
                    </td>
                    <td className="py-3.5 text-slate-400 font-mono text-[11px]">
                      {a.last_scanned_at ? new Date(a.last_scanned_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-3.5 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/scans/new?asset_id=${a.id}`);
                        }}
                        leftIcon={<Play className="w-3.5 h-3.5 text-cyan-400" />}
                      >
                        Scan
                      </Button>
                    </td>
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

export const AddAssetPage: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<any>('uploaded_project');
  const [url, setUrl] = useState('');
  const [owner, setOwner] = useState('Cybersecurity Unit');
  const [environment, setEnvironment] = useState<'production' | 'staging' | 'development' | 'internal'>('production');
  const [criticality, setCriticality] = useState<'critical' | 'high' | 'medium' | 'low'>('high');
  const [exposure, setExposure] = useState<'external' | 'internal' | 'hybrid' | 'isolated'>('external');
  const [authConfirmed, setAuthConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authConfirmed) {
      addNotification('Authorization Required', 'You must explicitly confirm organizational authorization.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const asset = await api.createAsset({
        name,
        description,
        type,
        url: url || undefined,
        owner,
        environment,
        criticality,
        exposure,
        authorization_confirmed: true,
      });
      addNotification('Asset Registered', `Asset "${asset.name}" registered successfully.`, 'success');
      navigate(`/assets/${asset.id}`);
    } catch (err: any) {
      addNotification('Error', err.message || 'Failed to create asset', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-800">
        <button
          onClick={() => navigate('/assets')}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Register Assessment Asset</h1>
          <p className="text-xs text-slate-400 mt-0.5">Register an authorized application, API, or infrastructure target.</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Asset / System Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="e.g. Maharashtra DocVault Mobile Gateway"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-navy-950 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                placeholder="Brief description of the cryptographic implementation scope..."
                className="w-full px-4 py-2 rounded-xl border border-slate-700 bg-navy-950 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Asset Type
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-navy-950 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
              >
                <option value="uploaded_project">Uploaded Project / Source Code</option>
                <option value="mobile_app">Mobile Application (Android/iOS)</option>
                <option value="api">Backend API / Microservice</option>
                <option value="web_app">Web Application Portal</option>
                <option value="server">Core Cryptographic Server</option>
                <option value="certificate_endpoint">Public HTTPS Endpoint</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Target Endpoint / URL
              </label>
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://service.authority.gov.in"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-navy-950 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Criticality Tier
              </label>
              <select
                value={criticality}
                onChange={e => setCriticality(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-navy-950 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
              >
                <option value="critical">Critical (Mission Essential / PCI / PII)</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Network Exposure
              </label>
              <select
                value={exposure}
                onChange={e => setExposure(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-navy-950 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
              >
                <option value="external">External / Public Internet</option>
                <option value="internal">Internal DMZ / VPN</option>
                <option value="isolated">Isolated Air-Gapped Network</option>
              </select>
            </div>
          </div>

          {/* Authorization Checklist / Safety Requirement */}
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
            <h4 className="text-xs font-bold text-amber-300 uppercase font-mono tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              Organizational Authorization Mandate
            </h4>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={authConfirmed}
                onChange={e => setAuthConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-700 bg-navy-950 text-cyan-500 focus:ring-cyan-400"
              />
              <span className="text-xs text-slate-300 leading-relaxed">
                I explicitly confirm that our organization owns or has received verified authorization to discover, scan, and inspect the cryptographic posture of this asset in strict compliance with safety guidelines.
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" size="md" type="button" onClick={() => navigate('/assets')}>
              Cancel
            </Button>
            <Button variant="cyber" size="md" type="submit" isLoading={isSubmitting}>
              Register Asset
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export const AssetDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useApp();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [bom, setBom] = useState<CryptoBOMComponent[]>([]);
  const [findings, setFindings] = useState<CryptoFinding[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const [a, b, f] = await Promise.all([
          api.fetchAssetById(id),
          api.fetchCryptoBOM(id),
          api.fetchFindings({ asset_id: id })
        ]);
        setAsset(a);
        setBom(b);
        setFindings(f);
      } catch (e) {
        addNotification('Error', 'Failed to load asset details', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadDetails();
  }, [id]);

  if (isLoading || !asset) {
    return <div className="p-8 text-center text-slate-400">Loading asset profile...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/assets')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              {asset.name}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">{asset.description || 'Enterprise Asset Profile'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="cyber"
            size="sm"
            onClick={() => navigate(`/scans/new?asset_id=${asset.id}`)}
            leftIcon={<Play className="w-3.5 h-3.5" />}
          >
            Start Scan
          </Button>
        </div>
      </div>

      {/* Asset Meta Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Asset Type</span>
          <p className="text-sm font-bold text-white capitalize mt-1">{asset.type.replace('_', ' ')}</p>
        </Card>
        <Card className="p-4">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Criticality</span>
          <p className="text-sm font-bold text-white uppercase mt-1">{asset.criticality}</p>
        </Card>
        <Card className="p-4">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Exposure</span>
          <p className="text-sm font-bold text-white capitalize mt-1">{asset.exposure}</p>
        </Card>
        <Card className="p-4">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Last Scanned</span>
          <p className="text-sm font-bold text-cyan-400 font-mono mt-1">
            {asset.last_scanned_at ? new Date(asset.last_scanned_at).toLocaleDateString() : 'Never'}
          </p>
        </Card>
      </div>

      {/* Interactive Dependency Graph */}
      {bom.length > 0 && (
        <Card className="space-y-4">
          <CardHeader
            title="Cryptographic Architecture & Dependency Tree"
            subtitle="Interactive mapping from system components to cryptographic primitives"
          />
          <DependencyGraph appName={asset.name} components={bom} />
        </Card>
      )}

      {/* Findings on this asset */}
      <Card className="space-y-4">
        <CardHeader
          title={`Detected Findings (${findings.length})`}
          subtitle="Cryptographic vulnerabilities and verified primitives on this asset"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3">Algorithm</th>
                <th className="pb-3">Title</th>
                <th className="pb-3">Location</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {findings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 font-sans">
                    No findings detected for this asset.
                  </td>
                </tr>
              ) : (
                findings.map(f => (
                  <tr
                    key={f.id}
                    onClick={() => navigate(`/findings/${f.id}`)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 font-bold text-cyan-300">{f.algorithm}</td>
                    <td className="py-3 font-sans text-slate-300">{f.title}</td>
                    <td className="py-3 text-slate-400 text-[11px] truncate max-w-xs">{f.file_path}:{f.line_number}</td>
                    <td className="py-3"><Badge variant={f.severity}>{f.severity.toUpperCase()}</Badge></td>
                    <td className="py-3"><Badge variant="outline">{f.status}</Badge></td>
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
