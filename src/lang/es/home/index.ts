export default {
  hero: { title: 'Quizás te gusten...' },
  loading: { spinnerAriaLabel: 'Cargando películas' },
  alerts: { retryingMessage: 'No se pudieron cargar películas. Reintentando...' },
  card: { imageAlt: 'Película destacada', ratingLabel: 'Calificación' },
  meta: {
    name: 'Nombre',
    genres: 'Géneros',
    rating: 'Calificación',
    year: 'Año',
    cast: 'Reparto',
    synopsis: 'Sinopsis',
  },
  carousel: {
    prev: 'Película anterior',
    next: 'Película siguiente',
  },
} as const;
