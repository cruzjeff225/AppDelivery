import { ORDER_STATUS, statusLabel } from '../order-status';

export default function OrderStatusBadge({ status }) {
  return <span className={`badge ${ORDER_STATUS[status]?.badge || ''}`}>{statusLabel(status)}</span>;
}
