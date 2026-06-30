const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const getApiBase = (subpath = ''): string => {
  const savedBase = localStorage.getItem('VITE_API_BASE_URL');
  const base = savedBase || DEFAULT_API_BASE;
  
  if (!subpath) return base;
  if (subpath === 'qa') {
    return `${base}/qa`;
  }
  if (subpath === 'system') {
    return `${base}/system`;
  }
  return `${base}/${subpath}`;
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
