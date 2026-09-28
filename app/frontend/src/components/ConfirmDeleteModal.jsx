import { AlertTriangle } from 'lucide-react';

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  loading,
}) {
  if (!isOpen) return null;

  return (
    <div className="app-modal-overlay" onClick={onClose}>
      <div
        className="app-modal app-modal--dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="app-modal__body">
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#fef2f2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            <AlertTriangle size={26} />
          </div>

          <h3 style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 8px 0',
            letterSpacing: '-0.02em',
          }}>
            {title || `Eliminar ${itemName || 'este registro'}?`}
          </h3>

          <p style={{
            fontSize: '0.85rem',
            color: '#64748b',
            margin: '0 0 24px 0',
            lineHeight: '1.5',
          }}>
            {message ||
              `Estás a punto de eliminar '${itemName || 'este elemento'}'. Esta acción no se puede deshacer.`}
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn btn--secondary"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="btn btn--danger"
              style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none' }}
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
