export default {
  title: 'Usuarios',
  addButton: 'Añadir usuario',
  table: {
    columns: {
      id: 'ID',
      username: 'Usuario',
      email: 'Correo',
      role: 'Rol',
      actions: 'Acciones',
    },
    states: {
      loading: 'Cargando...',
      loadError: 'No se pudieron cargar los usuarios',
      empty: 'No hay usuarios',
    },
    actions: {
      edit: 'Editar',
      delete: 'Eliminar',
    },
    confirmDelete: '¿Eliminar este usuario?',
  },
  modal: {
    titleCreate: 'Añadir usuario',
    titleEdit: 'Editar usuario',
    closeAriaLabel: 'Cerrar',
    fields: {
      id: 'ID',
      username: 'Usuario',
      email: 'Correo',
      password: 'Contraseña',
      passwordHint: 'Dejar vacío para mantener la contraseña actual',
      role: 'Rol',
      roleAdmin: 'ADMIN',
      roleUser: 'USER',
    },
    buttons: {
      cancel: 'Cancelar',
      saving: 'Guardando...',
      saveChanges: 'Guardar cambios',
      create: 'Crear usuario',
    },
    errors: {
      missingFields: 'Completa todos los campos obligatorios',
      sessionExpired: 'Sesión caducada o no válida. Inicia sesión de nuevo con un usuario ADMIN.',
      forbidden: 'No tienes permiso (se requiere rol ADMIN).',
      generic: 'No se pudo guardar el usuario',
    },
  },
} as const;
