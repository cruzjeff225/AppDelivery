import { useState, createContext, useContext, useCallback } from 'react';

const SileoNotificationContext = createContext(null);

export function SileoNotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Bienvenido a Delivery',
      message: 'Explora nuestro catálogo y realiza tus pedidos en minutos.',
      time: 'Hace 5 min',
      read: false,
    },
    {
      id: 2,
      title: 'Envío Gratis Disponible',
      message: 'Aprovecha envío a domicilio gratis en compras mayores a $15.00.',
      time: 'Hace 1 hora',
      read: false,
    },
  ]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'success', title = null) => {
      const id = Date.now() + Math.random();
      const newToast = { id, message, type, title };

      setToasts((prev) => [...prev, newToast]);

      setNotifications((prev) => [
        {
          id,
          title:
            title ||
            (type === 'success'
              ? 'Éxito'
              : type === 'error'
              ? 'Error'
              : 'Notificación'),
          message,
          time: 'Ahora',
          read: false,
        },
        ...prev,
      ]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SileoNotificationContext.Provider
      value={{
        showToast,
        showSuccess: (msg, title) => showToast(msg, 'success', title),
        showError: (msg, title) => showToast(msg, 'error', title),
        showInfo: (msg, title) => showToast(msg, 'info', title),
        notifications,
        unreadCount,
        markAllAsRead,
      }}
    >
      {children}

      <div
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxWidth: '380px',
          width: 'calc(100% - 48px)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 18px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '16px',
              boxShadow:
                '0 12px 32px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              animation:
                'sileoSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor:
                  toast.type === 'success'
                    ? '#10b981'
                    : toast.type === 'error'
                    ? '#ef4444'
                    : '#3b82f6',
                boxShadow: `0 0 10px ${
                  toast.type === 'success'
                    ? 'rgba(16, 185, 129, 0.5)'
                    : toast.type === 'error'
                    ? 'rgba(239, 68, 68, 0.5)'
                    : 'rgba(59, 130, 246, 0.5)'
                }`,
                flexShrink: 0,
              }}
            />

            <div style={{ flex: 1 }}>
              {toast.title && (
                <div
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    marginBottom: '2px',
                  }}
                >
                  {toast.title}
                </div>
              )}
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: '#334155',
                  lineHeight: '1.4',
                }}
              >
                {toast.message}
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '1.1rem',
                cursor: 'pointer',
                padding: '0 4px',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </SileoNotificationContext.Provider>
  );
}

export function useSileoNotification() {
  const context = useContext(SileoNotificationContext);
  if (!context) {
    throw new Error(
      'useSileoNotification debe ser usado dentro de SileoNotificationProvider'
    );
  }
  return context;
}
