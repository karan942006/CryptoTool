import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
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
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center text-navy-950 font-black mx-auto shadow-xl shadow-cyan-500/20">
            <Shield className="w-7 h-7 text-navy-950" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white font-mono">CRYPTOTOOL</h2>
          <p className="text-xs text-slate-400">Enterprise Cryptographic Discovery & Analysis Platform</p>
        </div>

        {/* Login Card */}
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
