export default {
  hero: { title: 'Quizás te gusten...' },
  loading: { spinnerAriaLabel: 'Cargando películas' },
  alerts: {
    retryingMessage: 'No se pudieron cargar películas. Reintentando...',
    empty: 'No hay películas con sesiones disponibles.',
  },
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
    openMovie: 'Ver ficha de {title}',
  },
} as const;
