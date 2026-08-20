import { API_ENDPOINTS } from '../../../core/config/api.config';
import { http } from '../../../core/http/http';
import { AdminUser, CreateUserPayload, UpdateUserPayload } from '../models/user.model';

export async function getUsers(): Promise<AdminUser[]> {
  const { data } = await http.get<AdminUser[]>(`${API_ENDPOINTS.cine}/usuarios`);
  return data;
}

export async function createUser(payload: CreateUserPayload): Promise<AdminUser> {
  const { data } = await http.post<AdminUser>(`${API_ENDPOINTS.cine}/usuarios`, payload);
  return data;
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<AdminUser> {
  const { data } = await http.put<AdminUser>(`${API_ENDPOINTS.cine}/usuarios/${id}`, payload);
  return data;
}

export async function deleteUser(id: number): Promise<void> {
  await http.delete(`${API_ENDPOINTS.cine}/usuarios/${id}`);
}
