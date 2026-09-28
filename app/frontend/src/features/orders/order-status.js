// Presentación de los estados del pedido. Las transiciones permitidas las decide el servidor
// (campo `available_transitions`), aquí solo se define cómo se muestran.
export const ORDER_STATUS = {
  CREADO: { label: 'Creado', badge: 'badge--neutral', action: null },
  PAGADO: { label: 'Pagado', badge: 'badge--info', action: 'Marcar pagado' },
  EN_PREPARACION: { label: 'En preparación', badge: 'badge--warning', action: 'Preparar' },
  EN_CAMINO: { label: 'En camino', badge: 'badge--secondary', action: 'Salir a entregar' },
  ENTREGADO: { label: 'Entregado', badge: 'badge--success', action: 'Marcar entregado' },
  CANCELADO: { label: 'Cancelado', badge: 'badge--danger', action: 'Cancelar' },
};

export const statusLabel = (status) => ORDER_STATUS[status]?.label || status;
