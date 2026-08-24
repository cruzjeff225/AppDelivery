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
   * Helper para obtener el userId (del token JWT req.user.id o header x-user-id o fallback 1)
   */
  __getUserId(req) {
    if (req.user && req.user.id) {
      return req.user.id;
    }

    const headerUserId = req.headers['x-user-id'] || req.query.userId;
    if (headerUserId) {
      return parseInt(headerUserId, 10);
    }

    return 1;
  }

  /**
   * POST /api/addresses
   */
  async create(req, res) {
    try {
      const userId = this.__getUserId(req);

      const addressData = {
        userId,
        title: req.body.title || `${req.body.city || ''}, ${req.body.state || ''}`,
        addressLine1: req.body.addressLine1 || req.body.address_line1,
        addressLine2: req.body.addressLine2 || req.body.address_line2 || null,
        city: req.body.city,
        state: req.body.state,
        postalCode: req.body.postalCode || req.body.postal_code || null,
        country: req.body.country || 'El Salvador',
        latitude: req.body.latitude || null,
        longitude: req.body.longitude || null,
        isDefault: req.body.isDefault || req.body.is_default || false,
        receiverName: req.body.receiverName || req.body.full_name,
        receiverPhone: req.body.receiverPhone || req.body.phone
      };

      const newAddress = await createAddressUseCase.execute(addressData);
      return res.status(201).json({
        status: 'success',
        message: 'Dirección creada exitosamente',
        data: newAddress
      });
    } catch (error) {
      console.error('Error creando dirección:', error);
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
      const addresses = await getUserAddressesUseCase.execute(userId);
      return res.status(200).json({
        status: 'success',
        data: addresses
      });
    } catch (error) {
      console.error('Error al obtener direcciones:', error);
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  /**
   * PUT /api/addresses/:id
   */
  async update(req, res) {
    try {
      const userId = this.__getUserId(req);
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
