import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Layers,
  Cpu,
  Bot,
  Binary,
  KeyRound,
  FileBarChart,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  Play,
  Flame
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Cryptographic Discovery',
      description: 'Multi-layer AST and pattern extraction across Java, Kotlin, Python, JS/TS, plus safe TLS endpoint handshake analysis.',
      icon: Binary,
      color: 'text-cyan-400',
    },
    {
      title: 'Enterprise Crypto-BOM',
      description: 'Generate centralized Cryptographic Bills of Materials (Crypto-BOM) with instant JSON and CSV export capabilities.',
      icon: Layers,
      color: 'text-brand-400',
    },
    {
      title: 'Post-Quantum (PQC) Readiness',
      description: 'Evaluate quantum susceptibility against Shorâ€™s algorithm and formulate migration roadmaps referencing NIST FIPS 203/204.',
      icon: Cpu,
      color: 'text-purple-400',
    },
    {
      title: 'Deterministic Rules & Risk Engine',
      description: 'Mathematical security scoring derived strictly from verified technical findings without AI hallucinations.',
      icon: Flame,
      color: 'text-rose-400',
    },
    {
      title: 'AI Security Analyst',
      description: 'Gemini-assisted natural language threat contextualization, business impact analysis, and guided remediation roadmaps.',
      icon: Bot,
      color: 'text-emerald-400',
    },
    {
      title: 'Certificate & TLS Inspector',
      description: 'Audits X.509 certificate expiry horizons, key lengths, signature algorithms, and legacy protocol deprecations.',
      icon: KeyRound,
      color: 'text-amber-400',
    },
  ];

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 font-sans selection:bg-brand-500 selection:text-white">
      {/* Header Bar */}
      <header className="border-b border-slate-800/80 bg-navy-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center text-navy-950 font-black shadow-lg shadow-cyan-500/20">
            <Shield className="w-6 h-6 text-navy-950" />
          </div>
          <div>
            <span className="text-lg font-black tracking-wider text-white font-mono">CRYPTOTOOL</span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-semibold block -mt-1">
              ECDAT • ENTERPRISE SUITE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
            Sign In
          </Button>
          <Button variant="cyber" size="sm" onClick={() => navigate('/dashboard')} rightIcon={<ArrowRight className="w-4 h-4" />}>
            Launch Console
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Post-Quantum Cryptographic Discovery & Assessment Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Enterprise Cryptographic{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-brand-400 to-purple-500 bg-clip-text text-transparent">
            Discovery & Analysis
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto font-light leading-relaxed">
          <strong className="text-slate-200 font-semibold">Discover. Analyze. Quantify. Modernize.</strong> An authorized AI-assisted platform for building enterprise Cryptographic Bills of Materials (Crypto-BOM), identifying legacy cryptography, calculating deterministic risk, and accelerating Post-Quantum (PQC) migration.
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            variant="cyber"
            size="lg"
            onClick={() => navigate('/dashboard')}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Start Free Assessment
          </Button>
        </div>

        {/* Highlight Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-14 text-left">
          <div className="p-4 rounded-xl border border-slate-800 bg-navy-900/50 backdrop-blur-sm">
            <span className="text-2xl font-bold font-mono text-cyan-400">100%</span>
            <p className="text-xs text-slate-400 mt-1">Deterministic Rules Engine (Zero AI Hallucination)</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-800 bg-navy-900/50 backdrop-blur-sm">
            <span className="text-2xl font-bold font-mono text-brand-400">FIPS 203/204</span>
            <p className="text-xs text-slate-400 mt-1">NIST Post-Quantum Cryptography Catalog</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-800 bg-navy-900/50 backdrop-blur-sm">
            <span className="text-2xl font-bold font-mono text-purple-400">Crypto-BOM</span>
            <p className="text-xs text-slate-400 mt-1">Automated JSON & CSV Exportable Inventory</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-800 bg-navy-900/50 backdrop-blur-sm">
            <span className="text-2xl font-bold font-mono text-emerald-400">Zero Execution</span>
            <p className="text-xs text-slate-400 mt-1">Safe Static AST Analysis (Never executes code)</p>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider font-semibold">Core Capabilities</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Comprehensive Cryptographic Posture Management
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-800/80 bg-navy-900/40 hover:border-slate-700 hover:bg-navy-900/80 transition-all group space-y-4"
              >
                <div className="p-3 rounded-xl bg-slate-800/60 w-fit border border-slate-700/60 group-hover:border-cyan-500/40 transition-colors">
                  <Icon className={`w-6 h-6 ${feat.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">{feat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
