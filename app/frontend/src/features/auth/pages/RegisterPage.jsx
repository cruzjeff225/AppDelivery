import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useSileoNotification } from '../../../context/SileoNotificationContext';
import { User, Mail, Phone, Lock } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useSileoNotification();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'El nombre es obligatorio';
    if (!formData.email.trim()) errs.email = 'El correo electronico es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = 'Ingresa un correo electronico valido';
    if (!formData.password) errs.password = 'La contrasena es obligatoria';
    else if (formData.password.length < 8)
      errs.password = 'La contrasena debe tener al menos 8 caracteres';
    if (formData.password !== formData.confirmPassword)
      errs.confirmPassword = 'Las contrasenas no coinciden';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      showSuccess('Cuenta de cliente creada exitosamente', 'Registro exitoso');
      setTimeout(() => navigate('/catalog'), 1500);
    } catch (err) {
      console.error('Error al registrar usuario:', err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.errors?.join(', ') ||
        'Error al procesar el registro.';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '440px',
        margin: '30px auto',
        padding: '32px 30px',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #f1f5f9',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: '#ecfdf5',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px auto',
          }}
        >
          <User size={24} />
        </div>
        <h2
          style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 6px 0',
            letterSpacing: '-0.02em',
          }}
        >
          Crear cuenta
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
          Registrate como cliente para realizar pedidos rapidamente.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label className="form-label form-label--required">Nombre completo</label>
          <div className="form-input-wrap">
            <span className="form-input-icon"><User size={15} /></span>
            <input
              type="text"
              name="name"
              placeholder="Ej. Juan Perez"
              value={formData.name}
              onChange={handleChange}
              className={`form-input form-input--icon ${errors.name ? 'form-input--error' : ''}`}
            />
          </div>
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>

        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label className="form-label form-label--required">Correo electronico</label>
          <div className="form-input-wrap">
            <span className="form-input-icon"><Mail size={15} /></span>
            <input
              type="email"
              name="email"
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
              className={`form-input form-input--icon ${errors.email ? 'form-input--error' : ''}`}
            />
          </div>
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>

        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label className="form-label">Telefono de contacto</label>
          <div className="form-input-wrap">
            <span className="form-input-icon"><Phone size={15} /></span>
            <input
              type="tel"
              name="phone"
              placeholder="Ej. +503 7000-0000"
              value={formData.phone}
              onChange={handleChange}
              className="form-input form-input--icon"
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label className="form-label form-label--required">Contrasena</label>
          <div className="form-input-wrap">
            <span className="form-input-icon"><Lock size={15} /></span>
            <input
              type="password"
              name="password"
              placeholder="Minimo 8 caracteres"
              value={formData.password}
              onChange={handleChange}
              className={`form-input form-input--icon ${errors.password ? 'form-input--error' : ''}`}
            />
          </div>
          {errors.password && <div className="form-error">{errors.password}</div>}
        </div>

        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label form-label--required">Confirmar contrasena</label>
          <div className="form-input-wrap">
            <span className="form-input-icon"><Lock size={15} /></span>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Repite tu contrasena"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-input form-input--icon ${errors.confirmPassword ? 'form-input--error' : ''}`}
            />
          </div>
          {errors.confirmPassword && (
            <div className="form-error">{errors.confirmPassword}</div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn--primary btn--lg"
          style={{ width: '100%' }}
        >
          {loading ? 'Registrando...' : 'Crear mi cuenta'}
        </button>
      </form>

      <div
        style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: '#64748b',
        }}
      >
        Quieres explorar el catalogo primero?{' '}
        <Link
          to="/catalog"
          style={{
            color: '#10b981',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Ir al Catalogo
        </Link>
      </div>
    </div>
  );
}
