/**
 * Error de dominio: una operación entra en conflicto con el estado actual
 * de los datos (ej. un correo electrónico que ya existe).
 */
class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
  }
}

module.exports = ConflictError;
