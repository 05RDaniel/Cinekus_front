import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CastDepartment, Movie } from '../../../features/movies/models/movie.model';
import { getGenres, getMovie } from '../../../features/movies/services/movies.service';
import {
  getMovieDisplay,
  mapApiLanguage,
  toYoutubeEmbedUrl,
} from '../../../features/movies/utils/movieDisplay';
import { getSessions } from '../../../features/screenings/services/screenings.service';
import {
  formatSessionSchedule,
  formatSessionTime,
  Session,
  sessionTypeLabel,
} from '../../../features/screenings/models/screening.model';
import { useLanguage } from '../../../core/context/LanguageContext';
import type { Lang } from '../../../core/context/LanguageContext';
import { BackButton } from '../../../shared/components/layout/BackButton';
import { CrudModal } from '../../../shared/components/crud/CrudModal';
import { usePageTexts } from '../../../../lang';

function namesByDepartment(cast: Movie['cast'], department: CastDepartment): string {
  const names = cast.filter((person) => person.department === department).map((person) => person.name);
  return names.length > 0 ? names.join(', ') : '—';
}

function localeFromLang(language: Lang): string {
  return language === 'en-US' ? 'en-US' : 'es-ES';
}

function formatSessionDateLabel(date: string, language: Lang): string {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString(localeFromLang(language), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function groupSessionsByDate(sessions: Session[]): { date: string; sessions: Session[] }[] {
  const map = new Map<string, Session[]>();

  for (const session of sessions) {
    const list = map.get(session.start_date) ?? [];
    list.push(session);
    map.set(session.start_date, list);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, items]) => ({
      date,
      sessions: [...items].sort((a, b) => a.start_time.localeCompare(b.start_time)),
    }));
}

