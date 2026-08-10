import { useCart } from '../../cart/hooks/use-cart';
import { useAddresses } from '../../addresses/hooks/useAddresses';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { itemCount, total } = useCart();
  const { addresses } = useAddresses();

  const defaultAddress = addresses.find((a) => a.isDefault || a.is_default) || addresses[0];

  return (
    <div className="dashboard-page">
      {/* 3 Metric Cards (FARMACIA LA MERCED Reference Inspired) */}
      <div className="reference-metrics-grid">
        {/* Metric 1 */}
        <div className="ref-metric-card">
          <div>
            <div className="ref-metric-card__icon-box" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
              🛒
            </div>
            <div className="ref-metric-card__number">{itemCount}</div>
            <div className="ref-metric-card__label">Ítems en Carrito (${total.toFixed(2)})</div>
          </div>
          <Link to="/checkout" className="ref-metric-card__action" style={{ color: '#10b981' }}>
            Ver Carrito & Checkout ›
          </Link>
        </div>

        {/* Metric 2 */}
        <div className="ref-metric-card">
          <div>
            <div className="ref-metric-card__icon-box" style={{ backgroundColor: '#f0f9ff', color: '#0284c7' }}>
              📍
            </div>
            <div className="ref-metric-card__number">{addresses.length}</div>
            <div className="ref-metric-card__label">
              {defaultAddress
                ? `Dirección: ${defaultAddress.title || defaultAddress.city}`
                : 'Direcciones Registradas'}
            </div>
          </div>
          <Link to="/addresses" className="ref-metric-card__action" style={{ color: '#0284c7' }}>
            Gestionar Direcciones ›
          </Link>
        </div>

        {/* Metric 3 */}
        <div className="ref-metric-card">
          <div>
            <div className="ref-metric-card__icon-box" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              ⚡
            </div>
            <div className="ref-metric-card__number">25-35m</div>
            <div className="ref-metric-card__label">Tiempo Estimado de Entrega</div>
          </div>
          <Link to="/catalog" className="ref-metric-card__action" style={{ color: '#d97706' }}>
            Explorar Productos ›
          </Link>
        </div>
      </div>

      {/* Main Section: 2 Columns (Chart + Quick Actions) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Left Card: Performance Chart (Rendimiento y Entregas) */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Actividad de Entregas & Pedidos
            </h3>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#f1f5f9', padding: '4px 12px', borderRadius: '999px', color: '#64748b' }}>
              Mensual
            </span>
          </div>

          {/* Smooth Emerald Curve SVG Chart */}
          <div style={{ width: '100%', height: '180px', position: 'relative' }}>
            <svg viewBox="0 0 500 150" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 110 Q 125 30 250 70 T 500 20 L 500 150 L 0 150 Z"
                fill="url(#emeraldGradient)"
              />
              <path
                d="M 0 110 Q 125 30 250 70 T 500 20"
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Plot dots */}
              <circle cx="0" cy="110" r="5" fill="#10b981" />
              <circle cx="125" cy="50" r="5" fill="#10b981" />
              <circle cx="250" cy="70" r="5" fill="#10b981" />
              <circle cx="375" cy="35" r="5" fill="#10b981" />
              <circle cx="500" cy="20" r="6" fill="#047857" stroke="#ffffff" strokeWidth="2" />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>
              <span>Mayo</span>
              <span>Junio</span>
              <span>Julio</span>
              <span>Agosto</span>
            </div>
          </div>
        </div>

        {/* Right Card: Quick Action Blocks (Accesos Rápidos) */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: '0 0 20px 0' }}>
            Accesos Rápidos
          </h3>

          <Link to="/catalog" className="quick-action-block quick-action-block--green">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '1.5rem' }}>🛍️</span>
              <div>
                <div style={{ fontWeight: '700', color: '#065f46', fontSize: '0.95rem' }}>Explorar Catálogo</div>
                <div style={{ fontSize: '0.8rem', color: '#047857' }}>Ver productos disponibles</div>
              </div>
            </div>
            <span style={{ color: '#059669', fontWeight: '700' }}>›</span>
          </Link>

          <Link to="/addresses" className="quick-action-block quick-action-block--blue">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '1.5rem' }}>📍</span>
              <div>
                <div style={{ fontWeight: '700', color: '#075985', fontSize: '0.95rem' }}>Gestionar Direcciones</div>
                <div style={{ fontSize: '0.8rem', color: '#0284c7' }}>Administrar ubicaciones de envío</div>
              </div>
            </div>
            <span style={{ color: '#0284c7', fontWeight: '700' }}>›</span>
          </Link>

          <Link to="/checkout" className="quick-action-block quick-action-block--pink">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '1.5rem' }}>💳</span>
              <div>
                <div style={{ fontWeight: '700', color: '#9f1239', fontSize: '0.95rem' }}>Realizar Checkout</div>
                <div style={{ fontSize: '0.8rem', color: '#e11d48' }}>Confirmar y pagar pedido</div>
              </div>
            </div>
            <span style={{ color: '#e11d48', fontWeight: '700' }}>›</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
