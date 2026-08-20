import { useEffect, useState } from 'react';
import { HomeMovie } from '../../../features/movies/models/movie.model';
import { getHomePopularMovies } from '../../../features/movies/services/movies.service';
import { useLanguage } from '../../../core/context/LanguageContext';
import type { Lang } from '../../../core/context/LanguageContext';
import { usePageTexts } from '../../../../lang';

const HOME_MOVIE_LIMIT = 10;
const START_CENTER_INDEX = 0;

function mapApiLanguage(language: Lang): 'es' | 'en' {
  return language === 'en-US' ? 'en' : 'es';
}

function circularIndex(index: number, length: number): number {
  if (length === 0) return 0;
  return ((index % length) + length) % length;
}

function getVisibleSlots(list: HomeMovie[], center: number) {
  const length = list.length;
  if (length === 0) {
    return { left: null, center: null, right: null };
  }
  if (length === 1) {
    return { left: null, center: list[0], right: null };
  }

  const centerIdx = circularIndex(center, length);
  const leftIdx = circularIndex(centerIdx - 1, length);
  const rightIdx = circularIndex(centerIdx + 1, length);

  return {
    left: list[leftIdx],
    center: list[centerIdx],
    right: list[rightIdx],
  };
}

export function HomePage() {
  const { language } = useLanguage();
  const texts = usePageTexts('home');
  const [movies, setMovies] = useState<HomeMovie[]>([]);
  const [centerIndex, setCenterIndex] = useState(START_CENTER_INDEX);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);

  const { left: leftMovie, center: featured, right: rightMovie } = getVisibleSlots(movies, centerIndex);

  useEffect(() => {
    let mounted = true;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const loadMovies = async () => {
      try {
        setIsLoading(true);
        setHasLoadError(false);
        const batch = await getHomePopularMovies(HOME_MOVIE_LIMIT, mapApiLanguage(language));
        if (!mounted) return;

        const withImage = batch.filter((movie) => Boolean(movie.image));
        setMovies(withImage);
        setCenterIndex(Math.min(START_CENTER_INDEX, Math.max(0, withImage.length - 1)));
        setHasLoadError(withImage.length === 0);
      } catch {
        if (!mounted) return;
        setMovies([]);
        setHasLoadError(true);
        retryTimer = setTimeout(loadMovies, 2500);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void loadMovies();

    return () => {
      mounted = false;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [language]);

  const goPrev = () => {
    if (movies.length === 0) return;
    setCenterIndex((prev) => prev - 1);
  };

  const goNext = () => {
    if (movies.length === 0) return;
    setCenterIndex((prev) => prev + 1);
  };

  const visibleSlides = [
    leftMovie ? { movie: leftMovie, position: 'left' as const } : null,
    featured ? { movie: featured, position: 'center' as const } : null,
    rightMovie ? { movie: rightMovie, position: 'right' as const } : null,
  ].filter(Boolean) as { movie: HomeMovie; position: 'left' | 'center' | 'right' }[];

  return (
    <section className="home-page" aria-label={texts.hero.title}>
      <div className="home-page__layout">
        <aside className="home-page__meta" aria-busy={isLoading}>
          {isLoading ? (
            <div className="home-page__skeleton">
              <span className="home-page__skeleton-line" />
              <span className="home-page__skeleton-line" />
              <span className="home-page__skeleton-line" />
              <span className="home-page__skeleton-line" />
            </div>
          ) : featured ? (
            <dl className="home-page__meta-list">
              <div className="home-page__meta-item">
                <dt className="text-meta">{texts.meta.name}</dt>
                <dd>{featured.title}</dd>
              </div>
              <div className="home-page__meta-item">
                <dt className="text-meta">{texts.meta.genres}</dt>
                <dd>{featured.genres.join(', ') || '—'}</dd>
              </div>
              <div className="home-page__meta-item">
                <dt className="text-meta">{texts.meta.year}</dt>
                <dd>{featured.release_year ?? '—'}</dd>
              </div>
              <div className="home-page__meta-item">
                <dt className="text-meta">{texts.meta.rating}</dt>
                <dd>{featured.vote_average > 0 ? `${featured.vote_average.toFixed(1)}/10` : '—'}</dd>
              </div>
              <div className="home-page__meta-item">
                <dt className="text-meta">{texts.meta.cast}</dt>
                <dd className="home-page__meta-cast">{featured.cast.join(', ') || '—'}</dd>
              </div>
            </dl>
          ) : null}
        </aside>

        <div className="home-page__carousel" aria-busy={isLoading}>
          <div className="home-page__carousel-stage">
            {isLoading && (
              <>
                <div className="home-page__slide home-page__slide--left home-page__slide--placeholder" />
                <div className="home-page__slide home-page__slide--center home-page__slide--placeholder" />
                <div className="home-page__slide home-page__slide--right home-page__slide--placeholder" />
              </>
            )}

            {!isLoading && hasLoadError && (
              <p className="home-page__carousel-message">{texts.alerts.retryingMessage}</p>
            )}

            {!isLoading &&
              visibleSlides.map(({ movie, position }) => (
                <figure
                  key={`${movie.id}-${position}`}
                  className={`home-page__slide home-page__slide--${position}`}
                >
                  <img
                    src={movie.image}
                    alt={movie.title || texts.card.imageAlt}
                    className="home-page__slide-image"
                    onError={(event) => {
                      event.currentTarget.src = 'https://via.placeholder.com/500x750?text=No+Image';
                    }}
                  />
                </figure>
              ))}
          </div>

          {!isLoading && !hasLoadError && movies.length > 0 && (
            <div className="home-page__carousel-controls">
              <button
                type="button"
                className="home-page__carousel-nav"
                onClick={goPrev}
                aria-label={texts.carousel.prev}
              >
                ‹
              </button>
              <button
                type="button"
                className="home-page__carousel-nav"
                onClick={goNext}
                aria-label={texts.carousel.next}
              >
                ›
              </button>
            </div>
          )}
        </div>

        <aside className="home-page__synopsis" aria-busy={isLoading}>
          <h2 className="home-page__synopsis-title">{texts.meta.synopsis}</h2>
          {isLoading ? (
            <div className="home-page__skeleton">
              <span className="home-page__skeleton-block" />
              <span className="home-page__skeleton-block" />
              <span className="home-page__skeleton-block home-page__skeleton-block--short" />
            </div>
          ) : (
            <p className="home-page__synopsis-text">{featured?.overview || '—'}</p>
          )}
        </aside>
      </div>

      {isLoading && (
        <div className="home-page__loading" role="status" aria-label={texts.loading.spinnerAriaLabel}>
          <div className="home-page__spinner" />
        </div>
      )}
    </section>
  );
}
