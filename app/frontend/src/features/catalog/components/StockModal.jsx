import { useState } from 'react';
import { CleanModal } from '../../../components/CleanModal';
import { Boxes, AlertCircle } from 'lucide-react';

export default function StockModal({ product, onSave, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    lot_number: '',
    quantity: '',
    entry_date: today,
    expiry_date: '',
  });
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors([]);
    try {
      await onSave(product.id, {
        ...form,
        quantity: Number(form.quantity),
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
    <CleanModal
      isOpen={true}
      onClose={onClose}
      title="Ingresar lote de stock"
      subtitle={`Producto: ${product?.name}`}
      icon={<Boxes size={20} />}
      maxWidth="600px"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn--secondary">
            Cancelar
          </button>
          <button
            type="submit"
            form="stock-form"
            disabled={saving}
            className="btn btn--primary"
          >
            {saving ? 'Registrando...' : 'Registrar lote'}
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

      <form id="stock-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label form-label--required">Numero de lote</label>
            <input
              name="lot_number"
              value={form.lot_number}
              onChange={handleChange}
              required
              placeholder="Ej. LOTE-2026-001"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label form-label--required">Cantidad (unidades)</label>
            <input
              name="quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={handleChange}
              required
              placeholder="Ej. 50"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label form-label--required">Fecha de ingreso</label>
            <input
              name="entry_date"
              type="date"
              value={form.entry_date}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Fecha de vencimiento</label>
            <input
              name="expiry_date"
              type="date"
              value={form.expiry_date}
              onChange={handleChange}
              className="form-input"
            />
            <span className="form-helper">Opcional. Solo si el producto es perecedero.</span>
          </div>
        </div>
      </form>
    </CleanModal>
  );
}
