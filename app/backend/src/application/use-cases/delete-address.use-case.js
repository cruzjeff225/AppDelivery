const addressRepository = require('../../infrastructure/repositories/address.repository');

/**
 * Caso de Uso: Eliminar Dirección
 * Elimina la dirección verificando propiedad. Si era la predeterminada y quedan otras, asigna una nueva predeterminada.
 */
class DeleteAddressUseCase {
  async execute(addressId, userId) {
    if (!addressId || !userId) {
      throw new Error('ID de dirección y ID de usuario son obligatorios.');
    }

    const existingAddress = await addressRepository.findById(addressId);
    if (!existingAddress) {
      throw new Error('La dirección a eliminar no existe.');
    }

    if (existingAddress.userId !== parseInt(userId, 10)) {
      throw new Error('No tienes permisos para eliminar esta dirección.');
    }

    const deletedAddress = await addressRepository.delete(addressId, userId);

    // Regla de Negocio: Si eliminó la dirección predeterminada, reasignar predeterminada a la más reciente que quede
    if (existingAddress.isDefault) {
      const remaining = await addressRepository.findByUserId(userId);
      if (remaining.length > 0) {
        await addressRepository.setDefaultAddress(userId, remaining[0].id);
      }
    }

    return deletedAddress;
  }
}

module.exports = new DeleteAddressUseCase();
