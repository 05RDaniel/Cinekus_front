import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Genre, Movie } from '../../../features/movies/models/movie.model';
import { getGenres, getMovies } from '../../../features/movies/services/movies.service';
import { getMovieDisplay, mapApiLanguage } from '../../../features/movies/utils/movieDisplay';
import { useLanguage } from '../../../core/context/LanguageContext';
import { useInitialLoad } from '../../../shared/hooks/useInitialLoad';
import { usePageTexts } from '../../../../lang';

type RangeBounds = { min: number; max: number };

function numericBounds(values: number[], fallback: RangeBounds): RangeBounds {
  if (values.length === 0) return fallback;
  return { min: Math.min(...values), max: Math.max(...values) };
}

function matchesRange(
  value: number | null | undefined,
  from: number,
  to: number,
  full: RangeBounds
): boolean {
  const low = Math.min(from, to);
  const high = Math.max(from, to);
  const isDefault = low <= full.min && high >= full.max;
  if (value == null || Number.isNaN(value)) return isDefault;
  return value >= low && value <= high;
}

export function CarteleraPage() {
  const { language } = useLanguage();
  const texts = usePageTexts('cartelera');
  const loadMovies = useCallback(() => getMovies({ upcoming: true }), []);
  const { rows: movies, isLoading, hasLoadError } = useInitialLoad<Movie[]>(loadMovies, []);
  const [genres, setGenres] = useState<Genre[]>([]);

  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
  const [genreMenuOpen, setGenreMenuOpen] = useState(false);
  const genreMenuRef = useRef<HTMLDivElement>(null);
  const [yearFrom, setYearFrom] = useState(1900);
  const [yearTo, setYearTo] = useState(new Date().getFullYear());
  const [durationFrom, setDurationFrom] = useState(0);
  const [durationTo, setDurationTo] = useState(300);
  const [ratingFrom, setRatingFrom] = useState(0);
  const [ratingTo, setRatingTo] = useState(10);
  const [draftGenreIds, setDraftGenreIds] = useState<number[]>([]);
  const [draftYearFrom, setDraftYearFrom] = useState(1900);
  const [draftYearTo, setDraftYearTo] = useState(new Date().getFullYear());
  const [draftDurationFrom, setDraftDurationFrom] = useState(0);
  const [draftDurationTo, setDraftDurationTo] = useState(300);
  const [draftRatingFrom, setDraftRatingFrom] = useState(0);
  const [draftRatingTo, setDraftRatingTo] = useState(10);

  useEffect(() => {
    void getGenres(mapApiLanguage(language))
      .then((list) => setGenres(list))
      .catch(() => setGenres([]));
  }, [language]);

  const bounds = useMemo(() => {
    const years = movies.map((movie) => movie.release_year).filter((year): year is number => year != null);
    const durations = movies.map((movie) => movie.duration).filter((duration) => duration > 0);
    return {
      year: numericBounds(years, { min: 1900, max: new Date().getFullYear() }),
      duration: numericBounds(durations, { min: 0, max: 300 }),
      rating: { min: 0, max: 10 },
    };
  }, [movies]);

  const syncDraftFromApplied = useCallback(() => {
    setDraftGenreIds(selectedGenreIds);
    setDraftYearFrom(yearFrom);
    setDraftYearTo(yearTo);
    setDraftDurationFrom(durationFrom);
    setDraftDurationTo(durationTo);
    setDraftRatingFrom(ratingFrom);
    setDraftRatingTo(ratingTo);
  }, [
    selectedGenreIds,
    yearFrom,
    yearTo,
    durationFrom,
    durationTo,
    ratingFrom,
    ratingTo,
  ]);

  useEffect(() => {
    setYearFrom(bounds.year.min);
    setYearTo(bounds.year.max);
    setDurationFrom(bounds.duration.min);
    setDurationTo(bounds.duration.max);
    setRatingFrom(bounds.rating.min);
    setRatingTo(bounds.rating.max);
    setDraftGenreIds([]);
    setDraftYearFrom(bounds.year.min);
    setDraftYearTo(bounds.year.max);
    setDraftDurationFrom(bounds.duration.min);
    setDraftDurationTo(bounds.duration.max);
    setDraftRatingFrom(bounds.rating.min);
    setDraftRatingTo(bounds.rating.max);
  }, [bounds]);

  const genreNames = useMemo(
    () => Object.fromEntries(genres.map((genre) => [genre.id, genre.name])),
    [genres]
  );

  const draftGenres = useMemo(
    () => draftGenreIds.map((id) => genres.find((genre) => genre.id === id)).filter((genre): genre is Genre => Boolean(genre)),
    [draftGenreIds, genres]
  );

  const closeFilters = useCallback(() => {
    setFiltersOpen(false);
    setGenreMenuOpen(false);
  }, []);

  const openFilters = () => {
    syncDraftFromApplied();
    setGenreMenuOpen(false);
    setFiltersOpen(true);
  };

  useEffect(() => {
    if (!filtersOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!filtersRef.current?.contains(event.target as Node)) {
        closeFilters();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeFilters();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [filtersOpen, closeFilters]);

  useEffect(() => {
    if (!genreMenuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!genreMenuRef.current?.contains(event.target as Node)) {
        setGenreMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [genreMenuOpen]);

  const hasExtraFilters =
    selectedGenreIds.length > 0 ||
    yearFrom !== bounds.year.min ||
    yearTo !== bounds.year.max ||
    durationFrom !== bounds.duration.min ||
    durationTo !== bounds.duration.max ||
    ratingFrom !== bounds.rating.min ||
    ratingTo !== bounds.rating.max;

  const hasDraftFilters =
    draftGenreIds.length > 0 ||
    draftYearFrom !== bounds.year.min ||
    draftYearTo !== bounds.year.max ||
    draftDurationFrom !== bounds.duration.min ||
    draftDurationTo !== bounds.duration.max ||
    draftRatingFrom !== bounds.rating.min ||
    draftRatingTo !== bounds.rating.max;

  const matchesMovie = useCallback(
    (
      movie: Movie,
      genreIds: number[],
      years: RangeBounds,
      durations: RangeBounds,
      ratings: RangeBounds
    ) => {
      const { title, sinopsis } = getMovieDisplay(movie, language);
      const needle = query.trim().toLowerCase();
      if (needle) {
        const haystack = [title, sinopsis, movie.title].join(' ').toLowerCase();
        if (!haystack.includes(needle)) return false;
      }

      if (genreIds.length > 0 && !genreIds.some((id) => movie.genre_ids.includes(id))) {
        return false;
      }

      if (!matchesRange(movie.release_year, years.min, years.max, bounds.year)) return false;
      if (!matchesRange(movie.duration || null, durations.min, durations.max, bounds.duration)) return false;
      if (!matchesRange(movie.rating, ratings.min, ratings.max, bounds.rating)) return false;
      return true;
    },
    [bounds, language, query]
  );

  const filteredMovies = useMemo(() => {
    return [...movies]
      .filter((movie) =>
        matchesMovie(
          movie,
          selectedGenreIds,
          { min: yearFrom, max: yearTo },
          { min: durationFrom, max: durationTo },
          { min: ratingFrom, max: ratingTo }
        )
      )
      .sort((a, b) => {
        const titleA = getMovieDisplay(a, language).title;
        const titleB = getMovieDisplay(b, language).title;
        return titleA.localeCompare(titleB, undefined, { sensitivity: 'base' });
      });
  }, [
    movies,
    language,
    matchesMovie,
    selectedGenreIds,
    yearFrom,
    yearTo,
    durationFrom,
    durationTo,
    ratingFrom,
    ratingTo,
  ]);

  const previewCount = useMemo(() => {
    return movies.filter((movie) =>
      matchesMovie(
        movie,
        draftGenreIds,
        { min: draftYearFrom, max: draftYearTo },
        { min: draftDurationFrom, max: draftDurationTo },
        { min: draftRatingFrom, max: draftRatingTo }
      )
    ).length;
  }, [
    movies,
    matchesMovie,
    draftGenreIds,
    draftYearFrom,
    draftYearTo,
    draftDurationFrom,
    draftDurationTo,
    draftRatingFrom,
    draftRatingTo,
  ]);

  const addGenre = (id: number) => {
    setDraftGenreIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const removeGenre = (id: number) => {
    setDraftGenreIds((prev) => prev.filter((genreId) => genreId !== id));
  };

  const applyFilters = () => {
    setSelectedGenreIds(draftGenreIds);
    setYearFrom(draftYearFrom);
    setYearTo(draftYearTo);
    setDurationFrom(draftDurationFrom);
    setDurationTo(draftDurationTo);
    setRatingFrom(draftRatingFrom);
    setRatingTo(draftRatingTo);
    closeFilters();
  };

  const clearDraftFilters = () => {
    setDraftGenreIds([]);
    setDraftYearFrom(bounds.year.min);
    setDraftYearTo(bounds.year.max);
    setDraftDurationFrom(bounds.duration.min);
    setDraftDurationTo(bounds.duration.max);
    setDraftRatingFrom(bounds.rating.min);
    setDraftRatingTo(bounds.rating.max);
  };

  return (
    <section className="cartelera-page" aria-labelledby="cartelera-title">
      <div className="cartelera-page__inner">
        <h1 id="cartelera-title" className="cartelera-page__title">
          {texts.title}
        </h1>

        {isLoading && (
          <p className="cartelera-page__status" role="status">
            {texts.loading}
          </p>
        )}

        {!isLoading && hasLoadError && (
          <p className="cartelera-page__status cartelera-page__status--error" role="alert">
            {texts.error}
          </p>
        )}

        {!isLoading && !hasLoadError && movies.length === 0 && (
          <p className="cartelera-page__status">{texts.empty}</p>
        )}

        {!isLoading && !hasLoadError && movies.length > 0 && (
          <>
            <div className="cartelera-filters" ref={filtersRef}>
              <form
                className="cartelera-filters__bar"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (filtersOpen) applyFilters();
                }}
              >
                <div className="cartelera-filters__search">
                  <label className="cartelera-filters__sr" htmlFor="cartelera-search">
                    {texts.filters.search}
                  </label>
                  <input
                    id="cartelera-search"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={texts.filters.searchPlaceholder}
                  />
                </div>
                <button
                  type="button"
                  className={`admin-btn admin-btn--ghost cartelera-filters__toggle${
                    hasExtraFilters ? ' cartelera-filters__toggle--active' : ''
                  }`}
                  aria-expanded={filtersOpen}
                  aria-controls="cartelera-filters-panel"
                  onClick={() => (filtersOpen ? closeFilters() : openFilters())}
                >
                  {texts.filters.open}
                </button>
              </form>

              {filtersOpen && (
                <div
                  id="cartelera-filters-panel"
                  className="cartelera-filters__panel"
                  role="dialog"
                  aria-label={texts.filters.open}
                >
                  {genres.length > 0 && (
                    <div className="cartelera-filters__genres" ref={genreMenuRef}>
                      <span className="cartelera-filters__label" id="cartelera-genres-label">
                        {texts.filters.genres}
                      </span>
                      <div className="cartelera-filters__select">
                        <button
                          type="button"
                          id="cartelera-genres"
                          className="cartelera-filters__select-btn"
                          aria-haspopup="listbox"
                          aria-expanded={genreMenuOpen}
                          aria-labelledby="cartelera-genres-label cartelera-genres"
                          onClick={() => setGenreMenuOpen((open) => !open)}
                        >
                          {texts.filters.genresPlaceholder}
                        </button>
                        {genreMenuOpen && (
                          <ul className="cartelera-filters__menu" role="listbox" aria-multiselectable="true">
                            {genres.map((genre) => {
                              const selected = draftGenreIds.includes(genre.id);
                              return (
                                <li key={genre.id} role="option" aria-selected={selected}>
                                  <button
                                    type="button"
                                    className={`cartelera-filters__option${
                                      selected ? ' cartelera-filters__option--selected' : ''
                                    }`}
                                    onClick={() => addGenre(genre.id)}
                                    disabled={selected}
                                  >
                                    {genre.name}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                      {draftGenres.length > 0 && (
                        <ul className="cartelera-filters__chips">
                          {draftGenres.map((genre) => (
                            <li key={genre.id} className="cartelera-filters__chip">
                              <span>{genre.name}</span>
                              <button
                                type="button"
                                className="cartelera-filters__chip-remove"
                                onClick={() => removeGenre(genre.id)}
                                aria-label={texts.filters.removeGenre.replace('{name}', genre.name)}
                              >
                                ×
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <div className="cartelera-filters__ranges">
                    <fieldset className="cartelera-filters__range">
                      <legend className="cartelera-filters__label">{texts.filters.year}</legend>
                      <div className="cartelera-filters__range-control">
                        <label className="cartelera-filters__range-half">
                          <span>{texts.filters.from}</span>
                          <input
                            type="number"
                            inputMode="numeric"
                            min={bounds.year.min}
                            max={bounds.year.max}
                            value={draftYearFrom}
                            onChange={(event) => setDraftYearFrom(Number(event.target.value))}
                          />
                        </label>
                        <label className="cartelera-filters__range-half">
                          <span>{texts.filters.to}</span>
                          <input
                            type="number"
                            inputMode="numeric"
                            min={bounds.year.min}
                            max={bounds.year.max}
                            value={draftYearTo}
                            onChange={(event) => setDraftYearTo(Number(event.target.value))}
                          />
                        </label>
                      </div>
                    </fieldset>

                    <fieldset className="cartelera-filters__range">
                      <legend className="cartelera-filters__label">{texts.filters.duration}</legend>
                      <div className="cartelera-filters__range-control">
                        <label className="cartelera-filters__range-half">
                          <span>{texts.filters.from}</span>
                          <span className="cartelera-filters__range-value">
                            <input
                              type="number"
                              inputMode="numeric"
                              min={bounds.duration.min}
                              max={bounds.duration.max}
                              value={draftDurationFrom}
                              onChange={(event) => setDraftDurationFrom(Number(event.target.value))}
                            />
                            <span className="cartelera-filters__range-unit">{texts.card.duration}</span>
                          </span>
                        </label>
                        <label className="cartelera-filters__range-half">
                          <span>{texts.filters.to}</span>
                          <span className="cartelera-filters__range-value">
                            <input
                              type="number"
                              inputMode="numeric"
                              min={bounds.duration.min}
                              max={bounds.duration.max}
                              value={draftDurationTo}
                              onChange={(event) => setDraftDurationTo(Number(event.target.value))}
                            />
                            <span className="cartelera-filters__range-unit">{texts.card.duration}</span>
                          </span>
                        </label>
                      </div>
                    </fieldset>

                    <fieldset className="cartelera-filters__range">
                      <legend className="cartelera-filters__label">{texts.filters.rating}</legend>
                      <div className="cartelera-filters__range-control">
                        <label className="cartelera-filters__range-half">
                          <span>{texts.filters.from}</span>
                          <span className="cartelera-filters__range-value">
                            <input
                              type="number"
                              inputMode="decimal"
                              min={0}
                              max={10}
                              step={0.1}
                              value={draftRatingFrom}
                              onChange={(event) => setDraftRatingFrom(Number(event.target.value))}
                            />
                            <span className="cartelera-filters__range-unit">/10</span>
                          </span>
                        </label>
                        <label className="cartelera-filters__range-half">
                          <span>{texts.filters.to}</span>
                          <span className="cartelera-filters__range-value">
                            <input
                              type="number"
                              inputMode="decimal"
                              min={0}
                              max={10}
                              step={0.1}
                              value={draftRatingTo}
                              onChange={(event) => setDraftRatingTo(Number(event.target.value))}
                            />
                            <span className="cartelera-filters__range-unit">/10</span>
                          </span>
                        </label>
                      </div>
                    </fieldset>
                  </div>

                  <div className="cartelera-filters__footer">
                    <p className="cartelera-filters__count">
                      {texts.filters.results.replace('{count}', String(previewCount))}
                    </p>
                    <div className="cartelera-filters__actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-btn--sm"
                        onClick={clearDraftFilters}
                        disabled={!hasDraftFilters}
                      >
                        {texts.filters.clear}
                      </button>
                      <button type="button" className="admin-btn admin-btn--sm" onClick={applyFilters}>
                        {texts.filters.apply}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {filteredMovies.length === 0 ? (
              <p className="cartelera-page__status">{texts.filters.empty}</p>
            ) : (
              <ul className="cartelera-grid">
                {filteredMovies.map((movie) => {
                  const { title, sinopsis } = getMovieDisplay(movie, language);
                  const genreLabel = movie.genre_ids
                    .map((id) => genreNames[id])
                    .filter(Boolean)
                    .join(', ');

                  return (
                    <li key={movie.id} className="cartelera-card">
                      <Link to={`/cartelera/${movie.id}`} className="cartelera-card__link">
                        <figure className="cartelera-card__poster">
                          {movie.image ? (
                            <img
                              src={movie.image}
                              alt={`${texts.card.imageAlt} ${title}`}
                              className="cartelera-card__image"
                              loading="lazy"
                              onError={(event) => {
                                event.currentTarget.src = 'https://via.placeholder.com/300x450?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="cartelera-card__placeholder" aria-hidden="true" />
                          )}
                        </figure>
                        <div className="cartelera-card__body">
                          <h2 className="cartelera-card__title">{title}</h2>
                          <p className="cartelera-card__meta">
                            {[movie.release_year, movie.duration ? `${movie.duration} ${texts.card.duration}` : null]
                              .filter(Boolean)
                              .join(' · ')}
                            {movie.rating != null && (
                              <>
                                {' · '}
                                {texts.card.rating}: {movie.rating.toFixed(1)}/10
                              </>
                            )}
                          </p>
                          <p className="cartelera-card__genres">{genreLabel || '\u00a0'}</p>
                          <p className="cartelera-card__synopsis">{sinopsis || '—'}</p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </section>
  );
}
