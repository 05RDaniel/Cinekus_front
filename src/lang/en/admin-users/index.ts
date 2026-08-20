export default {
  title: 'Users',
  addButton: 'Add user',
  table: {
    columns: {
      id: 'ID',
      username: 'Username',
      email: 'Email',
      role: 'Role',
      actions: 'Actions',
    },
    states: {
      loading: 'Loading...',
      loadError: 'Could not load users',
      empty: 'No users',
    },
    actions: {
      edit: 'Edit',
      delete: 'Delete',
    },
    confirmDelete: 'Delete this user?',
  },
  modal: {
    titleCreate: 'Add user',
    titleEdit: 'Edit user',
    closeAriaLabel: 'Close',
    fields: {
      id: 'ID',
      username: 'Username',
      email: 'Email',
      password: 'Password',
      passwordHint: 'Leave blank to keep current password',
      role: 'Role',
      roleAdmin: 'ADMIN',
      roleUser: 'USER',
    },
    buttons: {
      cancel: 'Cancel',
      saving: 'Saving...',
      saveChanges: 'Save changes',
      create: 'Create user',
    },
    errors: {
      missingFields: 'Fill in all required fields',
      sessionExpired: 'Session expired or invalid. Sign in again with an ADMIN user.',
      forbidden: 'You do not have permission (ADMIN role required).',
      generic: 'Could not save the user',
    },
  },
} as const;
