export default {
  title: 'Iniciar sesión',
  subtitle: 'Accede con tu cuenta para continuar.',
  fields: {
    emailLabel: 'Email',
    passwordLabel: 'Contraseña',
  },
  buttons: {
    submit: 'Iniciar sesión',
    submitting: 'Entrando...',
    back: 'Volver',
  },
  switch: {
    prompt: '¿No tienes cuenta?',
    link: 'Regístrate',
  },
  errors: {
    missingFields: 'Completa email y contraseña',
    generic: 'No se pudo iniciar sesión',
  },
} as const;
