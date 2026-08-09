import { useState } from 'react';
import './Modal.css';

export default function StockModal({ product, onSave, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    lot_number:  '',
    quantity:    '',
    entry_date:  today,
    expiry_date: '',
  });
  const [errors,  setErrors]  = useState([]);
  const [saving,  setSaving]  = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors([]);
    try {
      await onSave(product.id, {
        ...form,
        quantity:    Number(form.quantity),
        expiry_date: form.expiry_date || null,
      });
      onClose();
    } catch (err) {
      setErrors(err.errors ?? [err.error ?? 'Error al registrar lote']);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal__header">
          <h2>Ingresar lote de stock</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </header>
        <p className="modal__subtitle">Producto: <strong>{product.name}</strong></p>

        {errors.length > 0 && (
          <ul className="modal__errors">
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        )}

        <form onSubmit={handleSubmit} className="modal__form">
          <label className="modal__label">
            Número de lote *
            <input
              name="lot_number"
              value={form.lot_number}
              onChange={handleChange}
              required
              placeholder="Ej: LOTE-2026-001"
              className="modal__input"
            />
          </label>
          <label className="modal__label">
            Cantidad *
            <input
              name="quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={handleChange}
              required
              placeholder="Ej: 50"
              className="modal__input"
            />
          </label>
          <label className="modal__label">
            Fecha de ingreso *
            <input
              name="entry_date"
              type="date"
              value={form.entry_date}
              onChange={handleChange}
              required
              className="modal__input"
            />
          </label>
          <label className="modal__label">
            Fecha de vencimiento (opcional)
            <input
              name="expiry_date"
              type="date"
              value={form.expiry_date}
              onChange={handleChange}
              className="modal__input"
            />
          </label>

          <div className="modal__actions">
            <button type="button" className="modal__btn modal__btn--cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="modal__btn modal__btn--save" disabled={saving}>
              {saving ? 'Registrando…' : 'Registrar lote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
