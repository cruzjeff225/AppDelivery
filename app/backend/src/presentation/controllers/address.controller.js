const createAddressUseCase = require('../../application/use-cases/create-address.use-case');
const getUserAddressesUseCase = require('../../application/use-cases/get-user-addresses.use-case');
const updateAddressUseCase = require('../../application/use-cases/update-address.use-case');
const setDefaultAddressUseCase = require('../../application/use-cases/set-default-address.use-case');
const deleteAddressUseCase = require('../../application/use-cases/delete-address.use-case');

/**
 * Controlador de Presentación para Direcciones.
 * Traduce peticiones HTTP (req, res) a invocaciones de Casos de Uso.
 */
class AddressController {

  /**
   * Helper para obtener el userId (del token JWT req.user.id o header x-user-id como fallback)
   */
  __getUserId(req) {
  console.log("=== HEADERS ===");
  console.log(req.headers);

  console.log("=== USER ===");
  console.log(req.user);

  if (req.user && req.user.id) {
    return req.user.id;
  }

  const headerUserId = req.headers['x-user-id'] || req.query.userId;

  console.log("=== USER ID DEL HEADER ===");
  console.log(headerUserId);

  if (headerUserId) {
    return parseInt(headerUserId, 10);
  }

  return null;
}

  /**
   * POST /api/addresses
   */
  async create(req, res) {
    try {
      const userId = this.__getUserId(req);
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'Usuario no autenticado (userId ausente).' });
      }

     const addressData = {
  userId,
  title: req.body.title,
  addressLine1: req.body.addressLine1,
  addressLine2: req.body.addressLine2,
  city: req.body.city,
  state: req.body.state,
  postalCode: req.body.postalCode,
  country: req.body.country,
  latitude: req.body.latitude,
  longitude: req.body.longitude,
  isDefault: req.body.isDefault,

  receiverName: req.body.receiverName,
  receiverPhone: req.body.receiverPhone
};
      console.log("DATOS RECIBIDOS DEL FRONTEND:");
console.log(req.body);

console.log("DATOS QUE SE ENVIAN AL CASO DE USO:");
console.log(addressData);

      const newAddress = await createAddressUseCase.execute(addressData);
      return res.status(201).json({
        status: 'success',
        message: 'Dirección creada exitosamente',
        data: newAddress
      });
    } catch (error) {

  console.error("ERROR CREANDO DIRECCIÓN:");
  console.error(error);

  return res.status(400).json({
    status: 'error',
    message: error.message
  });

}
  }

  /**
   * GET /api/addresses
   */
  async getMyAddresses(req, res) {
    try {
      const userId = this.__getUserId(req);
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'Usuario no autenticado (userId ausente).' });
      }

      const addresses = await getUserAddressesUseCase.execute(userId);
      return res.status(200).json({
        status: 'success',
        data: addresses
      });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  /**
   * PUT /api/addresses/:id
   */
  async update(req, res) {
    try {
      const userId = this.__getUserId(req);
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'Usuario no autenticado.' });
      }

      const addressId = parseInt(req.params.id, 10);
      const updated = await updateAddressUseCase.execute(addressId, userId, req.body);

      return res.status(200).json({
        status: 'success',
        message: 'Dirección actualizada correctamente',
        data: updated
      });
    } catch (error) {
      return res.status(400).json({ status: 'error', message: error.message });
    }
  }

  /**
   * PATCH /api/addresses/:id/default
   */
  async setDefault(req, res) {
    try {
      const userId = this.__getUserId(req);
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'Usuario no autenticado.' });
      }

      const addressId = parseInt(req.params.id, 10);
      const defaultAddress = await setDefaultAddressUseCase.execute(addressId, userId);

      return res.status(200).json({
        status: 'success',
        message: 'Dirección establecida como predeterminada',
        data: defaultAddress
      });
    } catch (error) {
      return res.status(400).json({ status: 'error', message: error.message });
    }
  }

  /**
   * DELETE /api/addresses/:id
   */
  async delete(req, res) {
    try {
      const userId = this.__getUserId(req);
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'Usuario no autenticado.' });
      }

      const addressId = parseInt(req.params.id, 10);
      const deleted = await deleteAddressUseCase.execute(addressId, userId);

      return res.status(200).json({
        status: 'success',
        message: 'Dirección eliminada correctamente',
        data: deleted
      });
    } catch (error) {
      return res.status(400).json({ status: 'error', message: error.message });
    }
  }
}

module.exports = new AddressController();
