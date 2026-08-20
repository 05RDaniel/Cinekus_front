export default {
  title: 'Reservas',
  filters: {
    userId: 'ID usuario',
    sessionId: 'ID sesión',
    apply: 'Aplicar filtros',
    clear: 'Limpiar',
  },
  table: {
    columns: {
      id: 'ID',
      userId: 'Usuario',
      sessionId: 'Sesión',
      movie: 'Película',
      sessionStart: 'Inicio sesión',
      createdAt: 'Creado',
      statusId: 'Estado',
      actions: 'Acciones',
    },
    states: {
      loading: 'Cargando...',
      loadError: 'No se pudieron cargar las reservas',
      empty: 'No hay reservas',
    },
    actions: {
      view: 'Ver',
      delete: 'Eliminar',
    },
    confirmDelete: '¿Eliminar esta reserva?',
  },
  modal: {
    titleView: 'Detalle de reserva',
    closeAriaLabel: 'Cerrar',
    fields: {
      id: 'ID',
      userId: 'Usuario',
      sessionId: 'Sesión',
      movie: 'Película',
      sessionStart: 'Inicio sesión',
      createdAt: 'Creado',
      statusId: 'Estado',
    },
    buttons: {
      close: 'Cerrar',
    },
  },
  errors: {
    sessionExpired: 'Sesión caducada o no válida. Inicia sesión de nuevo con un usuario ADMIN.',
    forbidden: 'No tienes permiso (se requiere rol ADMIN).',
    generic: 'La operación falló',
    deleteNotAvailable: 'Eliminar no está disponible en la API todavía',
  },
} as const;
