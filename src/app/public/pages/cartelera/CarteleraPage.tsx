import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Movie } from '../../../features/movies/models/movie.model';
import { getGenres, getMovies } from '../../../features/movies/services/movies.service';
import { getMovieDisplay, mapApiLanguage } from '../../../features/movies/utils/movieDisplay';
import { useLanguage } from '../../../core/context/LanguageContext';
import { useInitialLoad } from '../../../shared/hooks/useInitialLoad';
import { usePageTexts } from '../../../../lang';

export function CarteleraPage() {
  const { language } = useLanguage();
  const texts = usePageTexts('cartelera');
  const loadMovies = useCallback(() => getMovies(), []);
  const { rows: movies, isLoading, hasLoadError } = useInitialLoad<Movie[]>(loadMovies, []);
  const [genreNames, setGenreNames] = useState<Record<number, string>>({});

  useEffect(() => {
    void getGenres(mapApiLanguage(language))
      .then((genres) => {
        setGenreNames(Object.fromEntries(genres.map((genre) => [genre.id, genre.name])));
      })
      .catch(() => setGenreNames({}));
  }, [language]);

  const sortedMovies = useMemo(
    () => [...movies].sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })),
    [movies]
  );

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

        {!isLoading && !hasLoadError && sortedMovies.length === 0 && (
          <p className="cartelera-page__status">{texts.empty}</p>
        )}

        {!isLoading && !hasLoadError && sortedMovies.length > 0 && (
          <ul className="cartelera-grid">
            {sortedMovies.map((movie) => {
              const { title, sinopsis } = getMovieDisplay(movie, language);
              const genres = movie.genre_ids
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
                      <p className="cartelera-card__genres">{genres || '\u00a0'}</p>
                      <p className="cartelera-card__synopsis">{sinopsis || '—'}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
