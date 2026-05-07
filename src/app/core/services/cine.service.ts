import { API_ENDPOINTS } from '../config/api.config';
import { CreateReservationPayload, HomeMovie, Movie, Reservation, Room, Seat, Session } from '../models/cine.model';
import { http } from './http';

export async function getMovies(): Promise<Movie[]> {
  const { data } = await http.get<Movie[]>(`${API_ENDPOINTS.cine}/peliculas`);
  return data;
}

export async function getRandomPopularMovies(limit = 3, language = 'es-ES'): Promise<HomeMovie[]> {
  const { data } = await http.get<HomeMovie[]>(
    `${API_ENDPOINTS.cine}/peliculas/popular/random?limit=${limit}&language=${encodeURIComponent(language)}`
  );
  return data;
}

export async function getMovieById(id: number): Promise<Movie> {
  const { data } = await http.get<Movie>(`${API_ENDPOINTS.cine}/peliculas/${id}`);
  return data;
}

export async function createMovie(payload: Partial<Movie>): Promise<Movie> {
  const { data } = await http.post<Movie>(`${API_ENDPOINTS.cine}/peliculas`, payload);
  return data;
}

export async function updateMovie(id: number, payload: Partial<Movie>): Promise<Movie> {
  const { data } = await http.put<Movie>(`${API_ENDPOINTS.cine}/peliculas/${id}`, payload);
  return data;
}

export async function deleteMovie(id: number): Promise<void> {
  await http.delete(`${API_ENDPOINTS.cine}/peliculas/${id}`);
}

export async function getSessions(peliculaId?: number): Promise<Session[]> {
  const query = peliculaId ? `?peliculaId=${peliculaId}` : '';
  const { data } = await http.get<Session[]>(`${API_ENDPOINTS.cine}/sesiones${query}`);
  return data;
}

export async function createSession(payload: Omit<Session, 'id'>): Promise<Session> {
  const { data } = await http.post<Session>(`${API_ENDPOINTS.cine}/sesiones`, payload);
  return data;
}

export async function getRooms(): Promise<Room[]> {
  const { data } = await http.get<Room[]>(`${API_ENDPOINTS.cine}/salas`);
  return data;
}

export async function getSeatsBySession(sessionId: number): Promise<Seat[]> {
  const { data } = await http.get<Seat[]>(`${API_ENDPOINTS.cine}/sesiones/${sessionId}/asientos`);
  return data;
}

export async function createReservation(payload: CreateReservationPayload): Promise<Reservation> {
  const { data } = await http.post<Reservation>(`${API_ENDPOINTS.cine}/reservas`, payload);
  return data;
}

export async function getReservationsByUser(usuarioId: number): Promise<Reservation[]> {
  const { data } = await http.get<Reservation[]>(`${API_ENDPOINTS.cine}/reservas/${usuarioId}`);
  return data;
}
