import { useState, useEffect } from 'react';
import { UPLOADS_URL } from '../../../config/api';
import { CleanModal } from '../../../components/CleanModal';

export default function ProductModal({ product, categories, onSave, onClose }) {
  const [form, setForm] = useState({
    category_id:  '',
    name:         '',
    description:  '',
    price:        '',
    is_available: true,
  });
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors,       setErrors]       = useState([]);
  const [saving,       setSaving]       = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        category_id:  product.category_id ?? '',
        name:         product.name ?? '',
        description:  product.description ?? '',
        price:        product.price ?? '',
        is_available: product.is_available ?? true,
      });
      if (product.image_path)
        setImagePreview(`${UPLOADS_URL}/${product.image_path}`);
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors([]);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);
      await onSave(fd);
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
      title={product ? 'Editar Producto' : 'Registrar Nuevo Producto'}
      subtitle={product ? 'Modifica los datos del producto o su imagen.' : 'Ingresa la información requerida para el catálogo.'}
      icon={product ? '✏️' : '🛍️'}
      maxWidth="720px"
    >
      {errors.length > 0 && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '0.85rem' }}>
          {errors.map((e, i) => <div key={i}>⚠️ {e}</div>)}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          {/* Left Column Fields */}
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                CATEGORÍA *
              </label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                NOMBRE DEL PRODUCTO *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Ej. Pizza Pepperoni Familiar"
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

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                PRECIO ($) *
              </label>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={handleChange}
                required
                placeholder="Ej. 12.99"
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

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                DESCRIPCIÓN
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Descripción detallada del producto..."
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                name="is_available"
                type="checkbox"
                checked={form.is_available}
                onChange={handleChange}
                id="checkAvailable"
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="checkAvailable" style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
                Producto Disponible en Catálogo
              </label>
            </div>
          </div>

          {/* Right Column Image Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>
              IMAGEN DEL PRODUCTO
            </label>
            <div
              style={{
                width: '100%',
                height: '200px',
                borderRadius: '14px',
                border: '2px dashed #cbd5e1',
                backgroundColor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>📷 Sin imagen seleccionada</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              style={{
                fontSize: '0.85rem',
                color: '#475569'
              }}
            />
          </div>
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
            {saving ? 'Guardando…' : product ? 'Guardar Cambios' : 'Guardar Producto'}
          </button>
        </div>
      </form>
    </CleanModal>
  );
}
