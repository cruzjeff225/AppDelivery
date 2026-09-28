import { useCart } from '../../cart/hooks/use-cart';
import { useAddresses } from '../../addresses/hooks/useAddresses';
import { useAuth } from '../../auth/hooks/use-auth';
import StaffDashboard from '../components/StaffDashboard';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  MapPin,
  Clock,
  Package,
  CreditCard,
  ChevronRight,
} from 'lucide-react';

// El cliente ve su carrito y direcciones; el personal, un resumen operativo.
export default function DashboardPage() {
  const { role } = useAuth();
  return role === 'customer' ? <CustomerDashboard /> : <StaffDashboard />;
}

function CustomerDashboard() {
  const { itemCount, total } = useCart();
  const { addresses } = useAddresses();

  const defaultAddress = addresses.find((a) => a.isDefault || a.is_default) || addresses[0];

  return (
    <div className="dashboard-page">
      <div className="reference-metrics-grid">
        <div className="ref-metric-card">
          <div>
            <div
              className="ref-metric-card__icon-box"
              style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}
            >
              <ShoppingCart size={20} />
            </div>
            <div className="ref-metric-card__number">{itemCount}</div>
            <div className="ref-metric-card__label">
              Ítems en Carrito (${total.toFixed(2)})
            </div>
          </div>
          <Link
            to="/checkout"
            className="ref-metric-card__action"
            style={{ color: '#10b981' }}
          >
            Ver Carrito & Checkout <ChevronRight size={14} />
          </Link>
        </div>

        <div className="ref-metric-card">
          <div>
            <div
              className="ref-metric-card__icon-box"
              style={{ backgroundColor: '#f0f9ff', color: '#0284c7' }}
            >
              <MapPin size={20} />
            </div>
            <div className="ref-metric-card__number">{addresses.length}</div>
            <div className="ref-metric-card__label">
              {defaultAddress
                ? `Dirección: ${defaultAddress.title || defaultAddress.city}`
                : 'Direcciones Registradas'}
            </div>
          </div>
          <Link
            to="/addresses"
            className="ref-metric-card__action"
            style={{ color: '#0284c7' }}
          >
            Gestionar Direcciones <ChevronRight size={14} />
          </Link>
        </div>

        <div className="ref-metric-card">
          <div>
            <div
              className="ref-metric-card__icon-box"
              style={{ backgroundColor: '#fffbeb', color: '#d97706' }}
            >
              <Clock size={20} />
            </div>
            <div className="ref-metric-card__number">25–35m</div>
            <div className="ref-metric-card__label">
              Tiempo Estimado de Entrega
            </div>
          </div>
          <Link
            to="/catalog"
            className="ref-metric-card__action"
            style={{ color: '#d97706' }}
          >
            Explorar Productos <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            padding: '24px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              Actividad de Entregas & Pedidos
            </h3>
            <span
              style={{
                fontSize: '0.725rem',
                fontWeight: 600,
                backgroundColor: '#f1f5f9',
                padding: '4px 12px',
                borderRadius: '999px',
                color: '#64748b',
              }}
            >
              Mensual
            </span>
          </div>

          <div style={{ width: '100%', height: '180px', position: 'relative' }}>
            <svg
              viewBox="0 0 500 150"
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
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
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="0" cy="110" r="4" fill="#10b981" />
              <circle cx="125" cy="50" r="4" fill="#10b981" />
              <circle cx="250" cy="70" r="4" fill="#10b981" />
              <circle cx="375" cy="35" r="4" fill="#10b981" />
              <circle
                cx="500"
                cy="20"
                r="5"
                fill="#047857"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </svg>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '12px',
                fontSize: '0.725rem',
                color: '#94a3b8',
                fontWeight: 600,
              }}
            >
              <span>Mayo</span>
              <span>Junio</span>
              <span>Julio</span>
              <span>Agosto</span>
            </div>
          </div>
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

          <Link to="/catalog" className="quick-action-block quick-action-block--green">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#d1fae5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#059669',
                }}
              >
                <Package size={18} />
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    color: '#065f46',
                    fontSize: '0.9rem',
                  }}
                >
                  Explorar Catálogo
                </div>
                <div style={{ fontSize: '0.8rem', color: '#047857' }}>
                  Ver productos disponibles
                </div>
              </div>
            </div>
            <span style={{ color: '#059669', fontWeight: 700 }}>
              <ChevronRight size={16} />
            </span>
          </Link>

          <Link
            to="/addresses"
            className="quick-action-block quick-action-block--blue"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#bae6fd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284c7',
                }}
              >
                <MapPin size={18} />
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    color: '#075985',
                    fontSize: '0.9rem',
                  }}
                >
                  Gestionar Direcciones
                </div>
                <div style={{ fontSize: '0.8rem', color: '#0284c7' }}>
                  Administrar ubicaciones de envío
                </div>
              </div>
            </div>
            <span style={{ color: '#0284c7', fontWeight: 700 }}>
              <ChevronRight size={16} />
            </span>
          </Link>

          <Link
            to="/checkout"
            className="quick-action-block quick-action-block--indigo"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#c7d2fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4f46e5',
                }}
              >
                <CreditCard size={18} />
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    color: '#3730a3',
                    fontSize: '0.9rem',
                  }}
                >
                  Realizar Checkout
                </div>
                <div style={{ fontSize: '0.8rem', color: '#4f46e5' }}>
                  Confirmar y pagar pedido
                </div>
              </div>
            </div>
            <span style={{ color: '#4f46e5', fontWeight: 700 }}>
              <ChevronRight size={16} />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
