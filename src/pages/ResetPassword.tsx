import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { SectionHeader } from '../components/SectionHeader';
import { Lock, ArrowLeft, KeyRound } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showNotification } = useNotifications();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill token if present in URL query
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError('Token code is required.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Confirm password must match the new password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.detail || 'Failed to update credentials.');
      }

      showNotification('Password updated successfully! Sign in with your new credentials.', 'success');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Verification token failed or expired.');
      showNotification(err.message || 'Reset failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <SectionHeader
        title="Choose New Password"
        subtitle="Verify your recovery token to update your login credentials securely."
        badge="Verify Recovery"
      />

      <GlassCard className="border border-white/5 p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/25 text-rose-500 text-sm rounded-xl font-medium" role="alert">
              {error}
            </div>
          )}

          {/* Token */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="token" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Recovery Token Code
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
                placeholder="Paste token or check URL link"
              />
            </div>
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="newPassword" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4.5 h-4.5" />
              </div>
              <input
                type="password"
                id="newPassword"
                required
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border border-white/10 dark:border-white/5 light:border-slate-350 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100"
                placeholder="Minimum 8 characters"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4.5 h-4.5" />
              </div>
              <input
                type="password"
                id="confirmPassword"
                required
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border border-white/10 dark:border-white/5 light:border-slate-350 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100"
                placeholder="Retype password"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full gap-2" disabled={isSubmitting}>
            <span>{isSubmitting ? 'Updating...' : 'Update Password'}</span>
          </Button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </GlassCard>
    </div>
  );
};
export default ResetPassword;
