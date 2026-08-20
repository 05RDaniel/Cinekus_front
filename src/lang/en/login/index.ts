export default {
  title: 'Sign in',
  subtitle: 'Sign in with your account to continue.',
  fields: {
    emailLabel: 'Email',
    passwordLabel: 'Password',
  },
  buttons: {
    submit: 'Sign in',
    submitting: 'Signing in...',
    back: 'Back',
  },
  switch: {
    prompt: "Don't have an account?",
    link: 'Sign up',
  },
  errors: {
    missingFields: 'Enter email and password',
    generic: 'Could not sign in',
  },
} as const;
