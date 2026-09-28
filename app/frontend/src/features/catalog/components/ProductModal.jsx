import { useState, useEffect } from 'react';
import { UPLOADS_URL } from '../../../config/api';
import { CleanModal } from '../../../components/CleanModal';
import { Package, Upload, AlertCircle } from 'lucide-react';

export default function ProductModal({ product, categories, onSave, onClose }) {
  const [form, setForm] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    is_available: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        category_id: product.category_id ?? '',
        name: product.name ?? '',
        description: product.description ?? '',
        price: product.price ?? '',
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

  const isEditing = Boolean(product);

  return (
    <CleanModal
      isOpen={true}
      onClose={onClose}
      title={isEditing ? 'Editar producto' : 'Nuevo producto'}
      subtitle={
        isEditing
          ? 'Modifica los datos del producto o su imagen.'
          : 'Agrega la informacion necesaria para registrar el producto.'
      }
      icon={<Package size={20} />}
      maxWidth="720px"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn--secondary">
            Cancelar
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={saving}
            className="btn btn--primary"
          >
            {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Guardar producto'}
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

      <form id="product-form" onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label form-label--required">Categoria</label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="">Seleccionar categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label form-label--required">Nombre del producto</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Ej. Pizza Pepperoni Familiar"
                className="form-input"
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label form-label--required">Precio</label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.price}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  className="form-input"
                />
                <span className="form-helper">Precio sin IVA, mayor a $0.00.</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Descripcion</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Descripcion detallada del producto..."
                className="form-textarea"
              />
            </div>

            <div className="form-checkbox">
              <input
                name="is_available"
                type="checkbox"
                checked={form.is_available}
                onChange={handleChange}
                id="checkAvailable"
              />
              <label htmlFor="checkAvailable" className="form-checkbox__label">
                Producto disponible en catalogo
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label className="form-label">Imagen del producto</label>
            <label
              className="form-image-upload"
              style={{ cursor: 'pointer' }}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" />
              ) : (
                <>
                  <div className="form-image-upload__icon">
                    <Upload size={28} />
                  </div>
                  <div className="form-image-upload__text">Agregar imagen</div>
                  <div className="form-image-upload__hint">PNG, JPG o WEBP</div>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                style={{ display: 'none' }}
              />
            </label>
            {imagePreview && (
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="btn btn--ghost btn--sm"
              >
                Quitar imagen
              </button>
            )}
          </div>
        </div>
      </form>
    </CleanModal>
  );
}
