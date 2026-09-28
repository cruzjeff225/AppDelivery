const orderRepository = require('../../infrastructure/repositories/order.repository');
const { withTransitions } = require('./order-view');

/**
 * Caso de Uso: Listar los pedidos del usuario autenticado ("Mis pedidos"),
 * en curso y finalizados, del más reciente al más antiguo.
 */
class ListMyOrdersUseCase {
  async execute(actor) {
    const rows = await orderRepository.list({ userId: actor.id });
    return rows.map((row) => withTransitions(row, actor));
  }
}

module.exports = new ListMyOrdersUseCase();
