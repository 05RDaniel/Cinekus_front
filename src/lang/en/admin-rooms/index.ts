export default {
  title: 'Rooms',
  addButton: 'Add room',
  table: {
    columns: {
      id: 'ID',
      name: 'Name',
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
    },
    buttons: {
      cancel: 'Cancel',
      saving: 'Saving...',
      saveChanges: 'Save changes',
      create: 'Create room',
    },
    errors: {
      missingFields: 'Enter a name',
      sessionExpired: 'Session expired or invalid. Sign in again with an ADMIN user.',
      forbidden: 'You do not have permission (ADMIN role required).',
      generic: 'Could not save the room',
    },
  },
} as const;
