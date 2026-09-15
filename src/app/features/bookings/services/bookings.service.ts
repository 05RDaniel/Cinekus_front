import { API_ENDPOINTS } from '../../../core/config/api.config';
import { http } from '../../../core/http/http';
import { Booking } from '../models/booking.model';

export type AdminBookingsFilters = {
  userId?: number;
  sessionId?: number;
};

export type CreateBookingPayload = {
  user_id: number;
  session_id: number;
  seat_ids: number[];
  tickets: { ticket_type_id: number; quantity: number }[];
  status_id?: number;
  first_name: string;
  last_name: string;
  second_last_name?: string;
  email: string;
};

export async function getAllBookingsAdmin(filters?: AdminBookingsFilters): Promise<Booking[]> {
  const params = new URLSearchParams();
  if (filters?.userId) params.set('userId', String(filters.userId));
  if (filters?.sessionId) params.set('sessionId', String(filters.sessionId));
  const qs = params.toString();
  const { data } = await http.get<Booking[]>(`${API_ENDPOINTS.cine}/reservas${qs ? `?${qs}` : ''}`);
  return data;
}

export async function getBookingAdmin(id: number): Promise<Booking> {
  const { data } = await http.get<Booking>(`${API_ENDPOINTS.cine}/reservas/${id}/detalle`);
  return data;
}

export async function updateBookingStatus(
  id: number,
  status: 'confirmed' | 'cancelled'
): Promise<Booking> {
  const { data } = await http.put<Booking>(`${API_ENDPOINTS.cine}/reservas/${id}`, { status });
  return data;
}

export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  const { data } = await http.post<Booking>(`${API_ENDPOINTS.cine}/reservas`, payload);
  return data;
}

export async function getBookingsByUser(userId: number): Promise<Booking[]> {
  const { data } = await http.get<Booking[]>(`${API_ENDPOINTS.cine}/reservas/${userId}`);
  return data;
}

export async function cancelBooking(id: number): Promise<Booking> {
  const { data } = await http.post<Booking>(`${API_ENDPOINTS.cine}/reservas/${id}/cancel`);
  return data;
}

export async function deleteBooking(id: number): Promise<void> {
  await http.delete(`${API_ENDPOINTS.cine}/reservas/${id}`);
}
