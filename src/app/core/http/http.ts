import axios from 'axios';
import { API_BASE_URL } from '../config/api.config';

export const http = axios.create({
  baseURL: API_BASE_URL,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('cine_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // Some deployments can strip Authorization headers at proxy level.
    // Sending token as query param keeps jwt-auth compatible in those environments.
    if (typeof config.url === 'string' && config.url.includes('/cine/')) {
      config.params = {
        ...(config.params ?? {}),
        token: (config.params as Record<string, unknown> | undefined)?.token ?? token,
      };
    }
  }
  return config;
});
