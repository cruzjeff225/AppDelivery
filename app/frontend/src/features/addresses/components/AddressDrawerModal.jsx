import React from 'react';

/**
 * Componente AddressDrawerModal: Bottom Sheet Drawer para seleccionar o gestionar direcciones en checkout
 */
export function AddressDrawerModal({
  isOpen,
  onClose,
  addresses = [],
  selectedAddressId,
  onSelectAddress,
  onOpenCreate,
  onOpenEdit,
  onDeleteAddress,
}) {
  if (!isOpen) return null;

  const handleCopyAddress = (address) => {
    const fullText = `${address.receiverName || ''} (${address.receiverPhone || ''}), ${address.addressLine1}, ${address.addressLine2 || ''}, ${address.city}, ${address.state} ${address.postalCode || ''}, ${address.country || 'El Salvador'}`;
    navigator.clipboard.writeText(fullText);
    alert('Dirección copiada al portapapeles 📋');
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header Drawer */}
        <div className="drawer-header">
          <div className="drawer-handle" />
          <h2 className="drawer-title">Direcciones</h2>
          <button onClick={onClose} className="drawer-close-btn" aria-label="Cerrar">
            ✕
          </button>
        </div>

        
        {/* Body list of addresses */}
        <div className="drawer-body">
          {addresses.length === 0 ? (
            <div className="text-center py-4 text-muted">
              No tienes direcciones guardadas aún.
            </div>
          ) : (
            addresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id || (addr.isDefault && !selectedAddressId);
              
              return (
                <div
                  key={addr.id}
                  className={`saved-address-card ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => onSelectAddress && onSelectAddress(addr)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Left Column: Address Content */}
                  <div className="flex-grow-1">
                    <div className="address-details-name">
                    {addr.receiverName || 'Sin nombre'} &nbsp; {addr.receiverPhone || 'Sin teléfono'}
                   </div>

                    <div className="address-details-text">
                      {addr.addressLine1} {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city}, {addr.state} {addr.postalCode || ''}, {addr.country || 'El Salvador'}
                    </div>

                    {addr.isDefault && (
                      <div className="address-default-dot mb-1">
                        <span className="dot-active">●</span> Predeterminado
                      </div>
                    )}

                    {/* Action links */}
                    <div className="address-actions-links" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="address-action-btn"
                        onClick={() => onDeleteAddress && onDeleteAddress(addr.id)}
                      >
                        Eliminar
                      </button>
                      <span className="text-muted">|</span>
                      <button
                        className="address-action-btn"
                        onClick={() => handleCopyAddress(addr)}
                      >
                        Copiar
                      </button>
                      <span className="text-muted">|</span>
                      <button
                        className="address-action-btn"
                        onClick={() => onOpenEdit && onOpenEdit(addr)}
                      >
                        Editar
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Checkmark for selection */}
                  {isSelected && (
                    <div className="address-check-icon d-flex align-items-center">
                      ✓
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Sticky Drawer Bottom Footer */}
        <div className="app-sticky-footer" style={{ borderTop: '1px solid #EEEEEE' }}>
          <button
            onClick={onOpenCreate}
            className="btn-app-orange:hover"
          >
            Agregar una nueva dirección
          </button>
        </div>

      </div>
    </div>
  );
}
