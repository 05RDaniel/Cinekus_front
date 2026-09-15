export default {
  hero: { title: 'You might like...' },
  loading: { spinnerAriaLabel: 'Loading movies' },
  alerts: {
    retryingMessage: 'Movies could not be loaded. Retrying...',
    empty: 'There are no movies with upcoming sessions.',
  },
  card: { imageAlt: 'Featured movie', ratingLabel: 'Rating' },
  meta: {
    name: 'Name',
    genres: 'Genres',
    rating: 'Rating',
    year: 'Year',
    cast: 'Cast',
    synopsis: 'Synopsis',
  },
  carousel: {
    prev: 'Previous movie',
    next: 'Next movie',
    openMovie: 'Open {title}',
  },
} as const;
