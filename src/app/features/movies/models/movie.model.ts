export type CastDepartment = 'acting' | 'directing' | 'production';

export interface CastMember {
  id?: number;
  name: string;
  department: CastDepartment;
}

export interface MovieTranslationPayload {
  title: string;
  sinopsis: string;
  is_available: boolean;
}

export interface Movie {
  id: number;
  title: string;
  sinopsis: string;
  duration: number;
  release_year: number | null;
  image: string | null;
  trailer_url: string | null;
  rating: number | null;
  genre_ids: number[];
  cast: CastMember[];
  translation_en: MovieTranslationPayload | null;
}

export interface MoviePayload {
  title: string;
  sinopsis: string;
  duration: number;
  release_year: number | null;
  image: string;
  trailer_url: string | null;
  rating: number | null;
  genre_ids: number[];
  cast: CastMember[];
  translation_en: MovieTranslationPayload | null;
}

export interface Genre {
  id: number;
  name: string;
}

export interface TmdbSearchResult {
  id: number;
  title: string;
  year: string | null;
  image: string | null;
}

export interface TmdbMovieImport {
  duration: number | null;
  release_year: number | null;
  image: string | null;
  trailer_url: string | null;
  rating: number | null;
  genre_ids: number[];
  cast: CastMember[];
  es: {
    title: string;
    sinopsis: string;
  };
  en: {
    title: string;
    sinopsis: string;
    is_available: boolean;
  };
}

export interface HomeMovie {
  id: number;
  title: string;
  image: string;
  release_year: number | null;
  genres: string[];
  vote_average: number;
  overview: string;
  cast: string[];
}
