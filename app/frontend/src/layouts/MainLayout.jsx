import { useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { useCart } from '../features/cart/hooks/use-cart';
import { useSileoNotification } from '../context/SileoNotificationContext';
import {
  LayoutDashboard,
  Package,
  MapPin,
  ShoppingCart,
  Users,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  ChevronRight,
  Truck,
} from 'lucide-react';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  const { itemCount, total } = useCart();
  const { notifications, unreadCount, markAllAsRead } = useSileoNotification();
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const toggleBell = () => {
    setBellOpen(!bellOpen);
    if (!bellOpen) {
      markAllAsRead();
    }
  };

  return (
    <div className="app-layout">
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            zIndex: 95,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="app-sidebar__brand">
          <div className="app-sidebar__logo-icon">
            <Truck size={20} />
          </div>
          <div>
            <div className="app-sidebar__brand-name">Delivery</div>
            <div className="app-sidebar__brand-sub">Panel de Control</div>
          </div>
        </div>

        <nav className="app-sidebar__menu">
          <span className="app-sidebar__section-label">Principal</span>

          <NavLink
            to="/dashboard"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `app-sidebar__item ${isActive || location.pathname === '/' ? 'active' : ''}`
            }
          >
            <span className="app-sidebar__item-icon">
              <LayoutDashboard size={18} />
            </span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/catalog"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `app-sidebar__item ${isActive ? 'active' : ''}`
            }
          >
            <span className="app-sidebar__item-icon">
              <Package size={18} />
            </span>
            <span>Catálogo</span>
          </NavLink>

          <NavLink
            to="/addresses"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `app-sidebar__item ${isActive ? 'active' : ''}`
            }
          >
            <span className="app-sidebar__item-icon">
              <MapPin size={18} />
            </span>
            <span>Mis Direcciones</span>
          </NavLink>

          <NavLink
            to="/checkout"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `app-sidebar__item ${isActive ? 'active' : ''}`
            }
          >
            <span className="app-sidebar__item-icon">
              <ShoppingCart size={18} />
            </span>
            <span>Carrito & Checkout</span>
            {itemCount > 0 && (
              <span className="app-sidebar__badge">{itemCount}</span>
            )}
          </NavLink>

          <div className="app-sidebar__divider" />

          <span className="app-sidebar__section-label">Gestión</span>

          <NavLink
            to="/admin/users"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `app-sidebar__item ${isActive ? 'active' : ''}`
            }
          >
            <span className="app-sidebar__item-icon">
              <Users size={18} />
            </span>
            <span>Usuarios</span>
          </NavLink>

          <NavLink
            to="/admin/catalog"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `app-sidebar__item ${isActive ? 'active' : ''}`
            }
          >
            <span className="app-sidebar__item-icon">
              <Settings size={18} />
            </span>
            <span>Catálogo & Stock</span>
          </NavLink>
        </nav>

        <div className="app-sidebar__user">
          <div className="app-sidebar__user-avatar">A</div>
          <div className="app-sidebar__user-info">
            <span className="app-sidebar__user-name">Administrador</span>
            <span className="app-sidebar__user-role">Sistema Activo</span>
          </div>
        </div>
      </aside>

      <div className="app-main-wrap">
        <header className="app-topbar">
          <div className="app-topbar__title-area">
            <button
              className="app-topbar__toggle-sidebar"
              onClick={toggleSidebar}
              aria-label="Abrir menú"
            >
              <Menu size={22} />
            </button>

            <h1 className="app-topbar__title">Panel de Control</h1>
            <span className="app-topbar__tab-pill">Vista General</span>
          </div>

          <div className="app-topbar__search">
            <Search size={16} color="#94a3b8" />
            <input type="text" placeholder="Buscar productos, comidas..." />
          </div>

          <div className="app-topbar__actions">
            <div style={{ position: 'relative' }}>
              <button
                className="app-topbar__icon-btn"
                onClick={toggleBell}
                aria-label="Notificaciones"
              >
                <Bell size={18} />
                {unreadCount > 0 && <span className="app-topbar__bell-dot" />}
              </button>

              {bellOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '46px',
                    width: '320px',
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    boxShadow:
                      '0 20px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)',
                    zIndex: 1000,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid #f1f5f9',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        color: '#0f172a',
                      }}
                    >
                      Notificaciones
                    </span>
                    <button
                      onClick={() => setBellOpen(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8',
                        display: 'flex',
                        padding: 2,
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div
                        style={{
                          padding: '24px',
                          textAlign: 'center',
                          color: '#94a3b8',
                          fontSize: '0.85rem',
                        }}
                      >
                        Sin notificaciones nuevas
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          style={{
                            padding: '14px 20px',
                            borderBottom: '1px solid #f8fafc',
                            backgroundColor: n.read ? '#ffffff' : '#f0fdf4',
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: '0.825rem',
                              color: '#0f172a',
                            }}
                          >
                            {n.title}
                          </div>
                          <div
                            style={{
                              fontSize: '0.8rem',
                              color: '#475569',
                              marginTop: '2px',
                            }}
                          >
                            {n.message}
                          </div>
                          <div
                            style={{
                              fontSize: '0.725rem',
                              color: '#94a3b8',
                              marginTop: '4px',
                            }}
                          >
                            {n.time}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link to="/checkout" className="app-topbar__btn-cart">
              <ShoppingCart size={16} />
              <span>Carrito (${total.toFixed(2)})</span>
              {itemCount > 0 && (
                <span className="app-topbar__cart-badge">{itemCount}</span>
              )}
            </Link>
          </div>
        </header>

        <main className="app-content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
