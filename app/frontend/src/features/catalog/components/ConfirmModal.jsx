import './Modal.css';
import './ConfirmModal.css';

export default function ConfirmModal({ title = 'Confirmar acción', message, onConfirm, onClose, confirmText = 'Confirmar', cancelText = 'Cancelar' }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--confirm" onClick={(e) => e.stopPropagation()}>
        <header className="modal__header">
          <h2>{title}</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </header>

        <div className="modal__body-confirm">
          <p>{message}</p>
        </div>

        <div className="modal__actions">
          <button type="button" className="modal__btn modal__btn--cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button type="button" className="modal__btn modal__btn--danger" onClick={() => { onConfirm(); onClose(); }}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
