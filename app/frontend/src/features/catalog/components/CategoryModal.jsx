import { useState, useEffect } from 'react';
import { CleanModal } from '../../../components/CleanModal';

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
    <CleanModal
      isOpen={true}
      onClose={onClose}
      title={category ? 'Editar Categoría' : 'Registrar Nueva Categoría'}
      subtitle={category ? 'Modifica los datos de la categoría.' : 'Ingresa la información para la nueva categoría.'}
      icon={category ? '✏️' : '🏷️'}
      maxWidth="560px"
    >
      {errors.length > 0 && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '0.85rem' }}>
          {errors.map((e, i) => <div key={i}>⚠️ {e}</div>)}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
            NOMBRE DE LA CATEGORÍA *
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Ej. Pizzas, Bebidas, Postres"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
            DESCRIPCIÓN (OPCIONAL)
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Ej. Deliciosas pizzas artesanales horneadas a la leña"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#064e3b',
              color: '#ffffff',
              fontWeight: '700',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            {saving ? 'Guardando…' : category ? 'Guardar Cambios' : 'Guardar Categoría'}
          </button>
        </div>
      </form>
    </CleanModal>
  );
}
