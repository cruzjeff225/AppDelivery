import { MapPin, Star, Pencil, Trash2, Building2, MapPinned } from 'lucide-react';

export function AddressCard({ address, onSetDefault, onEdit, onDelete }) {
  const {
    id,
    title,
    city,
    state,
    is_default,
    address_line1,
    address_line2,
    postal_code,
    receiverName,
    receiverPhone,
  } = address;

  const displayName = receiverName || address.full_name || 'Destinatario';
  const displayPhone = receiverPhone || address.phone || '';
  const isDefault = is_default || address.isDefault || address.is_default;

  return (
    <div
      className="section-card"
      style={{
        borderLeft: isDefault ? '3px solid #f59e0b' : undefined,
        backgroundColor: isDefault ? '#fffbeb' : '#ffffff',
      }}
    >
      <div className="section-card__body" style={{ padding: '20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} color="#10b981" />
            <h5
              style={{
                fontWeight: 700,
                color: '#0f172a',
                fontSize: '0.9rem',
                margin: 0,
              }}
            >
              {title || 'Direccion'}
            </h5>
          </div>

          {isDefault ? (
            <span className="badge badge--warning">
              <Star size={10} style={{ marginRight: '3px' }} />
              Predeterminada
            </span>
          ) : (
            <button
              onClick={() => onSetDefault(id)}
              className="btn btn--ghost btn--sm"
            >
              Hacer predeterminada
            </button>
          )}
        </div>

        <div style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '6px' }}>
          <strong>{displayName}</strong>
          {displayPhone && <span> &middot; {displayPhone}</span>}
        </div>

        <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0 0 4px 0' }}>
          {address_line1}
        </p>

        {address_line2 && (
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 8px 0' }}>
            {address_line2}
          </p>
        )}

        <div
          style={{
            fontSize: '0.78rem',
            color: '#94a3b8',
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Building2 size={12} /> {city}
            {state && `, ${state}`}
          </span>
          {postal_code && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPinned size={12} /> CP {postal_code}
            </span>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            marginTop: '14px',
          }}
        >
          <button
            onClick={() => onEdit(address)}
            className="btn btn--secondary btn--sm"
            style={{ gap: '4px' }}
          >
            <Pencil size={12} /> Editar
          </button>
          <button
            onClick={() => onDelete(id)}
            className="btn btn--danger btn--sm"
            style={{ gap: '4px' }}
          >
            <Trash2 size={12} /> Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
