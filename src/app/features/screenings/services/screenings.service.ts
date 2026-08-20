import { API_ENDPOINTS } from '../../../core/config/api.config';
import { http } from '../../../core/http/http';
import { CinemaLanguage, Session, SessionPayload } from '../models/screening.model';

export async function getLanguages(): Promise<CinemaLanguage[]> {
  const { data } = await http.get<CinemaLanguage[]>(`${API_ENDPOINTS.cine}/idiomas`);
  return data;
}

export async function getSessions(movieId?: number): Promise<Session[]> {
  const query = movieId ? `?movieId=${movieId}` : '';
  const { data } = await http.get<Session[]>(`${API_ENDPOINTS.cine}/sesiones${query}`);
  return data;
}

export async function getSessionById(id: number): Promise<Session | null> {
  const sessions = await getSessions();
  return sessions.find((session) => session.id === id) ?? null;
}

export async function createSession(payload: SessionPayload): Promise<Session> {
  const { data } = await http.post<Session>(`${API_ENDPOINTS.cine}/sesiones`, payload);
  return data;
}

export async function updateSession(id: number, payload: Partial<SessionPayload>): Promise<Session> {
  const { data } = await http.put<Session>(`${API_ENDPOINTS.cine}/sesiones/${id}`, payload);
  return data;
}

export async function deleteSession(id: number): Promise<void> {
  await http.delete(`${API_ENDPOINTS.cine}/sesiones/${id}`);
}
