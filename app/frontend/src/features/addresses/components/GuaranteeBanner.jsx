import React from 'react';

/**
 * Componente GuaranteeBanner: Banner verde superior con beneficios y políticas de devolución
 */
export function GuaranteeBanner({ text1 = 'Envío gratis', text2 = 'Reembolso por 75 días sin entrega' }) {
  return (
    <div className="guarantee-banner">
      <div className="d-flex align-items-center gap-3">
        <span className="guarantee-banner-item">
          <span>✓</span> {text1}
        </span>
        <span style={{ color: '#DDD' }}>|</span>
        <span className="guarantee-banner-item">
          <span>✓</span> {text2}
        </span>
      </div>
      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>›</span>
    </div>
  );
}
