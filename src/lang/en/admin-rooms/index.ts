export default {
  title: 'Rooms',
  addButton: 'Add room',
  table: {
    columns: {
      id: 'ID',
      name: 'Name',
      size: 'Grid',
      seats: 'Seats',
      actions: 'Actions',
    },
    states: {
      loading: 'Loading...',
      loadError: 'Could not load rooms',
      empty: 'No rooms',
    },
    actions: {
      edit: 'Edit',
      delete: 'Delete',
    },
    confirmDelete: 'Delete this room?',
  },
  modal: {
    titleCreate: 'Add room',
    titleEdit: 'Edit room',
    closeAriaLabel: 'Close',
    fields: {
      name: 'Name',
      rows: 'Rows',
      columns: 'Columns',
      map: 'Seat map',
      screen: 'Screen',
      selectAll: 'Select all',
      clearSelection: 'Clear selection',
      selectedCount: '{count} selected',
      assign: 'Assign type',
      zoomReset: 'Fit',
    },
    types: {
      standard: 'Standard',
      vip: 'VIP',
      accessible: 'Accessible',
      none: 'None',
    },
    buttons: {
      cancel: 'Cancel',
      saving: 'Saving...',
      saveChanges: 'Save changes',
      create: 'Create room',
    },
    errors: {
      missingFields: 'Enter a name',
      noSeats: 'The room must have at least one seat.',
      sessionExpired: 'Session expired or invalid. Sign in again with an ADMIN user.',
      forbidden: 'You do not have permission (ADMIN role required).',
      generic: 'Could not save the room',
    },
  },
} as const;
