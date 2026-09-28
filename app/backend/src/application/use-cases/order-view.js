const Order = require('../../domain/entities/Order');

/**
 * Convierte una fila de pedido en su entidad de dominio.
 */
const toEntity = (row) => new Order({
  id: row.id,
  userId: row.user_id,
  status: row.status,
  deliveryUserId: row.delivery_user_id,
});

/**
 * Agrega a la respuesta los estados a los que el usuario actual puede mover el pedido,
 * para que el cliente web no duplique las reglas de la máquina de estados.
 */
const withTransitions = (row, actor) => ({
  ...row,
  available_transitions: toEntity(row).availableTransitions(actor),
});

module.exports = { toEntity, withTransitions };
