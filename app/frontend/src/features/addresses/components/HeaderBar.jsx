import { ShieldCheck } from 'lucide-react';

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
          &lsaquo;
        </button>
      ) : (
        <div style={{ width: '32px' }} />
      )}

      <div className="text-center flex-grow-1">
        <h1 className="app-header-title">{title}</h1>
        {showSecurity && (
          <div className="app-security-badge">
            <ShieldCheck size={12} style={{ marginRight: '4px' }} />
            Todos los datos estan protegidos
          </div>
        )}
      </div>

      <div style={{ width: '32px' }} />
    </div>
  );
}
