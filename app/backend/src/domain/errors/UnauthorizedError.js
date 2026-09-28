/**
 * Error de dominio: credenciales inválidas o falta de autorización
 * para completar la operación solicitada.
 */
class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

module.exports = UnauthorizedError;
