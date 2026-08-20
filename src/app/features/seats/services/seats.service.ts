import { API_ENDPOINTS } from '../../../core/config/api.config';
import { http } from '../../../core/http/http';
import { SessionSeat } from '../models/seat.model';

export async function getSeatsBySession(sessionId: number): Promise<SessionSeat[]> {
  const { data } = await http.get<SessionSeat[]>(`${API_ENDPOINTS.cine}/sesiones/${sessionId}/asientos`);
  return data;
}
