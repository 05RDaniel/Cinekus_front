export interface Movie {
  id: number;
  titulo: string;
  sinopsis: string;
  duracion: number;
  genero: string;
  imagen: string | null;
  fecha_estreno: string;
  trailer_url?: string | null;
}

export interface Session {
  id: number;
  pelicula_id: number;
  sala_id: number;
  fecha: string;
  hora: string;
  pelicula_titulo?: string | null;
  sala_nombre?: string | null;
}

export interface Room {
  id: number;
  nombre: string;
  filas: number;
  columnas: number;
}

export interface Seat {
  id: number;
  sala_id: number;
  fila: number;
  numero: number;
  ocupado: boolean;
}

export interface Reservation {
  id: number;
  usuario_id: number;
  sesion_id: number;
  fecha_reserva: string;
}

export interface CreateReservationPayload {
  usuario_id: number;
  sesion_id: number;
  asientos: number[];
}

export interface HomeMovie {
  id: number;
  title: string;
  image: string;
  genres: string[];
  vote_average: number;
  overview: string;
}
