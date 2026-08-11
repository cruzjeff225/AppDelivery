import { X } from 'lucide-react';

export function CleanModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  maxWidth = '680px',
}) {
  if (!isOpen) return null;

  return (
    <div className="app-modal-overlay" onClick={onClose}>
      <div
        className="app-modal"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || icon || subtitle) && (
          <div className="app-modal__header">
            {icon && <div className="app-modal__header-icon">{icon}</div>}

            <div className="app-modal__header-text">
              {title && <h3 className="app-modal__title">{title}</h3>}
              {subtitle && <p className="app-modal__subtitle">{subtitle}</p>}
            </div>

            <button
              type="button"
              className="app-modal__close"
              onClick={onClose}
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="app-modal__body">{children}</div>

        {footer && <div className="app-modal__footer">{footer}</div>}
      </div>
    </div>
  );
}
