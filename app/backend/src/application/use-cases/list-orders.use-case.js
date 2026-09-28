const Order = require('../../domain/entities/Order');
const orderRepository = require('../../infrastructure/repositories/order.repository');
const { toEntity, withTransitions } = require('./order-view');

const ACTIVE_STATUSES = Object.keys(Order.TRANSITIONS).filter((status) => Order.TRANSITIONS[status].length > 0);

/**
 * Caso de Uso: Listar pedidos para el panel de monitoreo
 * Por defecto devuelve los pedidos en curso. El repartidor solo recibe los que puede ver.
 */
class ListOrdersUseCase {
  async execute(actor, { statuses = ACTIVE_STATUSES } = {}) {
    const rows = await orderRepository.list({ statuses });
    return rows
      .filter((row) => toEntity(row).isVisibleTo(actor))
      .map((row) => withTransitions(row, actor));
  }
}

module.exports = new ListOrdersUseCase();
module.exports.ACTIVE_STATUSES = ACTIVE_STATUSES;
