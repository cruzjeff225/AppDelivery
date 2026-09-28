const ConflictError = require('../errors/ConflictError');
const ForbiddenError = require('../errors/ForbiddenError');

/**
 * Estados del ciclo de vida de un pedido (RF-06).
 */
const STATUS = Object.freeze({
  CREADO: 'CREADO',
  PAGADO: 'PAGADO',
  EN_PREPARACION: 'EN_PREPARACION',
  EN_CAMINO: 'EN_CAMINO',
  ENTREGADO: 'ENTREGADO',
  CANCELADO: 'CANCELADO',
});

/**
 * Máquina de estados finita: transiciones válidas desde cada estado.
 * Un pedido solo puede cancelarse antes de salir a entrega.
 */
const TRANSITIONS = Object.freeze({
  CREADO: [STATUS.PAGADO, STATUS.CANCELADO],
  PAGADO: [STATUS.EN_PREPARACION, STATUS.CANCELADO],
  EN_PREPARACION: [STATUS.EN_CAMINO, STATUS.CANCELADO],
  EN_CAMINO: [STATUS.ENTREGADO],
  ENTREGADO: [],
  CANCELADO: [],
});

/**
 * Transiciones que puede ejecutar el repartidor. El administrador puede ejecutar todas.
 */
const DELIVERY_TRANSITIONS = Object.freeze({
  EN_PREPARACION: [STATUS.EN_CAMINO],
  EN_CAMINO: [STATUS.ENTREGADO],
});

const LABELS = Object.freeze({
  CREADO: 'Creado',
  PAGADO: 'Pagado',
  EN_PREPARACION: 'En preparación',
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
});

/**
 * Entidad de Dominio: Order
 * Controla el ciclo de vida del pedido. Es independiente de Express y de PostgreSQL.
 * `actor` es el usuario que ejecuta la acción: { id, role }.
 */
class Order {
  constructor({ id = null, userId, status = STATUS.CREADO, deliveryUserId = null }) {
    if (!Object.prototype.hasOwnProperty.call(TRANSITIONS, status)) {
      throw new Error(`Estado de pedido desconocido: ${status}`);
    }
    this.id = id;
    this.userId = userId;
    this.status = status;
    this.deliveryUserId = deliveryUserId;
  }

  static isValidStatus(status) {
    return Object.prototype.hasOwnProperty.call(TRANSITIONS, status);
  }

  isFinal() {
    return TRANSITIONS[this.status].length === 0;
  }

  /**
   * Un repartidor ve los pedidos sin repartidor listos para salir o en camino,
   * y los que él mismo lleva.
   */
  isVisibleTo(actor) {
    if (actor.role === 'admin') return true;
    if (actor.role !== 'delivery') return false;
    if (this.deliveryUserId !== null) return this.deliveryUserId === actor.id;
    return this.status === STATUS.EN_PREPARACION || this.status === STATUS.EN_CAMINO;
  }

  /**
   * Estados a los que `actor` puede mover el pedido en este momento.
   */
  availableTransitions(actor) {
    return TRANSITIONS[this.status].filter((next) => this.#isAllowedFor(actor, next));
  }

  /**
   * Aplica la transición validando primero la máquina de estados y luego el rol.
   * Devuelve el estado anterior.
   */
  transitionTo(next, actor) {
    if (!TRANSITIONS[this.status].includes(next)) {
      throw new ConflictError(
        `No se puede cambiar un pedido de "${LABELS[this.status]}" a "${LABELS[next] || next}".`
      );
    }
    if (!this.#isAllowedFor(actor, next)) {
      throw new ForbiddenError('Tu rol no permite realizar este cambio de estado.');
    }

    const previous = this.status;
    this.status = next;
    // El repartidor que mueve un pedido sin asignar queda como responsable de la entrega.
    if (actor.role === 'delivery' && this.deliveryUserId === null) {
      this.deliveryUserId = actor.id;
    }
    return previous;
  }

  /**
   * Al cancelar, la mercadería aún no salió de tienda y debe volver al inventario.
   */
  requiresRestock() {
    return this.status === STATUS.CANCELADO;
  }

  #isAllowedFor(actor, next) {
    if (actor.role === 'admin') return true;
    if (actor.role !== 'delivery') return false;
    if (!(DELIVERY_TRANSITIONS[this.status] || []).includes(next)) return false;
    // Solo el repartidor asignado puede cerrar la entrega.
    return this.deliveryUserId === null || this.deliveryUserId === actor.id;
  }
}

Order.STATUS = STATUS;
Order.TRANSITIONS = TRANSITIONS;

module.exports = Order;
