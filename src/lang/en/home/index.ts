export default {
  hero: { title: 'You might like...' },
  loading: { spinnerAriaLabel: 'Loading movies' },
  alerts: { retryingMessage: 'Movies could not be loaded. Retrying...' },
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
  },
} as const;
