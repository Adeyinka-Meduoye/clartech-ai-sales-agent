import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, User, KeyRound, ArrowRight, AlertCircle, HelpCircle } from 'lucide-react';
import clartechLogo from '../assets/images/clartech_company_logo_1785172701052.jpg';

interface AdminLoginProps {
  onLogin: (user: { name: string; role: string; canDelete: boolean }) => void;
}

interface TeamUserOption {
  name: string;
  role: string;
  canDelete: boolean;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [teamUsers, setTeamUsers] = useState<TeamUserOption[]>([
    { name: 'Adeyinka Meduoye', role: 'Principal AI Solutions Architect', canDelete: true },
    { name: 'Gloria Irabor', role: 'Enterprise Sales & CRM Operations', canDelete: false }
  ]);
  const [selectedUsername, setSelectedUsername] = useState('Adeyinka Meduoye');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    fetch('/api/auth/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTeamUsers(data);
          setSelectedUsername(data[0].name);
        }
      })
      .catch(() => {});
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: selectedUsername, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      onLogin({
        name: data.name,
        role: data.role,
        canDelete: data.canDelete
      });
    } catch (err: any) {
      setError(err.message || 'Network error during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden" id="admin-login-screen">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative z-10"
      >
        {/* Header Logo & Title */}
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <div className="relative mb-3">
            <img 
              src={clartechLogo} 
              alt="Clartech Logo" 
              className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500/40 shadow-xl shadow-brand-500/20"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1 rounded-full border-2 border-slate-900 shadow">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">Clartech Enterprise Portal</h1>
          <p className="text-xs text-slate-400 mt-1">Autonomous B2B Sales & CRM Intelligence Gateway</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-5">
          {error && (
            <div className="bg-rose-950/60 border border-rose-900/80 text-rose-300 p-3.5 rounded-xl text-xs flex items-start gap-2.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-400" /> Select Username
              </span>
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="text-brand-400 hover:underline flex items-center gap-1 text-[10px] lowercase font-mono cursor-pointer"
              >
                <HelpCircle className="w-3 h-3" /> how to add/delete user?
              </button>
            </label>
            <div className="relative">
              <select
                value={selectedUsername}
                onChange={(e) => setSelectedUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-brand-500 font-sans transition appearance-none cursor-pointer"
              >
                {teamUsers.map((user) => (
                  <option key={user.name} value={user.name} className="bg-slate-900 text-slate-200">
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-3.5 pointer-events-none text-slate-500 text-xs font-mono">▼</div>
            </div>
          </div>

          {showHelp && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-xl text-xs text-slate-300 space-y-2 font-mono"
            >
              <div className="font-bold text-brand-400">How to Add or Delete Usernames:</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                User credentials are securely stored in <code className="text-brand-300 bg-slate-900 px-1 py-0.5 rounded">server.ts</code> (under the <code className="text-brand-300 bg-slate-900 px-1 py-0.5 rounded">teamUsers</code> array):
              </p>
              <ul className="list-disc list-inside text-[10px] text-slate-400 space-y-1">
                <li><strong>To Add:</strong> Add a new object with <code className="text-slate-200">name</code>, <code className="text-slate-200">role</code>, <code className="text-slate-200">password</code>, and <code className="text-slate-200">canDelete</code>.</li>
                <li><strong>To Delete:</strong> Remove the user's object from the <code className="text-slate-200">teamUsers</code> array.</li>
              </ul>
            </motion.div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-brand-400" /> Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] text-brand-400 hover:underline font-mono cursor-pointer"
              >
                {showPassword ? 'Hide' : 'Reveal'}
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 font-mono transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer text-sm shadow-lg shadow-brand-500/20 font-sans"
          >
            <span>{loading ? 'Authenticating...' : 'Authenticate & Launch Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
