import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { SectionHeader } from '../components/SectionHeader';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, currentUser, isAuthenticating } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customApiUrl, setCustomApiUrl] = useState(localStorage.getItem('VITE_API_BASE_URL') || '');
  const [showSettings, setShowSettings] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (customApiUrl.trim()) {
      localStorage.setItem('VITE_API_BASE_URL', customApiUrl.trim());
    } else {
      localStorage.removeItem('VITE_API_BASE_URL');
    }
    window.location.reload();
  };

  // If already logged in, redirect immediately
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const from = (location.state as any)?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        const roleRoutes = {
          Citizen: '/dashboard/citizen',
          Government: '/dashboard/government',
          NGO: '/dashboard/ngo',
          Admin: '/dashboard/admin',
        };
        navigate(roleRoutes[currentUser.role] || '/', { replace: true });
      }
    }
  }, [isAuthenticated, currentUser, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email.trim() || !password.trim()) {
      setError('Please fill in both email and password fields.');
      return;
    }

    try {
      await login(email, password, rememberMe);
    } catch (err: any) {
      setError(err.message || 'Incorrect credentials or account locked.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <SectionHeader
        title="Welcome Back"
        subtitle="Sign in to CivicMind AI to monitor your community alerts and active reports."
        badge="Secure Access"
      />

      <GlassCard className="border border-white/5 p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/25 text-rose-500 text-sm rounded-xl font-medium" role="alert">
              {error}
            </div>
          )}

          {/* Email Address */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4.5 h-4.5" />
              </div>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border border-white/10 dark:border-white/5 light:border-slate-350 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4.5 h-4.5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border border-white/10 dark:border-white/5 light:border-slate-350 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700/50 text-primary focus:ring-primary/20 accent-primary"
            />
            <label htmlFor="remember" className="ml-2.5 text-xs text-slate-750 dark:text-slate-400 select-none">
              Remember my session
            </label>
          </div>

          {/* Submit */}
          <Button type="submit" variant="primary" className="w-full gap-2" disabled={isAuthenticating}>
            <span>{isAuthenticating ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <span>Don't have an account? </span>
          <Link to="/register" className="font-semibold text-primary hover:text-primary-dark transition-colors">
            Register Workspace
          </Link>
        </div>

        {/* API Settings configuration toggler */}
        <div className="mt-6 border-t border-white/5 pt-4 text-center">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="text-[10px] text-slate-500 hover:text-slate-350 transition-colors uppercase tracking-wider font-bold"
          >
            {showSettings ? 'Hide Backend Settings' : 'Configure Backend Connection'}
          </button>

          {showSettings && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950/40 border border-white/5 text-left space-y-3">
              <div className="text-[10px] text-slate-450 leading-relaxed">
                If accessing the platform from a phone or other device, enter your local server address (e.g. <code>http://192.168.1.15:8000/api/v1</code>).
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="apiUrl" className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  Backend API Base URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="apiUrl"
                    value={customApiUrl}
                    onChange={(e) => setCustomApiUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/10 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="http://localhost:8000/api/v1"
                  />
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="px-3 py-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary text-xs font-semibold transition-all"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};
export default Login;
