import { API_ENDPOINTS } from '../../../core/config/api.config';
import { http } from '../../../core/http/http';
import { Room } from '../models/room.model';

export async function getRooms(): Promise<Room[]> {
  const { data } = await http.get<Room[]>(`${API_ENDPOINTS.cine}/salas`);
  return data;
}

export async function createRoom(payload: Pick<Room, 'name'>): Promise<Room> {
  const { data } = await http.post<Room>(`${API_ENDPOINTS.cine}/salas`, payload);
  return data;
}

export async function updateRoom(id: number, payload: Partial<Pick<Room, 'name'>>): Promise<Room> {
  const { data } = await http.put<Room>(`${API_ENDPOINTS.cine}/salas/${id}`, payload);
  return data;
}

export async function deleteRoom(id: number): Promise<void> {
  await http.delete(`${API_ENDPOINTS.cine}/salas/${id}`);
}
