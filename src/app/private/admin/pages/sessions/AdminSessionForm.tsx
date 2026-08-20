import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CinemaLanguage,
  PRIMARY_SESSION_LANGUAGE_CODE,
  SESSION_SUBTITLE_OPTIONS,
  SESSION_TYPES,
  SessionSubtitles,
  SessionType,
  sessionTypeLabel,
} from '../../../../features/screenings/models/screening.model';
import { Movie } from '../../../../features/movies/models/movie.model';
import { Room } from '../../../../features/rooms/models/room.model';

export type SessionFormValues = {
  movie_id: string;
  room_id: string;
  language_id: string;
  session_type: SessionType;
  subtitles: SessionSubtitles | '';
  start_date: string;
  start_time: string;
};

type AdminSessionFormProps = {
  values: SessionFormValues;
  onChange: (values: SessionFormValues) => void;
  movies: Movie[];
  rooms: Room[];
  languages: CinemaLanguage[];
  labels: {
    movie: string;
    movieSearchHelp: string;
    movieNoResults: string;
    room: string;
    language: string;
    sessionType: string;
    subtitles: string;
    subtitlesNone: string;
    subtitlesEs: string;
    subtitlesEn: string;
    startDate: string;
    startTime: string;
    type2d: string;
    type3d: string;
    type4d: string;
  };
};

function isPrimaryLanguage(languages: CinemaLanguage[], languageId: string): boolean {
  const language = languages.find((item) => String(item.id) === languageId);
  return language?.code === PRIMARY_SESSION_LANGUAGE_CODE;
}

export function AdminSessionForm({
  values,
  onChange,
  movies,
  rooms,
  languages,
  labels,
}: AdminSessionFormProps) {
  const [movieQuery, setMovieQuery] = useState('');
  const [showMovieSuggestions, setShowMovieSuggestions] = useState(false);
  const movieContainerRef = useRef<HTMLDivElement>(null);
  const showSubtitles = values.language_id !== '' && !isPrimaryLanguage(languages, values.language_id);

  const selectedMovie = useMemo(
    () => movies.find((movie) => String(movie.id) === values.movie_id),
    [movies, values.movie_id]
  );

  const movieSuggestions = useMemo(() => {
    const query = movieQuery.trim().toLowerCase();
    const filtered = query
      ? movies.filter((movie) => movie.title.toLowerCase().includes(query))
      : movies;
    return filtered.slice(0, 8);
  }, [movieQuery, movies]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!movieContainerRef.current?.contains(event.target as Node)) {
        setShowMovieSuggestions(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  useEffect(() => {
    if (selectedMovie) {
      setMovieQuery(selectedMovie.title);
    }
  }, [selectedMovie?.id, selectedMovie?.title]);

  const onMovieQueryChange = (query: string) => {
    setMovieQuery(query);
    setShowMovieSuggestions(true);
    if (selectedMovie && query.trim() !== selectedMovie.title) {
      onChange({ ...values, movie_id: '' });
    }
  };

  const onSelectMovie = (movie: Movie) => {
    onChange({ ...values, movie_id: String(movie.id) });
    setMovieQuery(movie.title);
    setShowMovieSuggestions(false);
  };

  const onLanguageChange = (languageId: string) => {
    const next: SessionFormValues = { ...values, language_id: languageId };
    if (isPrimaryLanguage(languages, languageId)) {
      next.subtitles = '';
    } else if (!values.subtitles) {
      next.subtitles = 'none';
    }
    onChange(next);
  };

  return (
    <div className="crud-form">
      <div className="crud-field">
        <label className="crud-field__label" htmlFor="session-movie">
          {labels.movie}
        </label>
        <div className="crud-suggest" ref={movieContainerRef}>
          <input
            id="session-movie"
            value={movieQuery}
            onChange={(event) => onMovieQueryChange(event.target.value)}
            onFocus={() => setShowMovieSuggestions(true)}
            autoComplete="off"
            placeholder={labels.movieSearchHelp}
          />
          {showMovieSuggestions && (
            <div className="crud-suggest__list" role="listbox">
              {movieSuggestions.length === 0 ? (
                <div className="crud-suggest__empty">{labels.movieNoResults}</div>
              ) : (
                movieSuggestions.map((movie) => (
                  <button
                    key={movie.id}
                    type="button"
                    className="crud-suggest__option"
                    onClick={() => onSelectMovie(movie)}
                  >
                    {movie.image ? (
                      <img src={movie.image} alt="" className="crud-suggest__thumb" width={36} height={54} />
                    ) : (
                      <div className="crud-suggest__thumb crud-suggest__thumb--empty" aria-hidden="true" />
                    )}
                    <span className="crud-suggest__title">{movie.title}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="crud-form__row">
        <div className="crud-field">
          <label className="crud-field__label" htmlFor="session-room">
            {labels.room}
          </label>
          <select
            id="session-room"
            value={values.room_id}
            onChange={(event) => onChange({ ...values, room_id: event.target.value })}
            required
          >
            <option value="">{labels.room}</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="crud-field">
          <label className="crud-field__label" htmlFor="session-language">
            {labels.language}
          </label>
          <select
            id="session-language"
            value={values.language_id}
            onChange={(event) => onLanguageChange(event.target.value)}
            required
          >
            <option value="">{labels.language}</option>
            {languages.map((language) => (
              <option key={language.id} value={language.id}>
                {language.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="crud-form__row">
        <div className="crud-field">
          <label className="crud-field__label" htmlFor="session-type">
            {labels.sessionType}
          </label>
          <select
            id="session-type"
            value={values.session_type}
            onChange={(event) => onChange({ ...values, session_type: event.target.value as SessionType })}
            required
          >
            {SESSION_TYPES.map((type) => (
              <option key={type} value={type}>
                {sessionTypeLabel(type, labels)}
              </option>
            ))}
          </select>
        </div>
        {showSubtitles && (
          <div className="crud-field">
            <label className="crud-field__label" htmlFor="session-subtitles">
              {labels.subtitles}
            </label>
            <select
              id="session-subtitles"
              value={values.subtitles}
              onChange={(event) =>
                onChange({ ...values, subtitles: event.target.value as SessionSubtitles })
              }
              required
            >
              {SESSION_SUBTITLE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === 'none'
                    ? labels.subtitlesNone
                    : option === 'es'
                      ? labels.subtitlesEs
                      : labels.subtitlesEn}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="crud-form__row">
        <div className="crud-field">
          <label className="crud-field__label" htmlFor="session-date">
            {labels.startDate}
          </label>
          <input
            id="session-date"
            type="date"
            value={values.start_date}
            onChange={(event) => onChange({ ...values, start_date: event.target.value })}
            required
          />
        </div>
        <div className="crud-field">
          <label className="crud-field__label" htmlFor="session-time">
            {labels.startTime}
          </label>
          <input
            id="session-time"
            type="time"
            value={values.start_time}
            onChange={(event) => onChange({ ...values, start_time: event.target.value })}
            required
          />
        </div>
      </div>
    </div>
  );
}

export function createEmptySessionForm(languages: CinemaLanguage[]): SessionFormValues {
  const spanish = languages.find((language) => language.code === PRIMARY_SESSION_LANGUAGE_CODE);

  return {
    movie_id: '',
    room_id: '',
    language_id: spanish ? String(spanish.id) : '',
    session_type: '2d',
    subtitles: '',
    start_date: '',
    start_time: '',
  };
}
