export default {
  title: 'Bookings',
  filters: {
    userId: 'User ID',
    sessionId: 'Session ID',
    apply: 'Apply filters',
    clear: 'Clear',
  },
  table: {
    columns: {
      id: 'ID',
      userId: 'User',
      sessionId: 'Session',
      movie: 'Movie',
      sessionStart: 'Session start',
      createdAt: 'Created',
      statusId: 'Status',
      actions: 'Actions',
    },
    states: {
      loading: 'Loading...',
      loadError: 'Could not load bookings',
      empty: 'No bookings',
    },
    actions: {
      view: 'View',
      delete: 'Delete',
    },
    confirmDelete: 'Delete this booking?',
  },
  modal: {
    titleView: 'Booking detail',
    closeAriaLabel: 'Close',
    fields: {
      id: 'ID',
      userId: 'User',
      sessionId: 'Session',
      movie: 'Movie',
      sessionStart: 'Session start',
      createdAt: 'Created',
      statusId: 'Status',
    },
    buttons: {
      close: 'Close',
    },
  },
  errors: {
    sessionExpired: 'Session expired or invalid. Sign in again with an ADMIN user.',
    forbidden: 'You do not have permission (ADMIN role required).',
    generic: 'Operation failed',
    deleteNotAvailable: 'Delete is not available on the API yet',
  },
} as const;
