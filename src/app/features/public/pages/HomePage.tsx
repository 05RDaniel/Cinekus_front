import { useEffect, useMemo, useState } from 'react';
import { HomeMovie } from '../../../core/models/cine.model';
import { getRandomPopularMovies } from '../../../core/services/cine.service';
import { langToKey, translations } from '../../../core/i18n/translations';
import { useLanguage } from '../../../core/context/LanguageContext';

export function HomePage() {
  const { language } = useLanguage();
  const [movies, setMovies] = useState<HomeMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);

  const key = langToKey(language);
  const heroTexts = translations.home.hero[key];
  const loadingTexts = translations.home.loading[key];
  const alertTexts = translations.home.alerts[key];
  const cardTexts = translations.home.card[key];

  useEffect(() => {
    let mounted = true;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const loadMovies = async () => {
      try {
        setIsLoading(true);
        setHasLoadError(false);
        const response = await getRandomPopularMovies(3, language);
        if (!mounted) return;
        const filtered = (response ?? []).filter((movie) => Boolean(movie?.image));
        setMovies(filtered);
        setHasLoadError(filtered.length === 0);
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

  const loadingCards = useMemo(() => [1, 2, 3], []);

  return (
    <section className="d-flex align-items-center justify-content-center px-3" style={{ height: '85vh' }}>
      <div className="container" style={{ height: '70vh' }}>
        <h1 className="h4 text-center mb-4">{heroTexts.title}</h1>
        {isLoading && (
          <div className="d-flex justify-content-center mb-3">
            <div className="spinner-border text-secondary" role="status" aria-label={loadingTexts.spinnerAriaLabel} />
          </div>
        )}

        {isLoading && (
          <div className="row g-3 justify-content-center align-items-stretch" style={{ height: '60vh' }}>
            {loadingCards.map((item) => (
              <article className="col-12 col-md-4 h-100" key={item}>
                <div className="card h-100">
                  <div className="placeholder-glow p-3 h-100 d-flex flex-column justify-content-end">
                    <span className="placeholder col-8 mb-2" />
                    <span className="placeholder col-5 mb-2" />
                    <span className="placeholder col-9" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!isLoading && hasLoadError && <div className="alert alert-warning text-center py-2">{alertTexts.retryingMessage}</div>}

        {!isLoading && movies.length > 0 && (
          <div className="row g-3 justify-content-center align-items-stretch" style={{ height: '60vh' }}>
            {movies.map((movie) => (
              <article className="col-12 col-md-4 h-100" key={movie.id}>
                <div className="card h-100 shadow-sm overflow-hidden home-card-hover">
                  <img
                    src={movie.image}
                    onError={(event) => {
                      event.currentTarget.src = 'https://via.placeholder.com/500x750?text=No+Image';
                    }}
                    alt={cardTexts.imageAlt}
                    className="w-100 h-100 object-fit-cover home-card-image"
                  />
                  <div className="home-card-title-wrap">
                    <p className="home-card-title mb-2 text-center">{movie.title}</p>

                    <div className="d-flex flex-wrap gap-1 justify-content-center mb-2">
                      {movie.genres.map((genre) => (
                        <span className="badge text-bg-light" key={genre}>
                          {genre}
                        </span>
                      ))}
                    </div>

                    <p className="home-card-rating mb-2 text-center">
                      {cardTexts.ratingLabel}: {movie.vote_average.toFixed(1)}/10
                    </p>
                    <p className="home-card-overview mb-0">{movie.overview}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
