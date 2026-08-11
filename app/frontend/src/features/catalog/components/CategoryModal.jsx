import { useState, useEffect } from 'react';
import { CleanModal } from '../../../components/CleanModal';
import { Tag, AlertCircle } from 'lucide-react';

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

  const isEditing = Boolean(category);

  return (
    <CleanModal
      isOpen={true}
      onClose={onClose}
      title={isEditing ? 'Editar categoria' : 'Nueva categoria'}
      subtitle={
        isEditing
          ? 'Modifica los datos de la categoria.'
          : 'Agrega una nueva categoria al catalogo.'
      }
      icon={<Tag size={20} />}
      maxWidth="520px"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn--secondary">
            Cancelar
          </button>
          <button
            type="submit"
            form="category-form"
            disabled={saving}
            className="btn btn--primary"
          >
            {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Guardar categoria'}
          </button>
        </>
      }
    >
      {errors.length > 0 && (
        <div className="form-errors-summary">
          {errors.map((err, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} /> {err}
            </div>
          ))}
        </div>
      )}

      <form id="category-form" onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label form-label--required">Nombre de la categoria</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Ej. Pizzas, Bebidas, Postres"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Descripcion</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Ej. Deliciosas pizzas artesanales horneadas a la lena"
            className="form-textarea"
          />
          <span className="form-helper">Opcional. Una breve descripcion de la categoria.</span>
        </div>
      </form>
    </CleanModal>
  );
}
