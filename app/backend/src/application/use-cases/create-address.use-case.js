const Address = require('../../domain/entities/Address');
const addressRepository = require('../../infrastructure/repositories/address.repository');

/**
 * Caso de Uso: Crear Dirección
 * Orquesta la creación de una dirección para el usuario.
 * Si es la primera dirección registrada, se marca automáticamente como predeterminada.
 */
class CreateAddressUseCase {
  async execute(addressData) {
    // 1. Instanciar la Entidad de Dominio para ejecutar reglas de negocio básicas
    const addressEntity = new Address(addressData);

    // 2. Verificar cuántas direcciones tiene el usuario
    const count = await addressRepository.countByUserId(addressEntity.userId);

    // 3. Regla de Negocio: Si es su primera dirección, marcarla automáticamente como predeterminada
    if (count === 0) {
      addressEntity.markAsDefault();
    }

    // 4. Guardar en repositorio
    const savedAddress = await addressRepository.create(addressEntity);
    return savedAddress;
  }
}

module.exports = new CreateAddressUseCase();
