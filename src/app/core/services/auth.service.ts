import { API_ENDPOINTS } from '../config/api.config';
import { LoginResponse, User } from '../models/auth.model';
import { http } from './http';

const tokenKey = 'cine_token';
const userKey = 'cine_user';

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>(`${API_ENDPOINTS.auth}/login`, { email, password });
  localStorage.setItem(tokenKey, data.token);
  localStorage.setItem(userKey, JSON.stringify(data.user));
  return data;
}

export function logout(): void {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
}

export function getToken(): string | null {
  return localStorage.getItem(tokenKey);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(userKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}
