import { useState } from 'react';
import { useAddresses } from '../hooks/useAddresses';
import { useCart } from '../../cart/hooks/use-cart';
import { useSileoNotification } from '../../../context/SileoNotificationContext';
import { useNavigate, Link } from 'react-router-dom';
import { CleanModal } from '../../../components/CleanModal';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { addresses, selectedAddress, selectAddress } = useAddresses();
  const { cartItems, removeFromCart, updateQuantity, clearCart, subtotal, shippingFee, total, itemCount } = useCart();
  const { showSuccess, showError } = useSileoNotification();

  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const activeAddress = selectedAddress || addresses.find((a) => a.isDefault || a.is_default) || addresses[0];

  const handlePlaceOrder = () => {
    if (!activeAddress) {
      showError('Por favor selecciona o registra una dirección de entrega.', 'Dirección Requerida 📍');
      setIsSelectModalOpen(true);
      return;
    }

    if (cartItems.length === 0) {
      showError('Tu carrito de compras está vacío.', 'Carrito Vacío 🛒');
      return;
    }

    setOrderSuccess(true);
    clearCart();
    showSuccess('¡Tu pedido ha sido procesado exitosamente!', 'Pedido Confirmado 🎉');
  };

  if (orderSuccess) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 16px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '40px', textAlign: 'center', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: '#ecfdf5', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', fontSize: '2.5rem' }}>
            🎉
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#064e3b', marginBottom: '12px' }}>
            ¡Pedido Realizado con Éxito!
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6', marginBottom: '24px' }}>
            Tu pedido está siendo preparado y será entregado a: <br />
            <strong style={{ color: '#0f172a' }}>{activeAddress?.addressLine1 || activeAddress?.address_line1}, {activeAddress?.city}</strong>
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link
              to="/catalog"
              style={{
                padding: '12px 28px',
                backgroundColor: '#064e3b',
                color: '#ffffff',
                borderRadius: '999px',
                fontWeight: '700',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(6, 78, 59, 0.3)'
              }}
            >
              Volver al Catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', pb: '40px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
            Resumen del Pedido & Checkout
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Confirma tus productos y dirección de envío para completar el pedido.
          </p>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#ecfdf5', color: '#047857', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '700' }}>
          🔒 Pago Seguro y Garantizado
        </div>
      </div>

      {/* 2 Columns Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Left Column: Address + Cart Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Delivery Address Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '20px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', color: '#0f172a', fontSize: '1rem' }}>
                <span style={{ fontSize: '1.2rem' }}>📍</span> Dirección de Entrega
              </div>
              <button
                onClick={() => setIsSelectModalOpen(true)}
                style={{ border: 'none', background: 'none', color: '#10b981', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                {activeAddress ? 'Cambiar ›' : '+ Seleccionar'}
              </button>
            </div>

            {activeAddress ? (
              <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '14px 16px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>
                    {activeAddress.title || 'Ubicación de Envío'}
                  </div>
                  {(activeAddress.isDefault || activeAddress.is_default) && (
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', backgroundColor: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '999px' }}>
                      Predeterminada
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>
                  👤 <strong>{activeAddress.receiverName || activeAddress.full_name || 'Destinatario'}</strong> ({activeAddress.receiverPhone || activeAddress.phone || 'Teléfono'})
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {activeAddress.addressLine1 || activeAddress.address_line1}
                  {(activeAddress.addressLine2 || activeAddress.address_line2) && `, ${activeAddress.addressLine2 || activeAddress.address_line2}`}, {activeAddress.city}, {activeAddress.state}
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsSelectModalOpen(true)}
                style={{ padding: '20px', textTransform: 'center', textAlign: 'center', backgroundColor: '#fff1f2', borderRadius: '12px', border: '1px dashed #f43f5e', cursor: 'pointer' }}
              >
                <div style={{ color: '#e11d48', fontWeight: '700', fontSize: '0.9rem', marginBottom: '4px' }}>
                  ⚠️ No tienes ninguna dirección seleccionada
                </div>
                <div style={{ color: '#9f1239', fontSize: '0.8rem' }}>
                  Haz clic aquí para agregar o seleccionar una ubicación de envío.
                </div>
              </div>
            )}
          </div>

          {/* Cart Items Card */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                🛍️ Artículos en tu Carrito ({itemCount})
              </h3>
              <Link to="/catalog" style={{ fontSize: '0.85rem', fontWeight: '700', color: '#10b981', textDecoration: 'none' }}>
                + Agregar Productos
              </Link>
            </div>

            {cartItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
                <span style={{ fontSize: '2.5rem' }}>🛒</span>
                <p style={{ marginTop: '12px', marginBottom: '16px', fontWeight: '600' }}>Tu carrito está vacío.</p>
                <Link
                  to="/catalog"
                  style={{
                    padding: '8px 20px',
                    backgroundColor: '#064e3b',
                    color: '#ffffff',
                    borderRadius: '999px',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    textDecoration: 'none'
                  }}
                >
                  Explorar Catálogo
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      paddingBottom: '16px',
                      borderBottom: '1px solid #f1f5f9'
                    }}
                  >
                    <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                      {item.image_path ? (
                        <img
                          src={`http://localhost:4000/uploads/${item.image_path}`}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                          📦
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>${Number(item.price).toFixed(2)} c/u</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', fontWeight: '700' }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', fontWeight: '700' }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', marginTop: '4px' }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div>
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              position: 'sticky',
              top: '24px'
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 20px 0' }}>
              Resumen del Pago
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem', color: '#475569' }}>
              <span>Subtotal productos:</span>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>${subtotal.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.9rem', color: '#475569' }}>
              <span>Costo de envío:</span>
              <span style={{ fontWeight: '700', color: shippingFee === 0 ? '#047857' : '#0f172a' }}>
                {shippingFee === 0 ? '¡GRATIS!' : `$${shippingFee.toFixed(2)}`}
              </span>
            </div>

            <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '16px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'baseline' }}>
              <span style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>Total a Pagar:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#064e3b' }}>
                ${total.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={cartItems.length === 0}
              style={{
                width: '100%',
                padding: '14px 20px',
                backgroundColor: cartItems.length === 0 ? '#94a3b8' : '#064e3b',
                color: '#ffffff',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '1rem',
                border: 'none',
                cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer',
                boxShadow: cartItems.length === 0 ? 'none' : '0 4px 14px rgba(6, 78, 59, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              Confirmar y Realizar Pedido (${total.toFixed(2)})
            </button>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚡</span> Entrega estimada en 25 - 35 minutos
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🛡️</span> Garantía de satisfacción y entrega garantizada
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Modal para Seleccionar Dirección */}
      <CleanModal
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
        title="Seleccionar Dirección de Entrega"
        subtitle="Elige la ubicación donde deseas recibir tu pedido o agrega una nueva."
        icon="📍"
        maxWidth="560px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {addresses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
              No tienes direcciones guardadas.
            </div>
          ) : (
            addresses.map((addr) => {
              const isSelected = activeAddress?.id === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => {
                    selectAddress(addr);
                    setIsSelectModalOpen(false);
                  }}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #10b981' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>
                      📍 {addr.title || 'Dirección'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
                      {addr.receiverName || addr.full_name} ({addr.receiverPhone || addr.phone})
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      {addr.addressLine1 || addr.address_line1}, {addr.city}, {addr.state}
                    </div>
                  </div>
                  {isSelected && (
                    <span style={{ fontSize: '1.2rem', color: '#10b981' }}>✓</span>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          <Link
            to="/addresses"
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              backgroundColor: '#f1f5f9',
              color: '#064e3b',
              fontWeight: '700',
              fontSize: '0.85rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            + Gestionar / Nueva Dirección
          </Link>
          <button
            onClick={() => setIsSelectModalOpen(false)}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#064e3b',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Listo
          </button>
        </div>
      </CleanModal>
    </div>
  );
}
