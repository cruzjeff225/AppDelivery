import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Settings, Users, Package, ChevronRight } from 'lucide-react';
import { useAuth } from '../../auth/hooks/use-auth';
import { getOrders } from '../../orders/order.service';
import { ORDER_STATUS } from '../../orders/order-status';

// Estados que cada rol sigue en su resumen (coinciden con lo que ve en el panel de monitoreo).
const METRICS = {
  admin: [
    { status: 'CREADO', label: 'Pendientes de pago', color: '#64748b', bg: '#f1f5f9' },
    { status: 'PAGADO', label: 'Pagados por preparar', color: '#0369a1', bg: '#f0f9ff' },
    { status: 'EN_PREPARACION', label: 'En preparación', color: '#b45309', bg: '#fffbeb' },
    { status: 'EN_CAMINO', label: 'En camino', color: '#6366f1', bg: '#eef2ff' },
  ],
  delivery: [
    { status: 'EN_PREPARACION', label: 'Listos para salir', color: '#b45309', bg: '#fffbeb' },
    { status: 'EN_CAMINO', label: 'En camino', color: '#6366f1', bg: '#eef2ff' },
  ],
};

const ACTIONS = {
  admin: [
    { to: '/orders/monitor', title: 'Monitoreo de pedidos', desc: 'Actualizar el estado de los pedidos', icon: ClipboardList, variant: 'green' },
    { to: '/admin/catalog', title: 'Catálogo & Stock', desc: 'Productos, categorías e inventario', icon: Settings, variant: 'blue' },
    { to: '/admin/users', title: 'Usuarios', desc: 'Cuentas y roles del sistema', icon: Users, variant: 'indigo' },
  ],
  delivery: [
    { to: '/orders/monitor', title: 'Monitoreo de pedidos', desc: 'Tomar y entregar pedidos', icon: ClipboardList, variant: 'green' },
    { to: '/catalog', title: 'Catálogo', desc: 'Consultar productos', icon: Package, variant: 'blue' },
  ],
};

const ACTION_COLORS = {
  green: { icon: '#059669', iconBg: '#d1fae5', title: '#065f46', desc: '#047857' },
  blue: { icon: '#0284c7', iconBg: '#bae6fd', title: '#075985', desc: '#0284c7' },
  indigo: { icon: '#4f46e5', iconBg: '#c7d2fe', title: '#3730a3', desc: '#4f46e5' },
};

export default function StaffDashboard() {
  const { role } = useAuth();
  const metrics = METRICS[role] || [];
  const actions = ACTIONS[role] || [];
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    let active = true;
    getOrders()
      .then((orders) => {
        if (!active) return;
        setCounts(orders.reduce((acc, o) => ({ ...acc, [o.status]: (acc[o.status] || 0) + 1 }), {}));
      })
      .catch(() => active && setCounts({}));
    return () => { active = false; };
  }, []);

  return (
    <div className="dashboard-page">
      <div className="reference-metrics-grid">
        {metrics.map((metric) => (
          <div key={metric.status} className="ref-metric-card">
            <div>
              <div
                className="ref-metric-card__icon-box"
                style={{ backgroundColor: metric.bg, color: metric.color }}
              >
                <ClipboardList size={20} />
              </div>
              <div className="ref-metric-card__number">
                {counts === null ? '…' : counts[metric.status] || 0}
              </div>
              <div className="ref-metric-card__label">{metric.label}</div>
            </div>
            <Link
              to="/orders/monitor"
              className="ref-metric-card__action"
              style={{ color: metric.color }}
            >
              Ver {ORDER_STATUS[metric.status].label.toLowerCase()} <ChevronRight size={14} />
            </Link>
          </div>
        ))}
      </div>

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          padding: '24px',
          border: '1px solid #e2e8f0',
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
          Accesos Rápidos
        </h3>

        {actions.map(({ to, title, desc, icon: Icon, variant }) => {
          const colors = ACTION_COLORS[variant];
          return (
            <Link key={to} to={to} className={`quick-action-block quick-action-block--${variant}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: colors.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.icon,
                  }}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: colors.title, fontSize: '0.9rem' }}>{title}</div>
                  <div style={{ fontSize: '0.8rem', color: colors.desc }}>{desc}</div>
                </div>
              </div>
              <span style={{ color: colors.icon, fontWeight: 700 }}>
                <ChevronRight size={16} />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
