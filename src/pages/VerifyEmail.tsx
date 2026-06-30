import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { SectionHeader } from '../components/SectionHeader';
import { MailCheck, KeyRound, ArrowRight } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const API_BASE = localStorage.getItem('VITE_API_BASE_URL') || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showNotification } = useNotifications();

  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  // Auto-fill token if present in URL query
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.detail || 'Email verification failed.');
      }

      showNotification('Email verified successfully! You can now access your dashboard.', 'success');
      setVerified(true);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification token.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <SectionHeader
        title="Verify Workspace Email"
        subtitle="Confirm registration credentials to activate security certificates."
        badge="Verify Email"
      />

      <GlassCard className="border border-white/5 p-8 text-center shadow-2xl">
        {verified ? (
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center animate-bounce">
              <MailCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-slate-100">
              Account Activated!
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-400">
              Your email address was successfully verified. You are now authorized to use all community GIS features.
            </p>
            <Button variant="primary" className="w-full gap-2" onClick={() => navigate('/login')}>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/25 text-rose-500 text-sm rounded-xl font-medium" role="alert">
                {error}
              </div>
            )}

            {/* Token */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="token" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Verification Token Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4.5 h-4.5" />
                </div>
                <input
                  type="text"
                  id="token"
                  required
                  value={token}
                  onChange={(e) => { setToken(e.target.value); setError(null); }}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border border-white/10 dark:border-white/5 light:border-slate-350 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100"
                  placeholder="Paste verification token code"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
              <span>{isSubmitting ? 'Verifying...' : 'Verify Email Address'}</span>
            </Button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link to="/login" className="text-xs font-semibold text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            Return to Login
          </Link>
        </div>
      </GlassCard>
    </div>
  );
};
export default VerifyEmail;
