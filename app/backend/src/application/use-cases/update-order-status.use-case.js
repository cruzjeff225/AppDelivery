const NotFoundError = require('../../domain/errors/NotFoundError');
const orderRepository = require('../../infrastructure/repositories/order.repository');
const { toEntity } = require('./order-view');
const getOrderUseCase = require('./get-order.use-case');

/**
 * Caso de Uso: Cambiar el estado de un pedido (RF-06 / RF-10)
 * La entidad Order valida la transición y el rol; el repositorio persiste el cambio,
 * el historial y la devolución de inventario en una sola transacción.
 */
class UpdateOrderStatusUseCase {
  async execute(orderId, nextStatus, actor) {
    await orderRepository.changeStatus(orderId, actor.id, (row) => {
      const order = row && toEntity(row);
      if (!order || !order.isVisibleTo(actor)) {
        throw new NotFoundError('El pedido no existe.');
      }
      const previousStatus = order.transitionTo(nextStatus, actor);
      return {
        status: order.status,
        deliveryUserId: order.deliveryUserId,
        previousStatus,
        restock: order.requiresRestock(),
      };
    });
    return getOrderUseCase.execute(orderId, actor);
  }
}

module.exports = new UpdateOrderStatusUseCase();
