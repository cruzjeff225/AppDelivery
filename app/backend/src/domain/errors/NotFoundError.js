/**
 * Error de dominio: el recurso solicitado no existe (ej. un pedido con un ID inexistente).
 */
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

module.exports = NotFoundError;
