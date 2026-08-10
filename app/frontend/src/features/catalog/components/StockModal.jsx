import { useState } from 'react';
import { CleanModal } from '../../../components/CleanModal';

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
    <CleanModal
      isOpen={true}
      onClose={onClose}
      title="Ingresar Lote de Stock"
      subtitle={`Producto seleccionado: ${product?.name}`}
      icon="📦"
      maxWidth="600px"
    >
      {errors.length > 0 && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '0.85rem' }}>
          {errors.map((e, i) => <div key={i}>⚠️ {e}</div>)}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
              NÚMERO DE LOTE *
            </label>
            <input
              name="lot_number"
              value={form.lot_number}
              onChange={handleChange}
              required
              placeholder="Ej. LOTE-2026-001"
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

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
              CANTIDAD (UNIDADES) *
            </label>
            <input
              name="quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={handleChange}
              required
              placeholder="Ej. 50"
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

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
              FECHA DE INGRESO *
            </label>
            <input
              name="entry_date"
              type="date"
              value={form.entry_date}
              onChange={handleChange}
              required
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

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
              FECHA DE VENCIMIENTO (OPCIONAL)
            </label>
            <input
              name="expiry_date"
              type="date"
              value={form.expiry_date}
              onChange={handleChange}
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
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
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
            {saving ? 'Registrando…' : 'Registrar Lote'}
          </button>
        </div>
      </form>
    </CleanModal>
  );
}
