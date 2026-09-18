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
import { CrudSelect } from '../../../../shared/components/crud/CrudSelect';

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
    duration: string;
    durationSuffix: string;
    room: string;
    totalSeats: string;
    language: string;
    sessionType: string;
    subtitles: string;
    subtitlesNone: string;
    subtitlesEs: string;
    subtitlesEn: string;
    startDate: string;
    startTime: string;
    endTime: string;
    emptyReadonly: string;
    type2d: string;
    type3d: string;
    type4d: string;
  };
};

function subtitleOptionLabel(
  option: SessionSubtitles,
  labels: Pick<AdminSessionFormProps['labels'], 'subtitlesNone' | 'subtitlesEs' | 'subtitlesEn'>
): string {
  if (option === 'none') return labels.subtitlesNone;
  if (option === 'es') return labels.subtitlesEs;
  return labels.subtitlesEn;
}

function isPrimaryLanguage(languages: CinemaLanguage[], languageId: string): boolean {
  const language = languages.find((item) => String(item.id) === languageId);
  return language?.code === PRIMARY_SESSION_LANGUAGE_CODE;
}

function endTimeFromStart(startTime: string, durationMinutes: number): string {
  if (!startTime || durationMinutes <= 0) return '';
  const [hours, minutes] = startTime.slice(0, 5).split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return '';
  const total = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(total / 60) % 24;
  const endMinutes = total % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
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

  const selectedRoom = useMemo(
    () => rooms.find((room) => String(room.id) === values.room_id),
    [rooms, values.room_id]
  );

  const movieDuration = selectedMovie?.duration && selectedMovie.duration > 0 ? selectedMovie.duration : null;
  const durationDisplay = movieDuration !== null ? `${movieDuration} ${labels.durationSuffix}` : labels.emptyReadonly;
  const seatCount = selectedRoom?.seat_count ?? null;
  const seatsDisplay = seatCount !== null ? String(seatCount) : labels.emptyReadonly;
  const endTimeDisplay =
    movieDuration !== null && values.start_time
      ? endTimeFromStart(values.start_time, movieDuration)
      : labels.emptyReadonly;

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
      <div className="crud-form__row">
        <div className="crud-field crud-field--wide">
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
        <div className="crud-field crud-field--compact">
          <span className="crud-field__label">{labels.duration}</span>
          <div className="crud-field__control crud-field__control--readonly">{durationDisplay}</div>
        </div>
      </div>

      <div className="crud-form__row">
        <div className="crud-field crud-field--wide">
          <label className="crud-field__label" htmlFor="session-room">
            {labels.room}
          </label>
          <CrudSelect
            id="session-room"
            value={values.room_id}
            placeholder={labels.room}
            options={rooms.map((room) => ({ value: String(room.id), label: room.name }))}
            onChange={(room_id) => onChange({ ...values, room_id })}
          />
        </div>
        <div className="crud-field crud-field--compact">
          <span className="crud-field__label">{labels.totalSeats}</span>
          <div className="crud-field__control crud-field__control--readonly">{seatsDisplay}</div>
        </div>
      </div>

      <div className="crud-form__row">
        <div className="crud-field">
          <label className="crud-field__label" htmlFor="session-language">
            {labels.language}
          </label>
          <CrudSelect
            id="session-language"
            value={values.language_id}
            placeholder={labels.language}
            options={languages.map((language) => ({
              value: String(language.id),
              label: language.name,
            }))}
            onChange={onLanguageChange}
          />
        </div>
        <div className="crud-field">
          <label className="crud-field__label" htmlFor="session-type">
            {labels.sessionType}
          </label>
          <CrudSelect
            id="session-type"
            value={values.session_type}
            options={SESSION_TYPES.map((type) => ({
              value: type,
              label: sessionTypeLabel(type, labels),
            }))}
            onChange={(session_type) =>
              onChange({ ...values, session_type: session_type as SessionType })
            }
          />
        </div>
        {showSubtitles && (
          <div className="crud-field">
            <label className="crud-field__label" htmlFor="session-subtitles">
              {labels.subtitles}
            </label>
            <CrudSelect
              id="session-subtitles"
              value={values.subtitles}
              options={SESSION_SUBTITLE_OPTIONS.map((option) => ({
                value: option,
                label: subtitleOptionLabel(option, labels),
              }))}
              onChange={(subtitles) =>
                onChange({ ...values, subtitles: subtitles as SessionSubtitles })
              }
            />
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
        <div className="crud-field crud-field--compact">
          <span className="crud-field__label">{labels.endTime}</span>
          <div className="crud-field__control crud-field__control--readonly">{endTimeDisplay}</div>
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
