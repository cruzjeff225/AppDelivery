import React from 'react';

export function CleanModal({ isOpen, onClose, title, subtitle, icon = '➕', children, maxWidth = '680px' }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          maxWidth: maxWidth,
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar (Imagen 2 & 4 Reference) */}
        <div
          style={{
            padding: '24px 28px 18px 28px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            position: 'relative'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: '700',
              flexShrink: 0
            }}
          >
            {icon}
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: '1.4' }}>
                {subtitle}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '22px',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
