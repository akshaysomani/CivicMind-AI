import { getApiBaseUrl } from './config/api';

export const getApiBase = (subpath = ''): string => {
  const base = getApiBaseUrl();
  
  if (!subpath) return base;
  if (subpath === 'qa') {
    return `${base}/qa`;
  }
  if (subpath === 'system') {
    return `${base}/system`;
  }
  return `${base}/${subpath.replace(/^\/+/, '')}`;
};

export const getBackendHost = (): string => {
  const base = getApiBase();
  try {
    const url = new URL(base);
    return `${url.protocol}//${url.host}`;
  } catch (e) {
    return 'http://localhost:8000';
  }
};

export const setApiBase = (url: string) => {
  if (!url) {
    localStorage.removeItem('VITE_API_BASE_URL');
  } else {
    localStorage.setItem('VITE_API_BASE_URL', url);
  }
};
