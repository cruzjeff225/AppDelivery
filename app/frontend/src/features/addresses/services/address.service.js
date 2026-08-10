import api from '../../../services/api';

/**
 * Servicio para manejar direcciones del cliente
 */
export const addressService = {
  /**
   * Obtener direcciones del usuario
   */
  async getAddresses() {
    const response = await api.get('/addresses');
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.data?.data)) return response.data.data;
    return [];
  },

  /**
   * Crear dirección
   */
  async createAddress(addressData) {
    const response = await api.post('/addresses', addressData);
    return response.data?.data || response.data;
  },

  /**
   * Actualizar dirección
   */
  async updateAddress(id, addressData) {
    const response = await api.put(`/addresses/${id}`, addressData);
    return response.data?.data || response.data;
  },

  /**
   * Marcar predeterminada
   */
  async setDefaultAddress(id) {
    const response = await api.patch(`/addresses/${id}/default`);
    return response.data?.data || response.data;
  },

  /**
   * Eliminar dirección
   */
  async deleteAddress(id) {
    const response = await api.delete(`/addresses/${id}`);
    return response.data?.data || response.data;
  }
};