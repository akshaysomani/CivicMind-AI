import React, { useState, useEffect, useCallback } from 'react';
import { getApiBaseUrl, fetchWithRetry } from '../config/api';
import { Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type BackendStatus = 'checking' | 'connecting' | 'ready' | 'error';

interface BackendStatusBannerProps {
  onStatusChange?: (status: BackendStatus) => void;
}

export const BackendStatusBanner: React.FC<BackendStatusBannerProps> = ({ onStatusChange }) => {
  const [status, setStatus] = useState<BackendStatus>('checking');
  const [visible, setVisible] = useState(false);

  const checkHealth = useCallback(async () => {
    setStatus('connecting');
    setVisible(true);
    if (onStatusChange) onStatusChange('connecting');

    const apiBase = getApiBaseUrl();
    const hostUrl = apiBase.replace(/\/api\/v1\/?$/, '');
    const healthEndpoint = `${hostUrl}/health`;

    try {
      const response = await fetchWithRetry(
        healthEndpoint,
        { method: 'GET' },
        {
          maxRetries: 7,
          initialDelayMs: 1000,
          maxDelayMs: 6000,
          backoffFactor: 1.5,
        }
      );

      if (response.ok) {
        setStatus('ready');
        if (onStatusChange) onStatusChange('ready');
        // Hide success banner automatically after 2.5 seconds
        setTimeout(() => {
          setVisible(false);
        }, 2500);
      } else {
        setStatus('error');
        if (onStatusChange) onStatusChange('error');
      }
    } catch (err) {
      console.warn('[Backend Status] Health check retries exhausted:', err);
      setStatus('error');
      if (onStatusChange) onStatusChange('error');
    }
  }, [onStatusChange]);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  if (!visible && status === 'ready') return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full relative z-50"
        >
          {status === 'connecting' && (
            <div className="bg-gradient-to-r from-amber-950/80 via-amber-900/70 to-amber-950/80 border-b border-amber-500/30 text-amber-200 px-4 py-2.5 flex items-center justify-between text-xs font-semibold shadow-md backdrop-blur-md">
              <div className="flex items-center gap-2.5 mx-auto sm:mx-0">
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                <span>Connecting to server... (Warming up backend cold-start)</span>
              </div>
              <span className="hidden sm:inline-block text-[10px] text-amber-400/80 uppercase font-bold tracking-wider">
                Automated Retry Active
              </span>
            </div>
          )}

          {status === 'ready' && (
            <div className="bg-gradient-to-r from-emerald-950/80 via-emerald-900/70 to-emerald-950/80 border-b border-emerald-500/30 text-emerald-200 px-4 py-2 flex items-center justify-between text-xs font-semibold shadow-md backdrop-blur-md">
              <div className="flex items-center gap-2.5 mx-auto sm:mx-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Backend server connected and operational.</span>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-gradient-to-r from-rose-950/80 via-rose-900/70 to-rose-950/80 border-b border-rose-500/30 text-rose-200 px-4 py-2.5 flex items-center justify-between text-xs font-semibold shadow-md backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Unable to connect to server after retry attempts. Please check server state.</span>
              </div>
              <button
                onClick={checkHealth}
                className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg border border-rose-500/30 transition-all text-2xs uppercase font-bold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry Connection</span>
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BackendStatusBanner;
