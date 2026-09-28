import { ClipboardList } from 'lucide-react';
import { CleanModal } from '../../../components/CleanModal';
import OrderStatusBadge from './OrderStatusBadge';
import { formatDateTime, formatMoney } from '../order-format';

// Detalle de un pedido (productos, entrega e historial). `order` viene de GET /orders/:id.
export default function OrderDetailModal({ order, onClose }) {
  const address = order?.delivery_address || {};

  return (
    <CleanModal
      isOpen={Boolean(order)}
      onClose={onClose}
      title={`Pedido #${order?.id ?? ''}`}
      subtitle={order && `${order.customer_name} · ${formatDateTime(order.created_at)}`}
      icon={<ClipboardList size={20} />}
      maxWidth="720px"
    >
      {order && (
        <>
          <div className="form-section">
            <div className="form-section__header">
              <h4 className="form-section__title">Productos</h4>
            </div>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cant.</th>
                    <th>Precio sin IVA</th>
                    <th>IVA</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>{formatMoney(item.unit_price)}</td>
                      <td>{formatMoney(item.tax)}</td>
                      <td style={{ fontWeight: 600 }}>{formatMoney(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ margin: '12px 0 0', textAlign: 'right', color: '#64748b' }}>
              Subtotal {formatMoney(order.subtotal)} · IVA {formatMoney(order.tax)} · Envío{' '}
              {formatMoney(order.shipping_fee)} ·{' '}
              <strong style={{ color: '#0f172a' }}>Total {formatMoney(order.total)}</strong>
            </p>
          </div>

          <div className="form-section">
            <div className="form-section__header">
              <h4 className="form-section__title">Entrega</h4>
            </div>
            <p style={{ margin: 0 }}>
              {[address.address_line1, address.address_line2].filter(Boolean).join(' · ')}
            </p>
            <p style={{ margin: '4px 0 0', color: '#64748b' }}>
              {[address.city, address.state].filter(Boolean).join(', ')}
              {address.receiver_name && ` · Recibe: ${address.receiver_name} ${address.receiver_phone || ''}`}
            </p>
            {order.delivery_name && (
              <p style={{ margin: '4px 0 0', color: '#64748b' }}>Repartidor: {order.delivery_name}</p>
            )}
          </div>

          <div className="form-section">
            <div className="form-section__header">
              <h4 className="form-section__title">Historial de estados</h4>
            </div>
            <ol style={{ margin: 0, paddingLeft: '20px', display: 'grid', gap: '8px' }}>
              {order.history.map((entry, index) => (
                <li key={index}>
                  <OrderStatusBadge status={entry.to_status} />{' '}
                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                    {formatDateTime(entry.changed_at)}
                    {entry.changed_by_name && ` · ${entry.changed_by_name}`}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
    </CleanModal>
  );
}
