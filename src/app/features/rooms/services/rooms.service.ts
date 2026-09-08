import { API_ENDPOINTS } from '../../../core/config/api.config';
import { http } from '../../../core/http/http';
import { Room, RoomLayout, RoomLayoutPayload } from '../models/room.model';

export async function getRooms(): Promise<Room[]> {
  const { data } = await http.get<Room[]>(`${API_ENDPOINTS.cine}/salas`);
  return data;
}

export async function getRoom(id: number): Promise<RoomLayout> {
  const { data } = await http.get<RoomLayout>(`${API_ENDPOINTS.cine}/salas/${id}`);
  return data;
}

export async function createRoom(payload: RoomLayoutPayload): Promise<RoomLayout> {
  const { data } = await http.post<RoomLayout>(`${API_ENDPOINTS.cine}/salas`, payload);
  return data;
}

export async function updateRoom(id: number, payload: RoomLayoutPayload): Promise<RoomLayout> {
  const { data } = await http.put<RoomLayout>(`${API_ENDPOINTS.cine}/salas/${id}`, payload);
  return data;
}

export async function deleteRoom(id: number): Promise<void> {
  await http.delete(`${API_ENDPOINTS.cine}/salas/${id}`);
}
