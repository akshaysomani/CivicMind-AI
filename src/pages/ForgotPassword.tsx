import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { SectionHeader } from '../components/SectionHeader';
import { Mail, ArrowLeft } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const API_BASE = localStorage.getItem('VITE_API_BASE_URL') || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const ForgotPassword: React.FC = () => {
  const notify = useNotifications();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToken, setSuccessToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setSuccessToken(null);

    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.detail || 'Could not request reset link.');
      }

      notify.showNotification(resData.message, 'success');
      
      // Parse token from mock response for development convenience
      if (resData.message.includes('Token for testing:')) {
        const token = resData.message.split('Token for testing:')[1].trim();
        setSuccessToken(token);
      }
    } catch (err: any) {
      notify.showNotification(err.message || 'Request failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <SectionHeader
        title="Reset Password"
        subtitle="Provide your email address to request a secure password recovery token."
        badge="Account Recovery"
      />

      <GlassCard className="border border-white/5 p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
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
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border border-white/10 dark:border-white/5 light:border-slate-350 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full gap-2" disabled={isSubmitting}>
            <span>{isSubmitting ? 'Sending Request...' : 'Send Recovery Code'}</span>
          </Button>
        </form>

        {successToken && (
          <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-slate-800 dark:text-slate-200 text-xs text-left">
            <span className="font-bold text-emerald-500 block mb-1">🔧 Local Dev Token Created:</span>
            <code className="bg-slate-900/80 p-1.5 rounded block select-all font-mono break-all text-emerald-400">
              {successToken}
            </code>
            <div className="mt-2 text-slate-500">
              Copy this token and use it on the{' '}
              <Link to="/reset-password" className="text-primary hover:underline font-semibold">
                Reset Password page
              </Link>
              .
            </div>
          </div>
        )}

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
export default ForgotPassword;
