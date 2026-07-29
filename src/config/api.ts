/**
 * CivicMind AI Enterprise API Configuration
 * Centralized API Base URL resolver and network helper.
 */

export const getApiBaseUrl = (): string => {
  // 1. Check environment variable from Vite build / runtime
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // 2. Check localStorage override safely
  try {
    const localUrl = localStorage.getItem('VITE_API_BASE_URL');
    if (localUrl && typeof localUrl === 'string' && localUrl.trim().length > 0) {
      const trimmed = localUrl.trim().replace(/\/+$/, '');
      const isWindowLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      // If window is in production but stored URL is localhost, clear stale override
      if (!isWindowLocalhost && (trimmed.includes('localhost') || trimmed.includes('127.0.0.1'))) {
        localStorage.removeItem('VITE_API_BASE_URL');
      } else {
        return trimmed;
      }
    }
  } catch (e) {
    console.warn('Could not read VITE_API_BASE_URL from localStorage', e);
  }

  // 3. Fallback for local development
  return 'http://localhost:8000/api/v1';
};

export const API_BASE = getApiBaseUrl();
export default getApiBaseUrl;
