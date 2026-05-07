import axios from 'axios';
import { API_BASE_URL } from '../config/api.config';

export const http = axios.create({
  baseURL: API_BASE_URL,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('cine_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
