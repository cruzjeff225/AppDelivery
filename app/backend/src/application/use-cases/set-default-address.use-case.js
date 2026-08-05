const addressRepository = require('../../infrastructure/repositories/address.repository');

/**
 * Caso de Uso: Establecer Dirección Predeterminada
 * Garantiza que la dirección pertenezca al usuario y llama al repositorio para ejecutar el cambio atómico.
 */
class SetDefaultAddressUseCase {
  async execute(addressId, userId) {
    if (!addressId || !userId) {
      throw new Error('ID de dirección y ID de usuario son obligatorios.');
    }

    const existingAddress = await addressRepository.findById(addressId);
    if (!existingAddress) {
      throw new Error('La dirección especificada no existe.');
    }

    if (existingAddress.userId !== parseInt(userId, 10)) {
      throw new Error('No tienes permisos para modificar esta dirección.');
    }

    return await addressRepository.setDefaultAddress(userId, addressId);
  }
}

module.exports = new SetDefaultAddressUseCase();
