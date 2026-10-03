export const BACKEND_URL = (import.meta as any).env?.VITE_API_BASE || '';
export const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

/**
 * Robust fetch helper for ThermalGuard APIs.
 * Supports relative endpoints ('/status', 'status', '/api/status') and full URLs.
 * Binds directly to the local Vite proxy or custom backend target.
 */
export const apiFetch = async (endpointOrUrl: string, init?: RequestInit): Promise<Response> => {
  let url: string;
  
  if (endpointOrUrl.startsWith('http://') || endpointOrUrl.startsWith('https://')) {
    url = endpointOrUrl;
  } else if (endpointOrUrl.startsWith('/api')) {
    url = BACKEND_URL ? `${BACKEND_URL}${endpointOrUrl}` : endpointOrUrl;
  } else {
    const clean = endpointOrUrl.startsWith('/') ? endpointOrUrl : `/${endpointOrUrl}`;
    url = `${API_BASE}${clean}`;
  }

  try {
    const response = await fetch(url, init);
    return response;
  } catch (err) {
    console.warn(`[ThermalGuard API] Fetch failed for ${url}:`, err);
    throw err;
  }
};
