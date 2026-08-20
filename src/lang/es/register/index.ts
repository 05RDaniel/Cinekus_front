export default {
  title: 'Crear cuenta',
  subtitle: 'Regístrate para reservar entradas.',
  fields: {
    usernameLabel: 'Usuario',
    emailLabel: 'Email',
    passwordLabel: 'Contraseña',
    passwordConfirmLabel: 'Confirmar contraseña',
  },
  buttons: {
    submit: 'Registrarse',
    submitting: 'Creando cuenta...',
    back: 'Volver',
  },
  switch: {
    prompt: '¿Ya tienes cuenta?',
    link: 'Iniciar sesión',
  },
  errors: {
    missingFields: 'Completa todos los campos',
    passwordMismatch: 'Las contraseñas no coinciden',
    passwordShort: 'La contraseña debe tener al menos 6 caracteres',
    generic: 'No se pudo crear la cuenta',
  },
} as const;
