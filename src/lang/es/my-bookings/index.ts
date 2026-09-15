export default {
  title: 'Mis reservas',
  subtitle: 'Consulta y cancela tus entradas.',
  loading: 'Cargando reservas...',
  empty: 'Aún no tienes reservas.',
  goToMovies: 'Ver cartelera',
  seats: 'Asientos',
  total: 'Total',
  cancel: 'Cancelar',
  cancelling: 'Cancelando...',
  confirmCancel: '¿Cancelar esta reserva? Los asientos volverán a estar libres.',
  status: {
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
  },
  errors: {
    load: 'No se pudieron cargar tus reservas',
    sessionExpired: 'Sesión caducada. Inicia sesión de nuevo.',
    forbidden: 'No tienes permiso para esta acción.',
    generic: 'No se pudo completar la operación',
  },
} as const;
