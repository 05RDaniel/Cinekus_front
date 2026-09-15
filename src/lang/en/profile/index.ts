export default {
  title: 'My profile',
  subtitle: 'Update your name and email.',
  loading: 'Loading profile...',
  saved: 'Changes saved.',
  fields: {
    firstNameLabel: 'First name',
    lastNameLabel: 'Last name',
    secondLastNameLabel: 'Second last name (optional)',
    emailLabel: 'Email',
  },
  buttons: {
    save: 'Save',
    saving: 'Saving...',
  },
  errors: {
    missingFields: 'Fill in first name, last name and email',
    invalidEmail: 'The email is not valid',
    load: 'Could not load the profile',
    sessionExpired: 'Session expired. Sign in again.',
    forbidden: 'You do not have permission for this action.',
    generic: 'Could not save the changes',
  },
} as const;
