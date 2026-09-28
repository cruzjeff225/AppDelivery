import { XCircle } from 'lucide-react';
import { ORDER_STATUS } from '../order-status';

const STEPS = ['CREADO', 'PAGADO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO'];

// Línea de progreso del pedido para el cliente; un pedido cancelado muestra un aviso.
export default function OrderProgress({ status }) {
  if (status === 'CANCELADO') {
    return (
      <div className="order-progress__cancelled">
        <XCircle size={16} /> Este pedido fue cancelado.
      </div>
    );
  }

  const current = STEPS.indexOf(status);
  return (
    <ol className="order-progress">
      {STEPS.map((step, index) => (
        <li
          key={step}
          className={[
            'order-progress__step',
            index <= current ? 'order-progress__step--done' : '',
            index === current ? 'order-progress__step--current' : '',
          ].join(' ')}
        >
          <span className="order-progress__bar" />
          <span>{ORDER_STATUS[step].label}</span>
        </li>
      ))}
    </ol>
  );
}
