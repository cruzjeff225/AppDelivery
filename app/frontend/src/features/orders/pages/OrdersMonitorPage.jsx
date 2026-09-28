import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw, Eye, XCircle, ArrowRight } from 'lucide-react';
import { CleanModal } from '../../../components/CleanModal';
import { useAuth } from '../../auth/hooks/use-auth';
import { useSileoNotification } from '../../../context/SileoNotificationContext';
import { getOrders, getOrder, updateOrderStatus } from '../order.service';
import { ORDER_STATUS, statusLabel } from '../order-status';
import { apiErrorMessage as errorMessage, formatDateTime as dateTime, formatMoney as money } from '../order-format';
import OrderStatusBadge from '../components/OrderStatusBadge';
import OrderDetailModal from '../components/OrderDetailModal';

const REFRESH_MS = 30000;

const TABS = [
  { key: 'active', label: 'En curso', status: undefined },
  { key: 'delivered', label: 'Entregados', status: 'ENTREGADO' },
  { key: 'cancelled', label: 'Cancelados', status: 'CANCELADO', adminOnly: true },
];

export default function OrdersMonitorPage() {
  const { role } = useAuth();
  const { showSuccess, showError } = useSileoNotification();
  const isAdmin = role === 'admin';
  const tabs = TABS.filter((tab) => isAdmin || !tab.adminOnly);

  const [tab, setTab] = useState('active');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [toCancel, setToCancel] = useState(null);
  const [detail, setDetail] = useState(null);
  const requestId = useRef(0);
  // El contexto crea showError en cada render; la ref evita recargar al mostrar un aviso.
  const showErrorRef = useRef(showError);
  showErrorRef.current = showError;

  const loadOrders = useCallback(async ({ silent = false } = {}) => {
    const current = ++requestId.current;
    if (!silent) setLoading(true);
    try {
      const data = await getOrders(TABS.find((t) => t.key === tab).status);
      // Ignora respuestas de una pestaña anterior que lleguen tarde.
      if (current !== requestId.current) return;
      setOrders(data);
      setLastUpdated(new Date());
    } catch (err) {
      if (current === requestId.current && !silent) {
        showErrorRef.current(errorMessage(err, 'No se pudieron cargar los pedidos.'));
      }
    } finally {
      if (current === requestId.current) setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    loadOrders();
    const timer = setInterval(() => loadOrders({ silent: true }), REFRESH_MS);
    return () => clearInterval(timer);
  }, [loadOrders]);

  const changeStatus = async (order, status) => {
    setUpdatingId(order.id);
    try {
      const updated = await updateOrderStatus(order.id, status);
      showSuccess(`Pedido #${order.id}: ${statusLabel(updated.status)}`);
      if (detail?.id === order.id) setDetail(updated);
      await loadOrders({ silent: true });
    } catch (err) {
      showError(errorMessage(err, 'No se pudo actualizar el estado.'));
      await loadOrders({ silent: true });
    } finally {
      setUpdatingId(null);
      setToCancel(null);
    }
  };

  const openDetail = async (order) => {
    try {
      setDetail(await getOrder(order.id));
    } catch (err) {
      showError(errorMessage(err, 'No se pudo cargar el pedido.'));
    }
  };

  const requestTransition = (order, status) => {
    if (status === 'CANCELADO') setToCancel(order);
    else changeStatus(order, status);
  };

  const counts = orders.reduce((acc, order) => ({ ...acc, [order.status]: (acc[order.status] || 0) + 1 }), {});

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2 className="page-header__title">Monitoreo de pedidos</h2>
          <p className="page-header__subtitle">
            {isAdmin
              ? 'Actualiza el estado de los pedidos desde el pago hasta la entrega.'
              : 'Toma los pedidos listos para salir y confirma sus entregas.'}
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

      <nav className="tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`tabs__btn ${tab === t.key ? 'tabs__btn--active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
          color: '#64748b',
          fontSize: '0.8rem',
        }}
      >
        {Object.keys(ORDER_STATUS)
          .filter((status) => counts[status])
          .map((status) => (
            <span key={status} className={`badge ${ORDER_STATUS[status].badge}`}>
              {counts[status]} {statusLabel(status)}
            </span>
          ))}
        {lastUpdated && (
          <span style={{ marginLeft: 'auto' }}>
            Actualizado {lastUpdated.toLocaleTimeString('es-SV')} · se refresca cada 30 s
          </span>
        )}
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Entrega</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  Cargando pedidos...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  No hay pedidos en esta vista.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const address = order.delivery_address || {};
                return (
                  <tr key={order.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>#{order.id}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{dateTime(order.created_at)}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{order.customer_name}</div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{order.customer_phone || 'N/A'}</div>
                    </td>
                    <td>
                      <div>{address.address_line1 || 'Sin dirección'}</div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                        {[address.city, address.state].filter(Boolean).join(', ')}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{money(order.total)}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                        {order.item_count} {order.item_count === 1 ? 'unidad' : 'unidades'}
                      </div>
                    </td>
                    <td>
                      <OrderStatusBadge status={order.status} />
                      {order.delivery_name && (
                        <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px' }}>
                          Repartidor: {order.delivery_name}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {order.available_transitions.map((next) => (
                          <button
                            key={next}
                            onClick={() => requestTransition(order, next)}
                            disabled={updatingId === order.id}
                            className={`btn btn--sm ${next === 'CANCELADO' ? 'btn--danger' : 'btn--primary'}`}
                            style={{ gap: '4px' }}
                          >
                            {next === 'CANCELADO' ? <XCircle size={12} /> : <ArrowRight size={12} />}
                            {ORDER_STATUS[next].action}
                          </button>
                        ))}
                        <button
                          onClick={() => openDetail(order)}
                          className="btn btn--secondary btn--sm"
                          style={{ gap: '4px' }}
                        >
                          <Eye size={12} /> Detalle
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <CleanModal
        isOpen={Boolean(toCancel)}
        onClose={() => setToCancel(null)}
        title={`Cancelar pedido #${toCancel?.id ?? ''}`}
        subtitle="Los productos regresan al inventario. Esta acción no se puede deshacer."
        icon={<XCircle size={20} />}
        maxWidth="460px"
        footer={
          <>
            <button type="button" onClick={() => setToCancel(null)} className="btn btn--secondary">
              Volver
            </button>
            <button
              type="button"
              onClick={() => changeStatus(toCancel, 'CANCELADO')}
              disabled={updatingId === toCancel?.id}
              className="btn btn--danger"
            >
              {updatingId === toCancel?.id ? 'Cancelando...' : 'Cancelar pedido'}
            </button>
          </>
        }
      >
        <p style={{ margin: 0, color: '#64748b' }}>
          Cliente: <strong>{toCancel?.customer_name}</strong> · Total: <strong>{toCancel && money(toCancel.total)}</strong>
        </p>
      </CleanModal>

      <OrderDetailModal order={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
