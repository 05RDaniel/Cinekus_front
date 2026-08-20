import { API_ENDPOINTS } from '../../../core/config/api.config';
import { http } from '../../../core/http/http';
import {
  Genre,
  HomeMovie,
  Movie,
  MoviePayload,
  TmdbMovieImport,
  TmdbSearchResult,
} from '../models/movie.model';

export async function getMovies(): Promise<Movie[]> {
  const { data } = await http.get<Movie[]>(`${API_ENDPOINTS.cine}/peliculas`);
  return data;
}

export async function getMovie(id: number): Promise<Movie> {
  const { data } = await http.get<Movie>(`${API_ENDPOINTS.cine}/peliculas/${id}`);
  return data;
}

export async function getGenres(lang = 'es'): Promise<Genre[]> {
  const { data } = await http.get<Genre[]>(`${API_ENDPOINTS.cine}/generos?lang=${encodeURIComponent(lang)}`);
  return data;
}

export async function searchTmdbMovies(query: string): Promise<TmdbSearchResult[]> {
  const { data } = await http.get<TmdbSearchResult[]>(
    `${API_ENDPOINTS.cine}/peliculas/tmdb/search?q=${encodeURIComponent(query)}`
  );
  return data;
}

export async function getTmdbMovieImport(tmdbId: number): Promise<TmdbMovieImport> {
  const { data } = await http.get<TmdbMovieImport>(`${API_ENDPOINTS.cine}/peliculas/tmdb/${tmdbId}`);
  return data;
}

export async function getHomePopularMovies(limit = 10, lang: 'es' | 'en' = 'es'): Promise<HomeMovie[]> {
  const { data } = await http.get<HomeMovie[]>(
    `${API_ENDPOINTS.cine}/peliculas/popular/home?limit=${limit}&lang=${encodeURIComponent(lang)}`
  );
  return data;
}

export async function createMovie(payload: MoviePayload): Promise<Movie> {
  const { data } = await http.post<Movie>(`${API_ENDPOINTS.cine}/peliculas`, payload);
  return data;
}

export async function updateMovie(id: number, payload: Partial<MoviePayload>): Promise<Movie> {
  const { data } = await http.put<Movie>(`${API_ENDPOINTS.cine}/peliculas/${id}`, payload);
  return data;
}

export async function deleteMovie(id: number): Promise<void> {
  await http.delete(`${API_ENDPOINTS.cine}/peliculas/${id}`);
}
