import { useState, useEffect } from 'react';
import { UPLOADS_URL } from '../../../config/api';
import './Modal.css';

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
        <header className="modal__header">
          <h2>{product ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </header>

        {errors.length > 0 && (
          <ul className="modal__errors">
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        )}

        <form onSubmit={handleSubmit} className="modal__form">
          <div className="modal__two-col">
            <div className="modal__col">
              <label className="modal__label">
                Categoría *
                <select name="category_id" value={form.category_id} onChange={handleChange} required className="modal__input">
                  <option value="">Selecciona una categoría</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>
              <label className="modal__label">
                Nombre *
                <input name="name" value={form.name} onChange={handleChange} required placeholder="Nombre del producto" className="modal__input" />
              </label>
              <label className="modal__label">
                Precio *
                <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required placeholder="0.00" className="modal__input" />
              </label>
              <label className="modal__label">
                Descripción
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Descripción del producto..." className="modal__input" />
              </label>
              <label className="modal__label modal__label--checkbox">
                <input name="is_available" type="checkbox" checked={form.is_available} onChange={handleChange} />
                Disponible en el catálogo
              </label>
            </div>

            <div className="modal__col">
              <label className="modal__label">Imagen</label>
              <div className="modal__image-preview">
                {imagePreview
                  ? <img src={imagePreview} alt="Preview" />
                  : <span>📷 Sin imagen</span>}
              </div>
              <input type="file" accept="image/*" onChange={handleImage} className="modal__file" />
            </div>
          </div>

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
