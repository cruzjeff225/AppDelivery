const addressRepository = require('../../infrastructure/repositories/address.repository');

/**
 * Caso de Uso: Obtener Direcciones del Usuario
 * Recupera todas las direcciones pertenecientes a un cliente.
 */
class GetUserAddressesUseCase {
  async execute(userId) {
    if (!userId) {
      throw new Error('El ID de usuario es obligatorio para consultar direcciones.');
    }
    return await addressRepository.findByUserId(userId);
  }
}

module.exports = new GetUserAddressesUseCase();
