import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Package, RefreshCw } from 'lucide-react';
import { useSileoNotification } from '../../../context/SileoNotificationContext';
import { getMyOrders, getOrder } from '../order.service';
import { apiErrorMessage, formatDateTime, formatMoney } from '../order-format';
import OrderStatusBadge from '../components/OrderStatusBadge';
import OrderProgress from '../components/OrderProgress';
import OrderDetailModal from '../components/OrderDetailModal';

const REFRESH_MS = 30000;

export default function MyOrdersPage() {
  const { showError } = useSileoNotification();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  // El contexto crea showError en cada render; la ref evita recargar al mostrar un aviso.
  const showErrorRef = useRef(showError);
  showErrorRef.current = showError;

  const loadOrders = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      setOrders(await getMyOrders());
    } catch (err) {
      if (!silent) showErrorRef.current(apiErrorMessage(err, 'No se pudieron cargar tus pedidos.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    const timer = setInterval(() => loadOrders({ silent: true }), REFRESH_MS);
    return () => clearInterval(timer);
  }, [loadOrders]);

  const openDetail = async (order) => {
    try {
      setDetail(await getOrder(order.id));
    } catch (err) {
      showError(apiErrorMessage(err, 'No se pudo cargar el pedido.'));
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2 className="page-header__title">Mis pedidos</h2>
          <p className="page-header__subtitle">
            Sigue el estado de tus pedidos. Esta página se actualiza sola cada 30 segundos.
          </p>
        </div>

        <button
          onClick={() => loadOrders()}
          className="btn btn--secondary"
          style={{ gap: '6px' }}
          disabled={loading}
        >
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>

      {loading && orders.length === 0 ? (
        <p style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Cargando pedidos...</p>
      ) : orders.length === 0 ? (
        <div className="section-card">
          <div className="section-card__body" style={{ padding: '40px', textAlign: 'center' }}>
            <Package size={36} color="#94a3b8" />
            <p style={{ margin: '12px 0 20px', color: '#64748b' }}>Todavía no has realizado pedidos.</p>
            <Link to="/catalog" className="btn btn--primary" style={{ display: 'inline-flex' }}>
              Explorar catálogo
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {orders.map((order) => {
            const address = order.delivery_address || {};
            return (
              <article key={order.id} className="section-card">
                <div className="section-card__header" style={{ flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3>Pedido #{order.id}</h3>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                      {formatDateTime(order.created_at)}
                    </span>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="section-card__body" style={{ display: 'grid', gap: '16px' }}>
                  <OrderProgress status={order.status} />

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      <div>
                        {address.address_line1}
                        {address.city && `, ${address.city}`}
                      </div>
                      <div>
                        {order.item_count} {order.item_count === 1 ? 'unidad' : 'unidades'} ·{' '}
                        <strong style={{ color: '#0f172a' }}>{formatMoney(order.total)}</strong>
                        {order.delivery_name && ` · Repartidor: ${order.delivery_name}`}
                      </div>
                    </div>

                    <button
                      onClick={() => openDetail(order)}
                      className="btn btn--secondary btn--sm"
                      style={{ gap: '4px' }}
                    >
                      <Eye size={12} /> Ver detalle
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <OrderDetailModal order={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
