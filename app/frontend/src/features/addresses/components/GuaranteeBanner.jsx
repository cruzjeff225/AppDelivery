import { CheckCircle, ChevronRight } from 'lucide-react';

export function GuaranteeBanner({
  text1 = 'Envio gratis',
  text2 = 'Reembolso por 75 dias sin entrega',
}) {
  return (
    <div className="guarantee-banner">
      <div className="d-flex align-items-center gap-3">
        <span className="guarantee-banner-item">
          <CheckCircle size={14} style={{ marginRight: '4px' }} /> {text1}
        </span>
        <span style={{ color: '#DDD' }}>|</span>
        <span className="guarantee-banner-item">
          <CheckCircle size={14} style={{ marginRight: '4px' }} /> {text2}
        </span>
      </div>
      <ChevronRight size={16} />
    </div>
  );
}
