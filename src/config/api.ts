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

export interface RetryConfig {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
}

/**
 * Resilient fetch wrapper with exponential backoff for backend cold-starts & transient network errors.
 */
export const fetchWithRetry = async (
  input: RequestInfo | URL,
  init?: RequestInit,
  retryConfig?: RetryConfig
): Promise<Response> => {
  const maxRetries = retryConfig?.maxRetries ?? 6;
  const initialDelayMs = retryConfig?.initialDelayMs ?? 1000;
  const maxDelayMs = retryConfig?.maxDelayMs ?? 8000;
  const backoffFactor = retryConfig?.backoffFactor ?? 1.8;

  let delay = initialDelayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(input, init);

      // Statuses that indicate PaaS/Server cold-starts or gateway spinning up (502, 503, 504, 429)
      if ([502, 503, 504, 429].includes(response.status) && attempt < maxRetries) {
        console.warn(`[Backend Warmup Retry ${attempt + 1}/${maxRetries}] ${input} returned status ${response.status}. Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        delay = Math.min(delay * backoffFactor, maxDelayMs);
        continue;
      }

      return response;
    } catch (error: any) {
      // Network connection failure (e.g. Failed to fetch while server starts)
      if (attempt < maxRetries) {
        console.warn(`[Backend Warmup Retry ${attempt + 1}/${maxRetries}] Connection error to ${input}. Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        delay = Math.min(delay * backoffFactor, maxDelayMs);
        continue;
      }

      throw error;
    }
  }

  throw new Error(`Server connection failed after ${maxRetries} retry attempts.`);
};

export default getApiBaseUrl;