export function MovieDetailPage() {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const texts = usePageTexts('movie-detail');
  const [movie, setMovie] = useState<Movie | null>(null);
  const [genreNames, setGenreNames] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  const parsedId = Number(movieId);

  useEffect(() => {
    if (!Number.isFinite(parsedId)) {
      setMovie(null);
      setIsLoading(false);
      setHasLoadError(true);
      return;
    }

    let mounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setHasLoadError(false);
        const data = await getMovie(parsedId);
        if (!mounted) return;
        setMovie(data);
      } catch {
        if (!mounted) return;
        setMovie(null);
        setHasLoadError(true);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [parsedId]);

  useEffect(() => {
    void getGenres(mapApiLanguage(language))
      .then((genres) => {
        setGenreNames(Object.fromEntries(genres.map((genre) => [genre.id, genre.name])));
      })
      .catch(() => setGenreNames({}));
  }, [language]);

  useEffect(() => {
    setShowSessions(false);
    setSessions([]);
    setSelectedDate(null);
    setSelectedSessionId(null);
    setSessionsError(false);
  }, [parsedId]);

  useEffect(() => {
    if (!showSessions || !Number.isFinite(parsedId)) return;

    let mounted = true;
    setSessionsLoading(true);
    setSessionsError(false);

    void getSessions(parsedId)
      .then((data) => {
        if (!mounted) return;
        setSessions(data);
        const firstDate = data[0]?.start_date ?? null;
        setSelectedDate(firstDate);
        setSelectedSessionId(null);
      })
      .catch(() => {
        if (!mounted) return;
        setSessions([]);
        setSelectedDate(null);
        setSelectedSessionId(null);
        setSessionsError(true);
      })
      .finally(() => {
        if (mounted) setSessionsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [showSessions, parsedId]);

  const display = movie ? getMovieDisplay(movie, language) : null;
  const genres = useMemo(() => {
    if (!movie) return '—';
    const names = movie.genre_ids.map((id) => genreNames[id]).filter(Boolean);
    return names.length > 0 ? names.join(', ') : '—';
  }, [movie, genreNames]);

  const trailerEmbedUrl = movie ? toYoutubeEmbedUrl(movie.trailer_url) : null;

  const sessionsByDate = useMemo(() => groupSessionsByDate(sessions), [sessions]);
  const activeDate = selectedDate ?? sessionsByDate[0]?.date ?? null;
  const sessionsForDate = useMemo(
    () => sessionsByDate.find((group) => group.date === activeDate)?.sessions ?? [],
    [sessionsByDate, activeDate]
  );
  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId) ?? null,
    [sessions, selectedSessionId]
  );

  const subtitleLabel = (session: Session) => {
    if (!session.subtitles || session.subtitles === 'none') return texts.subtitleLabels.none;
    if (session.subtitles === 'es') return texts.subtitleLabels.es;
    return texts.subtitleLabels.en;
  };

  if (isLoading) {
    return (
      <section className="movie-detail-page">
        <div className="movie-detail-page__inner">
          <p className="movie-detail-page__status" role="status">
            {texts.loading}
          </p>
        </div>
      </section>
    );
  }

  if (hasLoadError || !movie || !display) {
    return (
      <section className="movie-detail-page">
        <div className="movie-detail-page__inner">
          <div className="movie-detail-page__toolbar">
            <BackButton to="/cartelera" />
          </div>
          <p className="movie-detail-page__status movie-detail-page__status--error" role="alert">
            {hasLoadError ? texts.error : texts.notFound}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="movie-detail-page" aria-labelledby="movie-detail-title">
      <div className="movie-detail-page__inner">
        <div className="movie-detail-page__toolbar">
          <BackButton to="/cartelera" />
        </div>

        <h1 id="movie-detail-title" className="movie-detail-page__title">
          {display.title}
        </h1>

        <div className="movie-detail-page__layout">
          <aside className="movie-detail-page__aside">
            <figure className="movie-detail-page__poster">
              {movie.image ? (
                <img
                  src={movie.image}
                  alt={`${texts.posterAlt} ${display.title}`}
                  className="movie-detail-page__poster-image"
                  onError={(event) => {
                    event.currentTarget.src = 'https://via.placeholder.com/400x600?text=No+Image';
                  }}
                />
              ) : (
                <div className="movie-detail-page__poster-placeholder" aria-hidden="true" />
              )}
            </figure>
          </aside>

          <div className="movie-detail-page__main">
            <section className="movie-detail-page__panel" aria-labelledby="movie-synopsis-title">
              <h2 id="movie-synopsis-title" className="movie-detail-page__panel-title">
                {texts.synopsis}
              </h2>
              <p className="movie-detail-page__synopsis-text">{display.sinopsis || '—'}</p>
            </section>

            <div className="movie-detail-page__meta">
              <dl className="movie-detail-page__meta-group">
                <div className="movie-detail-page__meta-item">
                  <dt className="text-meta">{texts.meta.casting}</dt>
                  <dd>{namesByDepartment(movie.cast, 'acting')}</dd>
                </div>
                <div className="movie-detail-page__meta-item">
                  <dt className="text-meta">{texts.meta.direction}</dt>
                  <dd>{namesByDepartment(movie.cast, 'directing')}</dd>
                </div>
                <div className="movie-detail-page__meta-item">
                  <dt className="text-meta">{texts.meta.production}</dt>
                  <dd>{namesByDepartment(movie.cast, 'production')}</dd>
                </div>
              </dl>

              <dl className="movie-detail-page__meta-group">
                <div className="movie-detail-page__meta-item">
                  <dt className="text-meta">{texts.meta.rating}</dt>
                  <dd>{movie.rating != null ? `${movie.rating.toFixed(1)}/10` : '—'}</dd>
                </div>
                <div className="movie-detail-page__meta-item">
                  <dt className="text-meta">{texts.meta.genres}</dt>
                  <dd>{genres}</dd>
                </div>
                <div className="movie-detail-page__meta-item">
                  <dt className="text-meta">{texts.meta.releaseDate}</dt>
                  <dd>{movie.release_year ?? '—'}</dd>
                </div>
              </dl>
            </div>

            <div className="movie-detail-page__trailer-row">
              <section className="movie-detail-page__trailer" aria-label={texts.trailer}>
                {trailerEmbedUrl ? (
                  <iframe
                    src={trailerEmbedUrl}
                    title={`${texts.trailer}: ${display.title}`}
                    className="movie-detail-page__trailer-embed"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <p className="movie-detail-page__trailer-placeholder">{texts.trailerUnavailable}</p>
                )}
              </section>

              <div className="movie-detail-page__actions">
                <button
                  type="button"
                  className="movie-detail-page__sessions-btn"
                  onClick={() => setShowSessions(true)}
                >
                  {texts.sessions}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CrudModal
        isOpen={showSessions}
        title={texts.sessionsTitle}
        onClose={() => setShowSessions(false)}
        closeAriaLabel={texts.sessionsCloseAriaLabel}
        size="lg"
        scrollable
        footer={
          <>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setShowSessions(false)}>
              {texts.sessionsCancel}
            </button>
            <button
              type="button"
              className="admin-btn"
              disabled={!selectedSession}
              onClick={() => {
                if (!selectedSession) return;
                setShowSessions(false);
                navigate(`/reservar/${selectedSession.id}`);
              }}
            >
              {texts.sessionsContinue}
            </button>
          </>
        }
      >
        <div className="movie-detail-page__sessions" aria-live="polite">
          {sessionsLoading && <p className="movie-detail-page__status">{texts.sessionsLoading}</p>}
          {!sessionsLoading && sessionsError && (
            <p className="movie-detail-page__status movie-detail-page__status--error">{texts.sessionsError}</p>
          )}
          {!sessionsLoading && !sessionsError && sessions.length === 0 && (
            <p className="movie-detail-page__status">{texts.sessionsEmpty}</p>
          )}

          {!sessionsLoading && !sessionsError && sessions.length > 0 && (
            <>
              <div className="movie-detail-page__date-picker">
                <p className="movie-detail-page__picker-label">{texts.sessionsPickDate}</p>
                <div className="movie-detail-page__date-list" role="tablist" aria-label={texts.sessionsPickDate}>
                  {sessionsByDate.map((group) => (
                    <button
                      key={group.date}
                      type="button"
                      role="tab"
                      aria-selected={group.date === activeDate}
                      className={`movie-detail-page__date-chip${
                        group.date === activeDate ? ' movie-detail-page__date-chip--active' : ''
                      }`}
                      onClick={() => {
                        setSelectedDate(group.date);
                        setSelectedSessionId(null);
                      }}
                    >
                      <span className="movie-detail-page__date-chip-label">
                        {formatSessionDateLabel(group.date, language)}
                      </span>
                      <span className="movie-detail-page__date-chip-count">{group.sessions.length}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="movie-detail-page__time-picker">
                <p className="movie-detail-page__picker-label">{texts.sessionsPickTime}</p>
                <ul className="movie-detail-page__sessions-list">
                  {sessionsForDate.map((session) => {
                    const isSelected = session.id === selectedSessionId;
                    return (
                      <li key={session.id}>
                        <button
                          type="button"
                          className={`movie-detail-page__session-card${
                            isSelected ? ' movie-detail-page__session-card--selected' : ''
                          }`}
                          aria-pressed={isSelected}
                          onClick={() => setSelectedSessionId(session.id)}
                        >
                          <span className="movie-detail-page__session-time">
                            {formatSessionTime(session.start_time) || '—'}
                          </span>
                          <span className="movie-detail-page__session-badges">
                            <span className="movie-detail-page__badge movie-detail-page__badge--primary">
                              {sessionTypeLabel(session.session_type, texts.types)}
                            </span>
                            {session.room_name ? (
                              <span className="movie-detail-page__badge">
                                {texts.room}: {session.room_name}
                              </span>
                            ) : null}
                            {session.language_name ? (
                              <span className="movie-detail-page__badge">
                                {texts.language}: {session.language_name}
                              </span>
                            ) : null}
                            {session.subtitles && session.subtitles !== 'none' ? (
                              <span className="movie-detail-page__badge">{subtitleLabel(session)}</span>
                            ) : null}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {selectedSession && (
                <div className="movie-detail-page__selection">
                  <div className="movie-detail-page__selection-info">
                    <p className="movie-detail-page__selection-label">{texts.sessionsSelected}</p>
                    <p className="movie-detail-page__selection-value">
                      {formatSessionSchedule(selectedSession.start_date, selectedSession.start_time)}
                      {' · '}
                      {sessionTypeLabel(selectedSession.session_type, texts.types)}
                      {selectedSession.room_name ? ` · ${selectedSession.room_name}` : ''}
                      {selectedSession.language_name ? ` · ${selectedSession.language_name}` : ''}
                    </p>
                    <p className="movie-detail-page__selection-hint">{texts.sessionsContinueHint}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CrudModal>
    </section>
  );
}
