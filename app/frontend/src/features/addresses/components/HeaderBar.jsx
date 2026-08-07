import React from 'react';

/**
 * Componente HeaderBar: Encabezado móvil limpio con flecha de retorno y sello de seguridad verde
 */
export function HeaderBar({ title, onBack, showSecurity = true }) {
  return (
    <div className="app-header-bar">
      {onBack ? (
        <button
          onClick={onBack}
          className="btn p-0 border-0 text-dark me-2 d-flex align-items-center justify-content-center"
          style={{ fontSize: '20px', width: '32px', height: '32px', cursor: 'pointer' }}
          aria-label="Volver"
        >
          ‹
        </button>
      ) : (
        <div style={{ width: '32px' }} />
      )}

      <div className="text-center flex-grow-1">
        <h1 className="app-header-title">{title}</h1>
        {showSecurity && (
          <div className="app-security-badge">
            <span style={{ fontSize: '12px' }}>🔒</span> Todos los datos están protegidos
          </div>
        )}
      </div>

      <div style={{ width: '32px' }} />
    </div>
  );
}
