import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useSileoNotification } from '../../../context/SileoNotificationContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useSileoNotification();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      showError('Por favor completa los campos obligatorios (*).');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showError('Las contraseñas no coinciden.');
      return;
    }

    if (formData.password.length < 8) {
      showError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      showSuccess('¡Cuenta de cliente creada exitosamente!', 'Registro Exitoso 🛵');
      setTimeout(() => {
        navigate('/catalog');
      }, 1500);
    } catch (err) {
      console.error('Error al registrar usuario:', err);
      const msg = err.response?.data?.error || err.response?.data?.errors?.join(', ') || 'Error al procesar el registro.';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '30px auto', padding: '32px 28px', backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 12px auto' }}>
          🛵
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '6px', color: '#0f172a' }}>
          Crear Cuenta en Delivery
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
          Regístrate como cliente para realizar pedidos rápidamente.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
            NOMBRE COMPLETO *
          </label>
          <input
            type="text"
            name="name"
            placeholder="Ej. Juan Pérez"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
            CORREO ELECTRÓNICO *
          </label>
          <input
            type="email"
            name="email"
            placeholder="correo@ejemplo.com"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
            TELÉFONO DE CONTACTO
          </label>
          <input
            type="tel"
            name="phone"
            placeholder="Ej. +503 7000-0000"
            value={formData.phone}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
            CONTRASEÑA * (MÍNIMO 8 CARACTERES)
          </label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
            CONFIRMAR CONTRASEÑA *
          </label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#064e3b',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '0.95rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 14px rgba(6, 78, 59, 0.3)'
          }}
        >
          {loading ? 'Registrando...' : 'Crear mi Cuenta'}
        </button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
        ¿Quieres explorar el catálogo primero?{' '}
        <Link to="/catalog" style={{ color: '#10b981', fontWeight: '700', textDecoration: 'none' }}>
          Ir al Catálogo →
        </Link>
      </div>
    </div>
  );
}
