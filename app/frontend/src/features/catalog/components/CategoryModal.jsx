import { useState, useEffect } from 'react';
import './Modal.css';

export default function CategoryModal({ category, onSave, onClose }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (category) setForm({ name: category.name, description: category.description ?? '' });
  }, [category]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors([]);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setErrors(err.errors ?? [err.error ?? 'Error al guardar']);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal__header">
          <h2>{category ? 'Editar categoría' : 'Nueva categoría'}</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </header>

        {errors.length > 0 && (
          <ul className="modal__errors">
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        )}

        <form onSubmit={handleSubmit} className="modal__form">
          <label className="modal__label">
            Nombre *
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Ej: Pizzas"
              className="modal__input"
            />
          </label>
          <label className="modal__label">
            Descripción
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Descripción opcional..."
              className="modal__input"
            />
          </label>
          <div className="modal__actions">
            <button type="button" className="modal__btn modal__btn--cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="modal__btn modal__btn--save" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
