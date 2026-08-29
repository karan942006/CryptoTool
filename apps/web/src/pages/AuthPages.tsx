import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Building, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useApp } from '../context/AppContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const [email, setEmail] = useState('admin@cryptotool.internal');
  const [password, setPassword] = useState('••••••••••••');
  const [role, setRole] = useState<'owner' | 'admin' | 'analyst' | 'viewer'>('owner');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification('Welcome back', `Logged in as Chief Security Officer (${role.toUpperCase()})`, 'success');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6 text-slate-100 font-sans">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center text-navy-950 font-black mx-auto shadow-xl shadow-cyan-500/20">
            <Shield className="w-7 h-7 text-navy-950" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white font-mono">CRYPTOTOOL</h2>
          <p className="text-xs text-slate-400">Enterprise Cryptographic Discovery & Analysis Platform</p>
        </div>

        <div className="p-8 rounded-2xl border border-slate-800 bg-navy-900/90 shadow-2xl backdrop-blur-md space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Organization Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-navy-950 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 font-mono"
                  placeholder="name@organization.gov.in"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                  Master Password
                </label>
                <Link to="/forgot-password" className="text-xs text-cyan-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-navy-950 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 font-mono"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            {/* Quick RBAC Role Selection for Demo */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                Active RBAC Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['owner', 'admin', 'analyst', 'viewer'] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-1.5 px-2.5 rounded-lg border text-xs font-mono capitalize transition-all ${
                      role === r
                        ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300 font-bold'
                        : 'border-slate-800 bg-navy-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              variant="cyber"
              size="lg"
              className="w-full mt-4"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Console
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
            Need an enterprise account?{' '}
            <Link to="/register" className="text-cyan-400 font-semibold hover:underline">
              Create Organization
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification('Organization Registered', `Organization "${orgName}" created successfully.`, 'success');
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6 text-slate-100 font-sans">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center text-navy-950 font-black mx-auto shadow-xl shadow-cyan-500/20">
            <Shield className="w-7 h-7 text-navy-950" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white font-mono">CRYPTOTOOL</h2>
          <p className="text-xs text-slate-400">Register Authorized Enterprise Organization</p>
        </div>

        <div className="p-8 rounded-2xl border border-slate-800 bg-navy-900/90 shadow-2xl backdrop-blur-md space-y-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Organization Name
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-navy-950 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 font-mono"
                  placeholder="e.g. State Cyber Security Authority"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-navy-950 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 font-mono"
                  placeholder="admin@authority.gov.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Security Passphrase
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-navy-950 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 font-mono"
                  placeholder="Minimum 12 characters"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="cyber"
              size="lg"
              className="w-full mt-4"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Complete Registration
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="text-cyan-400 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification('Password Reset', `Recovery instructions dispatched to ${email}`, 'info');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6 text-slate-100 font-sans">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center text-navy-950 font-black mx-auto shadow-xl shadow-cyan-500/20">
            <Shield className="w-7 h-7 text-navy-950" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white font-mono">Reset Password</h2>
          <p className="text-xs text-slate-400">Enter your organization email to receive recovery instructions</p>
        </div>

        <div className="p-8 rounded-2xl border border-slate-800 bg-navy-900/90 shadow-2xl backdrop-blur-md space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Organization Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-navy-950 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 font-mono"
                  placeholder="admin@organization.gov.in"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full">
              Send Reset Link
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
            Remember your credentials?{' '}
            <Link to="/login" className="text-cyan-400 font-semibold hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6 text-slate-100 font-sans">
      <div className="w-full max-w-xl p-8 rounded-3xl border border-cyan-500/30 bg-navy-900 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white font-mono">Welcome to CryptoTool</h2>
          <p className="text-sm text-slate-400">Authorized Enterprise Cryptographic Discovery & Analysis Platform</p>
        </div>

        <div className="space-y-3 pt-2 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-lg bg-brand-600/20 text-brand-400 font-bold flex items-center justify-center shrink-0">1</span>
            <div>
              <p className="font-semibold text-white">Register Authorized Assets</p>
              <p className="text-slate-400 mt-0.5">Upload source-code ZIP archives or configure authorized HTTPS endpoints.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-lg bg-brand-600/20 text-brand-400 font-bold flex items-center justify-center shrink-0">2</span>
            <div>
              <p className="font-semibold text-white">Execute Multi-Layer Discovery</p>
              <p className="text-slate-400 mt-0.5">Extract algorithms, modes, key lengths, and generate central Crypto-BOM.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-lg bg-brand-600/20 text-brand-400 font-bold flex items-center justify-center shrink-0">3</span>
            <div>
              <p className="font-semibold text-white">Review PQC Readiness & AI Roadmaps</p>
              <p className="text-slate-400 mt-0.5">Evaluate post-quantum migration priority and export executive PDF reports.</p>
            </div>
          </div>
        </div>

        <Button
          variant="cyber"
          size="lg"
          className="w-full mt-4"
          onClick={() => navigate('/dashboard')}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Enter Dashboard Console
        </Button>
      </div>
    </div>
  );
};
