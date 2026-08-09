import React, { useState } from 'react';
import { useAddresses } from '../hooks/useAddresses';
import { AddressFormModal } from '../components/AddressFormModal';
import { AddressDrawerModal } from '../components/AddressDrawerModal';


/**
 * Página principal de gestión de direcciones
 */
export function AddressManagementPage() {

  const {
    addresses,
    notification,
    addAddress,
    editAddress,
    removeAddress,
  } = useAddresses();


  const [activeTab, setActiveTab] = useState('create');
  const [selectedAddress, setSelectedAddress] = useState(null);



  /**
   * Guardar dirección nueva o editar existente
   */
  const handleSubmit = async (formData) => {

    console.log("Datos enviados desde formulario:", formData);


    if (selectedAddress) {

      return await editAddress(
        selectedAddress.id,
        formData
      );

    }


    return await addAddress(formData);

  };



  /**
   * Eliminar dirección
   */
  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      '¿Deseas eliminar esta dirección?'
    );


    if (confirmDelete) {

      await removeAddress(id);

    }

  };



  return (

    <div className="bg-light min-vh-100 pb-5">


      {
        notification && (

          <div
            className={`alert alert-${notification.type} position-fixed top-0 end-0 m-3 shadow`}
            style={{
              zIndex:2000
            }}
          >

            {notification.message}

          </div>

        )

      }



      {/* Formulario crear */}
      {
        activeTab === 'create' && (

          <AddressFormModal

            isOpen={true}

            onClose={() => {
              setActiveTab('drawer');
              setSelectedAddress(null);
            }}

            onSubmit={handleSubmit}

            addressToEdit={null}

          />

        )

      }



      {/* Formulario editar */}
      {
        activeTab === 'edit' && selectedAddress && (

          <AddressFormModal

            isOpen={true}

            onClose={() => {

              setActiveTab('drawer');
              setSelectedAddress(null);

            }}

            onSubmit={handleSubmit}

            addressToEdit={selectedAddress}

          />

        )

      }




      {/* Lista de direcciones */}
      {
        activeTab === 'drawer' && (

          <AddressDrawerModal

            isOpen={true}

            onClose={() => setActiveTab('create')}

            addresses={addresses}

            selectedAddressId={
              selectedAddress?.id
            }


            onSelectAddress={(address)=>{

              setSelectedAddress(address);

            }}


            onOpenCreate={()=>{

              setSelectedAddress(null);
              setActiveTab('create');

            }}



            onOpenEdit={(address)=>{

              setSelectedAddress(address);
              setActiveTab('edit');

            }}



            onDeleteAddress={handleDelete}

          />

        )

      }


    </div>

  );

}