import { createOrder } from '../../orders/order.service';
import { lineAmounts } from '../../cart/cart-math';
import { UPLOADS_URL } from '../../../config/api';
import { useAuth } from '../../auth/hooks/use-auth';
import { useRef, useState } from 'react';
import { useAddresses } from '../hooks/useAddresses';
import { useCart } from '../../cart/hooks/use-cart';
import { useSileoNotification } from '../../../context/SileoNotificationContext';
import { Link } from 'react-router-dom';
import { CleanModal } from '../../../components/CleanModal';
import {
  MapPin,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  Clock,
  CheckCircle,
  ChevronRight,
  AlertTriangle,
  Package,
} from 'lucide-react';

export default function CheckoutPage() {
  const { addresses, selectedAddress, selectAddress } = useAddresses();
  const { cartItems, removeFromCart, updateQuantity, clearCart, subtotal, tax, shippingFee, total, itemCount } = useCart();
  const { showSuccess, showError } = useSileoNotification();

  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const pending = useRef(false);
  const attempt = useRef(null);
  const { user } = useAuth();

  const activeAddress =
    selectedAddress ||
    addresses.find((a) => a.isDefault || a.is_default) ||
    addresses[0];

  const handlePlaceOrder = async () => {
    if (pending.current) return;
    if (!activeAddress) {
      showError(
        'Por favor selecciona o registra una dirección de entrega.',
        'Dirección Requerida'
      );
      setIsSelectModalOpen(true);
      return;
    }

    if (cartItems.length === 0) {
      showError('Tu carrito de compras está vacío.', 'Carrito Vacío');
      return;
    }

    pending.current = true;
    setSubmitting(true);
    const fingerprint = JSON.stringify({ userId: user?.id, address: activeAddress.id, items: cartItems.map(({ id, quantity }) => ({ id, quantity })).sort((a, b) => Number(a.id) - Number(b.id)) });
    const storageKey = 'app_delivery_checkout_' + user?.id;
    try {
      if (!attempt.current) {
        try { attempt.current = JSON.parse(sessionStorage.getItem(storageKey)); } catch { /* Storage is optional. */ }
      }
      if (attempt.current?.fingerprint !== fingerprint) {
        attempt.current = { fingerprint, key: crypto.randomUUID() };
      }
      try { sessionStorage.setItem(storageKey, JSON.stringify(attempt.current)); } catch { /* Keep the in-memory key. */ }
      const order = await createOrder(activeAddress.id, cartItems, attempt.current.key);
      setOrderSuccess(order);
      clearCart();
      attempt.current = null;
      try { sessionStorage.removeItem(storageKey); } catch { /* Storage is optional. */ }
      showSuccess('¡Tu pedido ha sido guardado exitosamente!', 'Pedido Confirmado');
    } catch (error) {
      showError(error.response?.data?.error || 'No se pudo confirmar el pedido. Reintenta; tu carrito se conserva.', 'Pedido no confirmado');
    } finally {
      pending.current = false;
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div style={{ maxWidth: '560px', margin: '40px auto', padding: '0 16px' }}>
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '44px 36px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              backgroundColor: '#ecfdf5',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
            }}
          >
            <CheckCircle size={36} color="#10b981" />
          </div>
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '12px',
              letterSpacing: '-0.02em',
            }}
          >
            ¡Pedido Realizado con Éxito!
          </h2>
          <p
            style={{
              fontSize: '0.9rem',
              color: '#475569',
              lineHeight: '1.6',
              marginBottom: '24px',
            }}
          >
            Pedido #{orderSuccess.id} · {orderSuccess.status} · Total: ${Number(orderSuccess.total).toFixed(2)}. Dirección de entrega:{' '}
            <br />
            <strong style={{ color: '#0f172a' }}>
              {orderSuccess.delivery_address.address_line1},{' '}
              {orderSuccess.delivery_address.city}
            </strong>
          </p>
          <Link
            to="/catalog"
            className="btn btn--primary btn--lg"
            style={{ display: 'inline-flex' }}
          >
            Volver al Catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h2 className="page-header__title">Resumen del Pedido & Checkout</h2>
          <p className="page-header__subtitle">
            Confirma tus productos y dirección de envío para completar el pedido.
          </p>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#ecfdf5',
            color: '#047857',
            borderRadius: '999px',
            fontSize: '0.825rem',
            fontWeight: 600,
          }}
        >
          <ShieldCheck size={14} /> Pago Seguro y Garantizado
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '22px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 700,
                  color: '#0f172a',
                  fontSize: '0.95rem',
                }}
              >
                <MapPin size={16} color="#10b981" /> Dirección de Entrega
              </div>
              <button
                onClick={() => setIsSelectModalOpen(true)}
                className="btn btn--ghost btn--sm"
                style={{ fontSize: '0.825rem' }}
              >
                {activeAddress ? 'Cambiar' : '+ Seleccionar'}{' '}
                <ChevronRight size={14} />
              </button>
            </div>

            {activeAddress ? (
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  border: '1px solid #f1f5f9',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4px',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      color: '#0f172a',
                      fontSize: '0.9rem',
                    }}
                  >
                    {activeAddress.title || 'Ubicación de Envío'}
                  </div>
                  {(activeAddress.isDefault || activeAddress.is_default) && (
                    <span className="badge badge--success">
                      Predeterminada
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: '0.825rem',
                    color: '#475569',
                    marginBottom: '4px',
                  }}
                >
                  <strong>
                    {activeAddress.receiverName ||
                      activeAddress.full_name ||
                      'Destinatario'}
                  </strong>{' '}
                  (
                  {activeAddress.receiverPhone ||
                    activeAddress.phone ||
                    'Teléfono'}
                  )
                </div>
                <div style={{ fontSize: '0.825rem', color: '#64748b' }}>
                  {activeAddress.addressLine1 || activeAddress.address_line1}
                  {(activeAddress.addressLine2 ||
                    activeAddress.address_line2) &&
                    `, ${activeAddress.addressLine2 || activeAddress.address_line2}`}
                  , {activeAddress.city}, {activeAddress.state}
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsSelectModalOpen(true)}
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  backgroundColor: '#fef2f2',
                  borderRadius: '12px',
                  border: '1px dashed #fca5a5',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: '#dc2626',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    marginBottom: '4px',
                  }}
                >
                  <AlertTriangle size={16} /> No tienes ninguna dirección
                  seleccionada
                </div>
                <div style={{ color: '#9f1239', fontSize: '0.8rem' }}>
                  Haz clic aquí para agregar o seleccionar una ubicación de
                  envío.
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '22px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <h3
                style={{
                  fontSize: '0.975rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                <ShoppingCart size={16} style={{ marginRight: '6px', display: 'inline', verticalAlign: 'middle' }} />
                Artículos en tu Carrito ({itemCount})
              </h3>
              <Link
                to="/catalog"
                style={{
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: '#10b981',
                  textDecoration: 'none',
                }}
              >
                + Agregar Productos
              </Link>
            </div>

            {cartItems.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '36px 16px',
                  color: '#64748b',
                }}
              >
                <ShoppingCart size={48} color="#cbd5e1" />
                <p style={{ marginTop: '12px', marginBottom: '16px', fontWeight: 600 }}>
                  Tu carrito está vacío.
                </p>
                <Link to="/catalog" className="btn btn--primary btn--sm">
                  Explorar Catálogo
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="data-table-wrap">
                  <table className="data-table">
                    <caption>Precios unitarios; IVA calculado y redondeado por línea.</caption>
                    <thead><tr><th>Producto</th><th>Precio sin IVA</th><th>Precio con IVA (13 %)</th></tr></thead>
                    <tbody>{cartItems.map((item) => <tr key={item.id}><td>{item.name}</td><td>${Number(item.price).toFixed(2)}</td><td>${lineAmounts(item.price).total.toFixed(2)}</td></tr>)}</tbody>
                  </table>
                </div>
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      paddingBottom: '16px',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        flexShrink: 0,
                      }}
                    >
                      {item.image_path ? (
                        <img
                          src={`${UPLOADS_URL}/${item.image_path}`}
                          alt={item.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#cbd5e1',
                          }}
                        >
                          <Package/>
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: '#0f172a',
                          fontSize: '0.875rem',
                        }}
                      >
                        {item.name}
                      </div>
                      <div
                        style={{ fontSize: '0.8rem', color: '#64748b' }}
                      >
                        ${Number(item.price).toFixed(2)} c/u
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginTop: '6px',
                        }}
                      >
                        <button
                          disabled={submitting}
                          aria-label={`Reducir cantidad de ${item.name}`}
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="btn btn--secondary btn--sm"
                          style={{
                            width: '28px',
                            height: '28px',
                            padding: 0,
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                          }}
                        >
                          <Minus size={12} aria-hidden="true" />
                        </button>
                        <span
                          style={{
                            fontSize: '0.825rem',
                            fontWeight: 600,
                            color: '#0f172a',
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          disabled={submitting || item.quantity >= Math.min(Number(item.total_stock), 10000)}
                          aria-label={`Aumentar cantidad de ${item.name}`}
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="btn btn--secondary btn--sm"
                          style={{
                            width: '28px',
                            height: '28px',
                            padding: 0,
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                          }}
                        >
                          <Plus size={12} aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontWeight: 700,
                          color: '#0f172a',
                          fontSize: '0.9rem',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        ${lineAmounts(item.price, item.quantity).total.toFixed(2)} con IVA
                      </div>
                      <button
                        disabled={submitting}
                        onClick={() => removeFromCart(item.id)}
                        className="btn btn--danger btn--sm"
                        style={{
                          marginTop: '4px',
                          gap: '4px',
                        }}
                      >
                        <Trash2 size={12} /> Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              position: 'sticky',
              top: '24px',
            }}
          >
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#0f172a',
                margin: '0 0 20px 0',
                letterSpacing: '-0.01em',
              }}
            >
              Resumen del Pago
            </h3>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '10px',
                fontSize: '0.875rem',
                color: '#475569',
              }}
            >
              <span>Subtotal sin IVA:</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>IVA (13 %):</span><strong>${tax.toFixed(2)}</strong>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '18px',
                fontSize: '0.875rem',
                color: '#475569',
              }}
            >
              <span>Costo de envío:</span>
              <span
                style={{
                  fontWeight: 600,
                  color: shippingFee === 0 ? '#047857' : '#0f172a',
                }}
              >
                {shippingFee === 0 ? 'GRATIS' : `$${shippingFee.toFixed(2)}`}
              </span>
            </div>

            <div
              style={{
                height: '1px',
                backgroundColor: '#e2e8f0',
                margin: '16px 0',
              }}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '24px',
                alignItems: 'baseline',
              }}
            >
              <span
                style={{
                  fontSize: '0.975rem',
                  fontWeight: 700,
                  color: '#0f172a',
                }}
              >
                Total a Pagar:
              </span>
              <span
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                }}
              >
                ${total.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={submitting || cartItems.length === 0}
              className="btn btn--primary btn--lg"
              style={{ width: '100%' }}
            >
              {submitting ? 'Guardando pedido…' : `Confirmar y Realizar Pedido ($${total.toFixed(2)})`}
            </button>

            <div
              style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.8rem',
                color: '#64748b',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={14} color="#94a3b8" /> Entrega estimada en 25 - 35
                minutos
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={14} color="#94a3b8" /> Garantía de
                satisfacción y entrega garantizada
              </div>
            </div>
          </div>
        </div>
      </div>

      <CleanModal
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
        title="Seleccionar Dirección de Entrega"
        subtitle="Elige la ubicación donde deseas recibir tu pedido o agrega una nueva."
        icon={<MapPin size={20} />}
        maxWidth="560px"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          {addresses.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '24px',
                color: '#64748b',
              }}
            >
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
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: isSelected
                      ? '2px solid #10b981'
                      : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        color: '#0f172a',
                        fontSize: '0.875rem',
                      }}
                    >
                      {addr.title || 'Dirección'}
                    </div>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: '#475569',
                        marginTop: '2px',
                      }}
                    >
                      {addr.receiverName || addr.full_name} (
                      {addr.receiverPhone || addr.phone})
                    </div>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: '#64748b',
                        marginTop: '2px',
                      }}
                    >
                      {addr.addressLine1 || addr.address_line1}, {addr.city},{' '}
                      {addr.state}
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle size={20} color="#10b981" />
                  )}
                </div>
              );
            })
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <Link
            to="/addresses"
            className="btn btn--secondary"
            style={{ gap: '6px', fontSize: '0.825rem' }}
          >
            + Gestionar / Nueva Dirección
          </Link>
          <button
            onClick={() => setIsSelectModalOpen(false)}
            className="btn btn--primary"
            style={{ fontSize: '0.825rem' }}
          >
            Listo
          </button>
        </div>
      </CleanModal>
    </div>
  );
}
