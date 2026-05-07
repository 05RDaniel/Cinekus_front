const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL = rawApiBaseUrl && rawApiBaseUrl.trim().length > 0 ? rawApiBaseUrl : 'http://127.0.0.1:3001/api';

export const API_ENDPOINTS = {
  auth: `${API_BASE_URL}/auth`,
  cine: `${API_BASE_URL}/cine`,
} as const;
