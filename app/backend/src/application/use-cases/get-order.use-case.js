const NotFoundError = require('../../domain/errors/NotFoundError');
const orderRepository = require('../../infrastructure/repositories/order.repository');
const { toEntity, withTransitions } = require('./order-view');

/**
 * Caso de Uso: Consultar el detalle de un pedido (productos e historial de estados).
 * Un pedido que el usuario no puede ver se reporta como inexistente.
 */
class GetOrderUseCase {
  async execute(orderId, actor) {
    const order = await orderRepository.findById(orderId);
    if (!order || !toEntity(order).isVisibleTo(actor)) {
      throw new NotFoundError('El pedido no existe.');
    }
    return withTransitions(order, actor);
  }
}

module.exports = new GetOrderUseCase();
