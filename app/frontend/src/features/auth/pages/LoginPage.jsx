import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import { useSileoNotification } from '../../../context/SileoNotificationContext';
import { Mail, Lock, LogIn } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showSuccess, showError } = useSileoNotification();

  const [formData, setFormData] = useState({ email: '', password: '' });
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
    if (!formData.email.trim()) errs.email = 'El correo electronico es obligatorio';
    if (!formData.password) errs.password = 'La contrasena es obligatoria';
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
      const user = await login(formData);
      showSuccess(`Bienvenido, ${user.name}`, 'Sesion iniciada');
      const redirectTo = location.state?.from || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error('Error al iniciar sesion:', err);
      const msg = err.response?.data?.error || 'Credenciales invalidas.';
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
          <LogIn size={24} />
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
          Iniciar sesion
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
          Ingresa tus credenciales para continuar.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
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

        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label form-label--required">Contrasena</label>
          <div className="form-input-wrap">
            <span className="form-input-icon"><Lock size={15} /></span>
            <input
              type="password"
              name="password"
              placeholder="Tu contrasena"
              value={formData.password}
              onChange={handleChange}
              className={`form-input form-input--icon ${errors.password ? 'form-input--error' : ''}`}
            />
          </div>
          {errors.password && <div className="form-error">{errors.password}</div>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn--primary btn--lg"
          style={{ width: '100%' }}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
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
        No tienes cuenta?{' '}
        <Link
          to="/register"
          style={{
            color: '#10b981',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Crear cuenta
        </Link>
      </div>
    </div>
  );
}
