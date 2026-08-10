import { useState, useEffect } from 'react';
import { userService } from '../services/user.service';
import { CleanModal } from '../../../components/CleanModal';
import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal';
import { useSileoNotification } from '../../../context/SileoNotificationContext';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { showSuccess, showError } = useSileoNotification();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      showError('Error al cargar la lista de usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenCreate = () => {
    setUserToEdit(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'customer',
      password: ''
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setUserToEdit(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'customer',
      password: ''
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'El nombre es obligatorio';
    if (!formData.email.trim()) errs.email = 'El correo electrónico es obligatorio';
    if (!userToEdit && (!formData.password || formData.password.length < 6)) {
      errs.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      if (userToEdit) {
        await userService.updateUser(userToEdit.id, formData);
        showSuccess(`Usuario '${formData.name}' actualizado correctamente`, 'Usuario Actualizado');
      } else {
        await userService.createUser(formData);
        showSuccess(`Usuario '${formData.name}' creado correctamente`, 'Nuevo Usuario');
      }
      setIsFormModalOpen(false);
      loadUsers();
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.error || 'Error al guardar el usuario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await userService.deleteUser(userToDelete.id);
      showSuccess(`Usuario '${userToDelete.name}' eliminado correctamente`, 'Usuario Eliminado');
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      loadUsers();
    } catch (err) {
      console.error(err);
      showError('Error al eliminar el usuario');
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = appliedSearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.phone?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ width: '100%' }}>
      {/* Header (Imagen 1 Reference Layout) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
            Gestión de Usuarios
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Administración de cuentas, correos y roles del sistema.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: '#064e3b',
            color: '#ffffff',
            borderRadius: '999px',
            fontWeight: '700',
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(6, 78, 59, 0.3)',
            transition: 'all 0.2s ease'
          }}
        >
          + Nuevo Usuario
        </button>
      </div>

      {/* Search Bar (Imagen 1 Reference Layout) */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '12px 20px',
          marginBottom: '24px',
          border: '1px solid #f1f5f9',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}
      >
        <input
          type="text"
          placeholder="Buscar por nombre, correo o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setAppliedSearch(searchTerm)}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '0.925rem',
            color: '#0f172a',
            backgroundColor: 'transparent'
          }}
        />
        <button
          onClick={() => setAppliedSearch(searchTerm)}
          style={{
            padding: '8px 20px',
            backgroundColor: '#064e3b',
            color: '#ffffff',
            borderRadius: '10px',
            border: 'none',
            fontWeight: '700',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          Buscar
        </button>
      </div>

      {/* Table Container (Imagen 1 Reference Layout) */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #f1f5f9',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          overflow: 'hidden'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                NOMBRE
              </th>
              <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                CORREO
              </th>
              <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                TELÉFONO
              </th>
              <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                ROL
              </th>
              <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                ACCIONES
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  Cargando usuarios...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  No se encontraron usuarios registrados.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 20px', fontWeight: '600', color: '#0f172a' }}>
                    {user.name}
                  </td>
                  <td style={{ padding: '16px 20px', color: '#334155' }}>
                    {user.email}
                  </td>
                  <td style={{ padding: '16px 20px', color: '#64748b' }}>
                    {user.phone || 'N/A'}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: user.role === 'admin' ? '#ecfdf5' : '#f0f9ff',
                        color: user.role === 'admin' ? '#047857' : '#0284c7'
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenEdit(user)}
                        title="Editar Usuario"
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: '#f1f5f9',
                          color: '#0284c7',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.8rem'
                        }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleOpenDelete(user)}
                        title="Eliminar Usuario"
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: '#fff1f2',
                          color: '#e11d48',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.8rem'
                        }}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Crear / Editar (Imagen 2 & 4 Grid Reference) */}
      <CleanModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={userToEdit ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
        subtitle={userToEdit ? 'Modifica los datos y rol del usuario.' : 'Ingresa todos los datos requeridos para la cuenta.'}
        icon={userToEdit ? '✏️' : '➕'}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                NOMBRE COMPLETO *
              </label>
              <input
                type="text"
                placeholder="Ej. Juan Pérez"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: formErrors.name ? '1px solid #ef4444' : '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {formErrors.name && <small style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.name}</small>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                CORREO ELECTRÓNICO *
              </label>
              <input
                type="email"
                placeholder="Ej. correo@ejemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: formErrors.email ? '1px solid #ef4444' : '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {formErrors.email && <small style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.email}</small>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                TELÉFONO
              </label>
              <input
                type="text"
                placeholder="Ej. +503 7000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                ROL
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="customer">Cliente (Customer)</option>
                <option value="admin">Administrador (Admin)</option>
                <option value="delivery">Repartidor (Delivery)</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
              {userToEdit ? 'NUEVA CONTRASEÑA (OPCIONAL)' : 'CONTRASEÑA *'}
            </label>
            <input
              type="password"
              placeholder={userToEdit ? 'Dejar en blanco para conservar la contraseña actual' : 'Mínimo 6 caracteres'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: formErrors.password ? '1px solid #ef4444' : '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {formErrors.password && <small style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.password}</small>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
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
              disabled={submitting}
              style={{
                padding: '10px 24px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#064e3b',
                color: '#ffffff',
                fontWeight: '700',
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'Guardando...' : userToEdit ? 'Guardar Cambios' : 'Guardar Usuario'}
            </button>
          </div>
        </form>
      </CleanModal>

      {/* Modal Confirmar Eliminación (Imagen 3 Warning Reference) */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={userToDelete?.name}
        loading={deleting}
      />
    </div>
  );
}
