export default {
  title: 'My bookings',
  subtitle: 'View and cancel your tickets.',
  loading: 'Loading bookings...',
  empty: 'You have no bookings yet.',
  goToMovies: 'Browse movies',
  seats: 'Seats',
  total: 'Total',
  cancel: 'Cancel',
  cancelling: 'Cancelling...',
  confirmCancel: 'Cancel this booking? The seats will become available again.',
  status: {
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
  },
  errors: {
    load: 'Could not load your bookings',
    sessionExpired: 'Session expired. Sign in again.',
    forbidden: 'You do not have permission for this action.',
    generic: 'The operation failed',
  },
} as const;
