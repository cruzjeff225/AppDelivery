import { useState, useEffect } from 'react';
import { userService } from '../services/user.service';
import { CleanModal } from '../../../components/CleanModal';
import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal';
import { useSileoNotification } from '../../../context/SileoNotificationContext';
import { Plus, Search, Pencil, Trash2, UserPlus } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
      password: '',
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
      password: '',
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
    if (!formData.email.trim()) errs.email = 'El correo electronico es obligatorio';
    if (!userToEdit && (!formData.password || formData.password.length < 6)) {
      errs.password = 'La contrasena debe tener al menos 6 caracteres';
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
        showSuccess(`Usuario '${formData.name}' actualizado correctamente`, 'Usuario actualizado');
      } else {
        await userService.createUser(formData);
        showSuccess(`Usuario '${formData.name}' creado correctamente`, 'Nuevo usuario');
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
      showSuccess(`Usuario '${userToDelete.name}' eliminado correctamente`, 'Usuario eliminado');
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

  const isEditing = Boolean(userToEdit);

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2 className="page-header__title">Gestion de Usuarios</h2>
          <p className="page-header__subtitle">
            Administracion de cuentas, correos y roles del sistema.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn--primary btn--lg" style={{ gap: '6px' }}>
          <Plus size={16} /> Nuevo usuario
        </button>
      </div>

      <div className="search-bar" style={{ marginBottom: '20px' }}>
        <Search size={16} color="#94a3b8" />
        <input
          type="text"
          placeholder="Buscar por nombre, correo o telefono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setAppliedSearch(searchTerm)}
        />
        <button
          onClick={() => setAppliedSearch(searchTerm)}
          className="btn btn--primary btn--sm"
        >
          Buscar
        </button>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Telefono</th>
              <th>Rol</th>
              <th>Acciones</th>
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
                <tr key={user.id}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{user.name}</td>
                  <td>{user.email}</td>
                  <td style={{ color: '#64748b' }}>{user.phone || 'N/A'}</td>
                  <td>
                    <span
                      className={`badge ${
                        user.role === 'admin' ? 'badge--success' : 'badge--info'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="btn btn--secondary btn--sm"
                        style={{ gap: '4px' }}
                      >
                        <Pencil size={12} /> Editar
                      </button>
                      <button
                        onClick={() => handleOpenDelete(user)}
                        className="btn btn--danger btn--sm"
                        style={{ gap: '4px' }}
                      >
                        <Trash2 size={12} /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CleanModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={isEditing ? 'Editar usuario' : 'Nuevo usuario'}
        subtitle={
          isEditing
            ? 'Modifica los datos y rol del usuario.'
            : 'Ingresa los datos requeridos para crear la cuenta.'
        }
        icon={<UserPlus size={20} />}
        maxWidth="680px"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="btn btn--secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="user-form"
              disabled={submitting}
              className="btn btn--primary"
            >
              {submitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Guardar usuario'}
            </button>
          </>
        }
      >
        <form id="user-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-section__header">
              <h4 className="form-section__title">Informacion del usuario</h4>
              <p className="form-section__desc">Datos principales de la cuenta.</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label form-label--required">Nombre completo</label>
                <input
                  type="text"
                  placeholder="Ej. Juan Perez"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`form-input ${formErrors.name ? 'form-input--error' : ''}`}
                />
                {formErrors.name && <div className="form-error">{formErrors.name}</div>}
              </div>

              <div className="form-group">
                <label className="form-label form-label--required">Correo electronico</label>
                <input
                  type="email"
                  placeholder="Ej. correo@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`form-input ${formErrors.email ? 'form-input--error' : ''}`}
                />
                {formErrors.email && <div className="form-error">{formErrors.email}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Telefono</label>
                <input
                  type="text"
                  placeholder="Ej. +503 7000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rol</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="form-select"
                >
                  <option value="customer">Cliente (Customer)</option>
                  <option value="admin">Administrador (Admin)</option>
                  <option value="delivery">Repartidor (Delivery)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section__header">
              <h4 className="form-section__title">Seguridad</h4>
            </div>

            <div className="form-group" style={{ maxWidth: '320px' }}>
              <label className="form-label">
                {isEditing ? 'Nueva contrasena (opcional)' : 'Contrasena'}
                {!isEditing && <span style={{ color: '#ef4444' }}> *</span>}
              </label>
              <input
                type="password"
                placeholder={
                  isEditing
                    ? 'Dejar en blanco para conservar la actual'
                    : 'Minimo 6 caracteres'
                }
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`form-input ${formErrors.password ? 'form-input--error' : ''}`}
              />
              {formErrors.password && (
                <div className="form-error">{formErrors.password}</div>
              )}
            </div>
          </div>
        </form>
      </CleanModal>

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
