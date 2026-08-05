const addressRepository = require('../../infrastructure/repositories/address.repository');

/**
 * Caso de Uso: Actualizar Dirección
 * Permite modificar los datos de una dirección asegurándose de que pertenezca al usuario solicitante.
 */
class UpdateAddressUseCase {
  async execute(addressId, userId, updateData) {
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

    const updatedAddress = await addressRepository.update(addressId, userId, updateData);
    return updatedAddress;
  }
}

module.exports = new UpdateAddressUseCase();
