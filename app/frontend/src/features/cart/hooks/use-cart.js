import api from '../../../services/api';

/**
 * Convierte datos del backend (snake_case)
 * al formato que usa React (camelCase)
 */
function mapAddressFromBackend(address) {
  return {
    id: address.id,
    title: address.title,
    addressLine1: address.address_line1,
    addressLine2: address.address_line2,
    city: address.city,
    state: address.state,
    postalCode: address.postal_code,
    country: address.country,
    isDefault: address.is_default
  };
}


/**
 * Convierte datos del frontend (camelCase)
 * al formato que espera el backend
 */
function mapAddressToBackend(address) {
  return {
    title: address.title,
    address_line1: address.addressLine1,
    address_line2: address.addressLine2,
    city: address.city,
    state: address.state,
    postal_code: address.postalCode,
    country: address.country
  };
}



/**
 * Servicio del Frontend para el CRUD de Direcciones
 */
export const addressService = {


  /**
   * Obtiene la lista de direcciones del usuario
   */
  async getAddresses() {

    const response = await api.get('/addresses');

    return response.data.map(mapAddressFromBackend);
  },


  /**
   * Crea una nueva dirección
   */
  async createAddress(addressData) {

    const response = await api.post(
      '/addresses',
      mapAddressToBackend(addressData)
    );

    return mapAddressFromBackend(response.data);
  },


  /**
   * Actualiza una dirección existente por ID
   */
  async updateAddress(id, addressData) {

    const response = await api.put(
      `/addresses/${id}`,
      mapAddressToBackend(addressData)
    );

    return mapAddressFromBackend(response.data);
  },


  /**
   * Marca una dirección como predeterminada
   */
  async setDefaultAddress(id) {

    const response = await api.patch(
      `/addresses/${id}/default`
    );

    return mapAddressFromBackend(response.data);
  },


  /**
   * Elimina una dirección por ID
   */
  async deleteAddress(id) {

    const response = await api.delete(
      `/addresses/${id}`
    );

    return response.data;
  }

};