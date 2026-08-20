export default {
  title: 'Create account',
  subtitle: 'Sign up to book tickets.',
  fields: {
    usernameLabel: 'Username',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    passwordConfirmLabel: 'Confirm password',
  },
  buttons: {
    submit: 'Sign up',
    submitting: 'Creating account...',
    back: 'Back',
  },
  switch: {
    prompt: 'Already have an account?',
    link: 'Sign in',
  },
  errors: {
    missingFields: 'Fill in all fields',
    passwordMismatch: 'Passwords do not match',
    passwordShort: 'Password must be at least 6 characters',
    generic: 'Could not create the account',
  },
} as const;
