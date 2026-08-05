import { useState, useEffect, useCallback } from 'react';
import { addressService } from '../services/address.service';

/**
 * Custom Hook para administrar la lógica de estado de Direcciones del Cliente
 */
export function useAddresses() {

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);


  const showNotification = (msg, type = 'success') => {
    setNotification({
      message: msg,
      type
    });

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

      // addressService ya devuelve el arreglo limpio
      setAddresses(data || []);

    } catch (err) {

      console.error('Error al cargar direcciones:', err);

      setError(
        err.response?.data?.message ||
        'Error al conectar con el servidor.'
      );

    } finally {

      setLoading(false);

    }

  }, []);



  useEffect(() => {

    fetchAddresses();

  }, [fetchAddresses]);



  /**
   * Crear dirección
   */
  /**
 * Crear dirección
 */
const addAddress = async (data) => {

  try {

    console.log("Datos enviados al servicio:", data);


    const response = await addressService.createAddress(data);


    console.log("Respuesta del backend:", response);


    showNotification(
      '¡Dirección agregada correctamente!'
    );


    await fetchAddresses();


    return {
      success: true,
      data: response
    };


  } catch (err) {


    console.error(
      "ERROR COMPLETO AL GUARDAR DIRECCIÓN:",
      err
    );


    console.error(
      "RESPUESTA BACKEND:",
      err.response?.data
    );


    const msg =
      err.response?.data?.message ||
      err.response?.data?.errors?.join(', ') ||
      err.message ||
      'No se pudo guardar la dirección.';



    showNotification(
      msg,
      'danger'
    );


    return {
      success: false,
      error: msg
    };

  }

};
  /**
   * Editar dirección
   */
  const editAddress = async (id, data) => {

    try {

      const response = await addressService.updateAddress(
        id,
        data
      );


      showNotification(
        'Dirección actualizada con éxito'
      );


      // Recarga datos actualizados
      await fetchAddresses();



      return {
        success: true,
        data: response
      };


    } catch (err) {


      const msg =
        err.response?.data?.message ||
        'Error al actualizar dirección.';



      showNotification(
        msg,
        'danger'
      );


      return {
        success: false,
        error: msg
      };

    }

  };





  /**
   * Cambiar dirección predeterminada
   */
  const makeDefault = async (id) => {

    try {


      await addressService.setDefaultAddress(id);



      showNotification(
        'Dirección establecida como predeterminada ⭐'
      );



      await fetchAddresses();



    } catch (err) {


      const msg =
        err.response?.data?.message ||
        'Error al actualizar dirección predeterminada.';



      showNotification(
        msg,
        'danger'
      );


    }

  };





  /**
   * Eliminar dirección
   */
  const removeAddress = async (id) => {

    try {


      await addressService.deleteAddress(id);



      showNotification(
        'Dirección eliminada'
      );



      await fetchAddresses();



    } catch (err) {


      const msg =
        err.response?.data?.message ||
        'Error al eliminar dirección.';



      showNotification(
        msg,
        'danger'
      );


    }

  };





  return {

    addresses,

    loading,

    error,

    notification,

    fetchAddresses,

    addAddress,

    editAddress,

    makeDefault,

    removeAddress

  };

}