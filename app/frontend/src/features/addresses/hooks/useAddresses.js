import { useState, useEffect, useCallback } from 'react';
import { addressService } from '../services/address.service';

/**
 * Custom Hook para administrar la lógica de estado de Direcciones del Cliente
 */
export function useAddresses() {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  /**
   * Cargar direcciones del usuario
   */
  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await addressService.getAddresses();
      setAddresses(data || []);
      if (data && data.length > 0) {
        const defaultAddr = data.find(a => a.isDefault || a.is_default) || data[0];
        setSelectedAddress(defaultAddr);
      } else {
        setSelectedAddress(null);
      }
    } catch (err) {
      console.error('Error al cargar direcciones:', err);
      setError(err.response?.data?.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const addAddress = async (data) => {
    try {
      const response = await addressService.createAddress(data);
      showNotification('¡Dirección agregada correctamente!');
      await fetchAddresses();
      return { success: true, data: response };
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.join(', ') || err.message || 'No se pudo guardar la dirección.';
      showNotification(msg, 'danger');
      return { success: false, error: msg };
    }
  };

  const editAddress = async (id, data) => {
    try {
      const response = await addressService.updateAddress(id, data);
      showNotification('Dirección actualizada con éxito');
      await fetchAddresses();
      return { success: true, data: response };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al actualizar dirección.';
      showNotification(msg, 'danger');
      return { success: false, error: msg };
    }
  };

  const makeDefault = async (id) => {
    try {
      await addressService.setDefaultAddress(id);
      showNotification('Dirección establecida como predeterminada ⭐');
      await fetchAddresses();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al actualizar dirección predeterminada.';
      showNotification(msg, 'danger');
    }
  };

  const removeAddress = async (id) => {
    try {
      await addressService.deleteAddress(id);
      showNotification('Dirección eliminada');
      await fetchAddresses();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al eliminar dirección.';
      showNotification(msg, 'danger');
    }
  };

  return {
    addresses,
    selectedAddress,
    selectAddress: setSelectedAddress,
    loading,
    error,
    notification,
    fetchAddresses,
    addAddress,
    createAddress: addAddress,
    editAddress,
    updateAddress: editAddress,
    makeDefault,
    setDefaultAddress: makeDefault,
    removeAddress,
    deleteAddress: removeAddress
  };
}