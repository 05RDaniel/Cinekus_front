import { API_ENDPOINTS } from '../../../core/config/api.config';
import { http } from '../../../core/http/http';
import { SessionSeat, SessionSeatsMap } from '../models/seat.model';

export async function getSeatsBySession(sessionId: number): Promise<SessionSeatsMap> {
  const { data } = await http.get<SessionSeatsMap | SessionSeat[]>(
    `${API_ENDPOINTS.cine}/sesiones/${sessionId}/asientos`
  );

  if (Array.isArray(data)) {
    const rows = data.reduce((max, seat) => Math.max(max, Number(seat.seat_row) || 0), 0);
    const columns = data.reduce((max, seat) => Math.max(max, seat.number), 0);
    return { rows, columns, seats: data };
  }

  return data;
}
