import React from 'react';

/**
 * Componente AddressCard:
 * Muestra una dirección individual recibida desde el backend
 */
export function AddressCard({ address, onSetDefault, onEdit, onDelete }) {

  // Adaptación backend (snake_case) -> frontend
  const {
    id,
    title,
    city,
    state,
    country,
    is_default,
    address_line1,
    address_line2,
    postal_code
  } = address;


  return (
    <div
      className={`card h-100 shadow-sm border-0 ${
        is_default ? 'border-start border-4 border-warning bg-light' : 'bg-white'
      }`}
      style={{ borderRadius: '12px' }}
    >

      <div className="card-body p-4 d-flex flex-column justify-content-between">

        <div>

          <div className="d-flex align-items-center justify-content-between mb-3">

            <h5 className="card-title fw-bold text-dark mb-0">
              📍 {title}
            </h5>


            {is_default ? (

              <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">
                ⭐ Predeterminada
              </span>

            ) : (

              <button
                onClick={() => onSetDefault(id)}
                className="btn btn-sm btn-outline-secondary rounded-pill"
              >
                Hacer predeterminada
              </button>

            )}

          </div>


          <p className="card-text text-secondary mb-1">
            {address_line1}
          </p>


          {address_line2 && (
            <p className="card-text text-muted small">
              {address_line2}
            </p>
          )}



          <div className="text-muted small mt-3 pt-2 border-top">

            <span>
              🌆 {city}
            </span>


            {state && (
              <span> • {state}</span>
            )}


            {postal_code && (
              <span> • CP: {postal_code}</span>
            )}


            <span>
              • 🗺️ {country || 'El Salvador'}
            </span>

          </div>

        </div>



        <div className="d-flex justify-content-end gap-2 mt-4">

          <button
            onClick={() => onEdit(address)}
            className="btn btn-sm btn-light text-primary"
          >
            ✏️ Editar
          </button>


          <button
            onClick={() => onDelete(id)}
            className="btn btn-sm btn-light text-danger"
          >
            🗑️ Eliminar
          </button>

        </div>


      </div>

    </div>
  );
}