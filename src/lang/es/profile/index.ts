export default {
  title: 'Mi perfil',
  subtitle: 'Actualiza tu nombre y e-mail.',
  loading: 'Cargando perfil...',
  saved: 'Cambios guardados.',
  fields: {
    firstNameLabel: 'Nombre',
    lastNameLabel: 'Apellido',
    secondLastNameLabel: 'Segundo apellido (opcional)',
    emailLabel: 'Email',
  },
  buttons: {
    save: 'Guardar',
    saving: 'Guardando...',
  },
  errors: {
    missingFields: 'Completa nombre, apellido y email',
    invalidEmail: 'El e-mail no es válido',
    load: 'No se pudo cargar el perfil',
    sessionExpired: 'Sesión caducada. Inicia sesión de nuevo.',
    forbidden: 'No tienes permiso para esta acción.',
    generic: 'No se pudieron guardar los cambios',
  },
} as const;
