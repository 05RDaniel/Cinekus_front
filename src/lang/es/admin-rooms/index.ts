export default {
  title: 'Salas',
  addButton: 'Añadir sala',
  table: {
    columns: {
      id: 'ID',
      name: 'Nombre',
      size: 'Cuadrícula',
      seats: 'Asientos',
      actions: 'Acciones',
    },
    states: {
      loading: 'Cargando...',
      loadError: 'No se pudieron cargar las salas',
      empty: 'No hay salas',
    },
    actions: {
      edit: 'Editar',
      delete: 'Eliminar',
    },
    confirmDelete: '¿Eliminar esta sala?',
  },
  modal: {
    titleCreate: 'Añadir sala',
    titleEdit: 'Editar sala',
    closeAriaLabel: 'Cerrar',
    fields: {
      name: 'Nombre',
      rows: 'Filas',
      columns: 'Columnas',
      map: 'Mapa de asientos',
      screen: 'Pantalla',
      selectAll: 'Seleccionar todo',
      clearSelection: 'Limpiar selección',
      selectedCount: '{count} seleccionados',
      assign: 'Asignar tipo',
      zoomReset: 'Ajustar',
    },
    types: {
      standard: 'Estándar',
      vip: 'VIP',
      accessible: 'Accesible',
      none: 'No existe',
    },
    buttons: {
      cancel: 'Cancelar',
      saving: 'Guardando...',
      saveChanges: 'Guardar cambios',
      create: 'Crear sala',
    },
    errors: {
      missingFields: 'Introduce un nombre',
      noSeats: 'La sala debe tener al menos un asiento.',
      sessionExpired: 'Sesión caducada o no válida. Inicia sesión de nuevo con un usuario ADMIN.',
      forbidden: 'No tienes permiso (se requiere rol ADMIN).',
      generic: 'No se pudo guardar la sala',
    },
  },
} as const;
