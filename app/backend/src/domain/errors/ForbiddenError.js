/**
 * Error de dominio: el usuario está autenticado, pero su rol no le permite
 * ejecutar la operación (ej. un repartidor que intenta marcar un pedido como pagado).
 */
class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

module.exports = ForbiddenError;
