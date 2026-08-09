import React from 'react';

export function ConfirmDeleteModal({ isOpen, onClose, onConfirm, title, message, itemName, loading }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '32px 28px',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          textAlign: 'center',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning Icon Circle (Imagen 3 Reference) */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#fff7ed',
            border: '2px solid #ffedd5',
            color: '#f97316',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            margin: '0 auto 20px auto'
          }}
        >
          ⚠️
        </div>

        {/* Modal Title */}
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: '800',
            color: '#0f172a',
            margin: '0 0 10px 0',
            letterSpacing: '-0.02em'
          }}
        >
          {title || `¿Eliminar ${itemName || 'este registro'}?`}
        </h3>

        {/* Warning Description */}
        <p
          style={{
            fontSize: '0.875rem',
            color: '#64748b',
            margin: '0 0 28px 0',
            lineHeight: '1.5'
          }}
        >
          {message || `Estás a punto de eliminar el registro de '${itemName || 'este elemento'}'. Esta acción no se puede deshacer.`}
        </p>

        {/* Modal Actions Footer */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              color: '#334155',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#1e3a8a',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
