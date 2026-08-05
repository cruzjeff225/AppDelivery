import React, { useState } from 'react';
import { HeaderBar } from '../components/HeaderBar';
import { GuaranteeBanner } from '../components/GuaranteeBanner';
import { AddressDrawerModal } from '../components/AddressDrawerModal';
import { AddressFormModal } from '../components/AddressFormModal';

export function CheckoutPage({
  addresses = [],
  selectedAddress,
  onSelectAddress,
  onAddAddress,
  onEditAddress,
  onDeleteAddress,
  onBack
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState(null);

  // Dirección activa actual (la seleccionada o la predeterminada o la primera)
  const activeAddress = selectedAddress || addresses.find(a => a.isDefault) || addresses[0] || {
    id: 1,
    fullName: 'Gracia Soriano',
    phone: '+503 6959 8212',
    addressLine1: 'Col.el guarumal pje c casa#9',
    addressLine2: 'Parqueo',
    city: 'Santiago De María',
    state: 'Usulutan',
    postalCode: '3424',
    country: 'El Salvador',
    isDefault: true
  };

  const handleOpenCreateForm = () => {
    setAddressToEdit(null);
    setIsDrawerOpen(false);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (addr) => {
    setAddressToEdit(addr);
    setIsDrawerOpen(false);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    let res;
    if (addressToEdit) {
      res = await onEditAddress(addressToEdit.id, formData);
    } else {
      res = await onAddAddress(formData);
    }
    setIsFormOpen(false);
    return res;
  };

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* Header Bar */}
      <HeaderBar
        title="Pagar (75)"
        onBack={onBack}
        showSecurity={false}
      />

      {/* Top Green Notification Banner */}
      <GuaranteeBanner
        text1="Envío gratis para ti"
        text2="$1.00 de crédito por retraso"
      />

      {/* Main Checkout Container */}
      <div className="container py-3 px-3 max-w-lg mx-auto" style={{ maxWidth: '600px' }}>
        
        {/* Address Selection Card */}
        <div
          className="bg-white rounded-3 shadow-sm border-0 mb-3 position-relative overflow-hidden cursor-pointer"
          onClick={() => setIsDrawerOpen(true)}
          style={{ cursor: 'pointer' }}
        >
          <div className="p-3">
            <div className="d-flex align-items-start gap-2">
              <span className="fs-5 mt-1 text-dark">📍</span>
              <div className="flex-grow-1">
                <div className="fw-bold fs-6 text-dark d-flex align-items-center justify-content-between">
                  <span>
                    {activeAddress.fullName || 'Gracia Soriano'} &nbsp; {activeAddress.phone || '+503 6959 8212'}
                  </span>
                  <span className="text-muted fs-5">›</span>
                </div>
                <div className="text-secondary small mt-1" style={{ lineHeight: '1.4' }}>
                  {activeAddress.addressLine1}
                  {activeAddress.addressLine2 ? `, ${activeAddress.addressLine2}` : ''},{' '}
                  {activeAddress.city}, {activeAddress.state} {activeAddress.postalCode || ''},{' '}
                  {activeAddress.country || 'El Salvador'}
                </div>
                <div className="mt-2 text-success small fw-semibold d-flex align-items-center gap-1">
                  <span>🚚</span> Envío a domicilio gratis, obtén un crédito de $1 por entrega tardía.
                </div>
              </div>
            </div>
          </div>
          
          {/* Parcel Strip Bottom Border */}
          <div className="parcel-stripe-bottom" />
        </div>

        {/* Article Details Section */}
        <div className="bg-white rounded-3 p-3 shadow-sm mb-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold mb-0 text-dark">Detalles del artículo (75)</h6>
            <span className="text-muted small">Ver detalles ›</span>
          </div>

          {/* Grid of sample order items */}
          <div className="d-flex gap-2 overflow-auto pb-2">
            
            {/* Item 1 */}
            <div className="position-relative text-center flex-shrink-0" style={{ width: '90px' }}>
              <div className="position-relative bg-light rounded-2 overflow-hidden mb-1" style={{ height: '90px' }}>
                <span className="position-absolute top-0 start-0 bg-danger text-white px-1 font-bold" style={{ fontSize: '10px', borderRadius: '0 0 4px 0' }}>-40%</span>
                <img src="https://picsum.photos/seed/dress/120/120" alt="Item" className="w-100 h-100 object-fit-cover" />
                <span className="position-absolute bottom-0 start-0 w-100 bg-dark text-white py-1" style={{ fontSize: '9px', opacity: 0.85 }}>CASI AGOTADO</span>
              </div>
              <div className="fw-bold text-dark small">$3.10 <del className="text-muted font-normal" style={{ fontSize: '10px' }}>$5.24</del></div>
            </div>

            {/* Item 2 */}
            <div className="position-relative text-center flex-shrink-0" style={{ width: '90px' }}>
              <div className="position-relative bg-light rounded-2 overflow-hidden mb-1" style={{ height: '90px' }}>
                <img src="https://picsum.photos/seed/fashion/120/120" alt="Item" className="w-100 h-100 object-fit-cover" />
                <span className="position-absolute bottom-0 start-0 w-100 bg-dark text-white py-1" style={{ fontSize: '9px', opacity: 0.85 }}>CASI AGOTADO(S)</span>
              </div>
              <div className="fw-bold text-dark small">$18.31 <del className="text-muted font-normal" style={{ fontSize: '10px' }}>$34.10</del></div>
            </div>

            {/* Item 3 */}
            <div className="position-relative text-center flex-shrink-0" style={{ width: '90px' }}>
              <div className="position-relative bg-light rounded-2 overflow-hidden mb-1" style={{ height: '90px' }}>
                <img src="https://picsum.photos/seed/organizer/120/120" alt="Item" className="w-100 h-100 object-fit-cover" />
                <span className="position-absolute bottom-0 start-0 w-100 bg-dark text-white py-1" style={{ fontSize: '9px', opacity: 0.75 }}>$0.48 más barato</span>
              </div>
              <div className="fw-bold text-dark small">$31.37 <del className="text-muted font-normal" style={{ fontSize: '10px' }}>$42.31</del></div>
            </div>

            {/* Item 4 */}
            <div className="position-relative text-center flex-shrink-0" style={{ width: '90px' }}>
              <div className="position-relative bg-light rounded-2 overflow-hidden mb-1" style={{ height: '90px' }}>
                <img src="https://picsum.photos/seed/giftbox/120/120" alt="Item" className="w-100 h-100 object-fit-cover" />
              </div>
              <div className="fw-bold text-dark small">$8.87 <del className="text-muted font-normal" style={{ fontSize: '10px' }}>$15.29</del></div>
            </div>

          </div>

          <div className="mt-3 pt-2 border-top text-secondary small d-flex align-items-center gap-1 cursor-pointer">
            <span>🎁</span> Agregar gratis una tarjeta de mensaje de regalo ›
          </div>
        </div>

        {/* Order limit alert */}
        <div className="alert alert-warning border-0 text-dark small p-3 rounded-3 shadow-sm d-flex align-items-start gap-2">
          <span className="fs-6">⚠️</span>
          <div>
            <strong>Actualmente, el límite para un solo pedido es de $300.00.</strong> Mueve los siguientes artículos a tu carrito para continuar.
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="btn-app-orange"
          >
            Cambiar Dirección de Entrega
          </button>
        </div>

      </div>

      {/* Address Drawer Modal */}
      <AddressDrawerModal
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        addresses={addresses}
        selectedAddressId={activeAddress.id}
        onSelectAddress={(addr) => {
          onSelectAddress(addr);
          setIsDrawerOpen(false);
        }}
        onOpenCreate={handleOpenCreateForm}
        onOpenEdit={handleOpenEditForm}
        onDeleteAddress={onDeleteAddress}
      />

      {/* Address Form Screen / Modal */}
      <AddressFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        addressToEdit={addressToEdit}
      />

    </div>
  );
}
