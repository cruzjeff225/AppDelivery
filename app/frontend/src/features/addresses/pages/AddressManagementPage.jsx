import { useState, useEffect } from 'react';
import { useAddresses } from '../hooks/useAddresses';
import { locationService } from '../services/location.service';
import { CleanModal } from '../../../components/CleanModal';
import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal';
import { useSileoNotification } from '../../../context/SileoNotificationContext';
import { MapPin, Plus, Search, Pencil, Trash2, Star } from 'lucide-react';

export function AddressManagementPage() {
  const {
    addresses,
    loading,
    addAddress,
    editAddress,
    setDefaultAddress,
    removeAddress,
  } = useAddresses();

  const { showSuccess, showError } = useSileoNotification();

  const [departments, setDepartments] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState(null);
  const [formData, setFormData] = useState({
    receiverName: '',
    receiverPhone: '',
    title: '',
    state: '',
    city: '',
    postalCode: '',
    addressLine1: '',
    addressLine2: '',
    isDefault: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [addressToDelete, setAddressToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadDepts() {
      try {
        const depts = await locationService.getDepartments();
        setDepartments(depts);
      } catch (err) {
        console.error('Error al cargar departamentos:', err);
      }
    }
    loadDepts();
  }, []);

  useEffect(() => {
    async function loadMunis() {
      if (!formData.state) {
        setMunicipalities([]);
        return;
      }
      setLoadingLocations(true);
      try {
        const munis = await locationService.getMunicipalities(formData.state);
        setMunicipalities(munis);
      } catch (err) {
        console.error('Error al cargar municipios:', err);
      } finally {
        setLoadingLocations(false);
      }
    }
    loadMunis();
  }, [formData.state]);

  const handleOpenCreate = () => {
    setAddressToEdit(null);
    setFormData({
      receiverName: '',
      receiverPhone: '',
      title: '',
      state: '',
      city: '',
      postalCode: '',
      addressLine1: '',
      addressLine2: '',
      isDefault: addresses.length === 0,
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setAddressToEdit(addr);
    setFormData({
      receiverName: addr.receiverName || addr.full_name || '',
      receiverPhone: addr.receiverPhone || addr.phone || '',
      title: addr.title || '',
      state: addr.state || '',
      city: addr.city || '',
      postalCode: addr.postalCode || addr.postal_code || '',
      addressLine1: addr.addressLine1 || addr.address_line1 || '',
      addressLine2: addr.addressLine2 || addr.address_line2 || '',
      isDefault: addr.isDefault || addr.is_default || false,
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (addr) => {
    setAddressToDelete(addr);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'state') {
      setFormData((prev) => ({ ...prev, state: value, city: '' }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.receiverName.trim()) errs.receiverName = 'Ingresa el nombre del destinatario';
    if (!formData.receiverPhone.trim()) errs.receiverPhone = 'Ingresa el telefono de contacto';
    if (!formData.state) errs.state = 'Selecciona un departamento';
    if (!formData.city) errs.city = 'Selecciona un municipio';
    if (!formData.addressLine1.trim()) errs.addressLine1 = 'Ingresa la calle o direccion principal';
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
      const payload = {
        ...formData,
        title: formData.title || `${formData.city}, ${formData.state}`,
      };
      if (addressToEdit) {
        await editAddress(addressToEdit.id, payload);
        showSuccess('Direccion actualizada correctamente', 'Direccion actualizada');
      } else {
        await addAddress(payload);
        showSuccess('Nueva direccion registrada correctamente', 'Direccion guardada');
      }
      setIsFormModalOpen(false);
    } catch {
      showError('Error al guardar la direccion');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (addr) => {
    try {
      await setDefaultAddress(addr.id);
      showSuccess(
        `'${addr.title || addr.city}' fijada como predeterminada`,
        'Direccion predeterminada'
      );
    } catch {
      showError('Error al establecer direccion predeterminada');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!addressToDelete) return;
    setDeleting(true);
    try {
      await removeAddress(addressToDelete.id);
      showSuccess('Direccion eliminada correctamente', 'Direccion eliminada');
      setAddressToDelete(null);
    } catch {
      showError('Error al eliminar la direccion');
    } finally {
      setDeleting(false);
    }
  };

  const filteredAddresses = addresses.filter((a) => {
    const term = appliedSearch.toLowerCase();
    const name = (a.receiverName || a.full_name || '').toLowerCase();
    const title = (a.title || '').toLowerCase();
    const city = (a.city || '').toLowerCase();
    const state = (a.state || '').toLowerCase();
    const addressLine1 = (a.addressLine1 || a.address_line1 || '').toLowerCase();
    return (
      name.includes(term) ||
      title.includes(term) ||
      city.includes(term) ||
      state.includes(term) ||
      addressLine1.includes(term)
    );
  });

  const isEditing = Boolean(addressToEdit);

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2 className="page-header__title">Gestion de Direcciones</h2>
          <p className="page-header__subtitle">
            Administracion de ubicaciones y direcciones de entrega.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn--primary btn--lg" style={{ gap: '6px' }}>
          <Plus size={16} /> Nueva direccion
        </button>
      </div>

      <div className="search-bar" style={{ marginBottom: '20px' }}>
        <Search size={16} color="#94a3b8" />
        <input
          type="text"
          placeholder="Buscar por etiqueta, destinatario, ciudad o departamento..."
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
              <th>Etiqueta</th>
              <th>Destinatario</th>
              <th>Telefono</th>
              <th>Direccion</th>
              <th>Ubicacion</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  Cargando direcciones...
                </td>
              </tr>
            ) : filteredAddresses.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  No hay direcciones registradas. Crea la primera!
                </td>
              </tr>
            ) : (
              filteredAddresses.map((addr) => {
                const isDef = addr.isDefault || addr.is_default;
                return (
                  <tr key={addr.id}>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>
                      <MapPin
                        size={14}
                        style={{
                          marginRight: '4px',
                          verticalAlign: 'middle',
                          color: '#10b981',
                        }}
                      />
                      {addr.title || 'Direccion'}
                    </td>
                    <td>{addr.receiverName || addr.full_name || 'N/A'}</td>
                    <td style={{ color: '#64748b' }}>
                      {addr.receiverPhone || addr.phone || 'N/A'}
                    </td>
                    <td>
                      {addr.addressLine1 || addr.address_line1}
                      {(addr.addressLine2 || addr.address_line2) && (
                        <div style={{ fontSize: '0.775rem', color: '#94a3b8' }}>
                          {addr.addressLine2 || addr.address_line2}
                        </div>
                      )}
                    </td>
                    <td style={{ color: '#475569' }}>
                      {addr.city}, {addr.state}
                    </td>
                    <td>
                      {isDef ? (
                        <span className="badge badge--success">
                          <Star size={10} style={{ marginRight: '3px' }} />
                          Predeterminada
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetDefault(addr)}
                          className="btn btn--ghost btn--sm"
                        >
                          Fijar como principal
                        </button>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenEdit(addr)}
                          className="btn btn--secondary btn--sm"
                          style={{ gap: '4px' }}
                        >
                          <Pencil size={12} /> Editar
                        </button>
                        <button
                          onClick={() => handleOpenDelete(addr)}
                          className="btn btn--danger btn--sm"
                          style={{ gap: '4px' }}
                        >
                          <Trash2 size={12} /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <CleanModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={isEditing ? 'Editar direccion' : 'Nueva direccion'}
        subtitle={
          isEditing
            ? 'Modifica los datos de la ubicacion de entrega.'
            : 'Ingresa la informacion requerida para el envio.'
        }
        icon={<MapPin size={20} />}
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
              form="address-form"
              disabled={submitting}
              className="btn btn--primary"
            >
              {submitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Guardar direccion'}
            </button>
          </>
        }
      >
        <form id="address-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-section__header">
              <h4 className="form-section__title">Informacion del destinatario</h4>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label form-label--required">Nombre y apellido</label>
                <input
                  type="text"
                  name="receiverName"
                  placeholder="Ej. Juan Perez"
                  value={formData.receiverName}
                  onChange={handleChange}
                  className={`form-input ${formErrors.receiverName ? 'form-input--error' : ''}`}
                />
                {formErrors.receiverName && (
                  <div className="form-error">{formErrors.receiverName}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label form-label--required">Telefono de contacto</label>
                <input
                  type="text"
                  name="receiverPhone"
                  placeholder="Ej. +503 7000-0000"
                  value={formData.receiverPhone}
                  onChange={handleChange}
                  className={`form-input ${formErrors.receiverPhone ? 'form-input--error' : ''}`}
                />
                {formErrors.receiverPhone && (
                  <div className="form-error">{formErrors.receiverPhone}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Etiqueta</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Ej. Casa, Trabajo, Oficina"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-input"
                />
                <span className="form-helper">Un nombre para identificar esta direccion.</span>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section__header">
              <h4 className="form-section__title">Ubicacion</h4>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label form-label--required">Departamento</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={`form-select ${formErrors.state ? 'form-input--error' : ''}`}
                >
                  <option value="">Seleccionar departamento</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {formErrors.state && <div className="form-error">{formErrors.state}</div>}
              </div>

              <div className="form-group">
                <label className="form-label form-label--required">Municipio</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!formData.state || loadingLocations}
                  className={`form-select ${formErrors.city ? 'form-input--error' : ''}`}
                >
                  <option value="">
                    {loadingLocations ? 'Cargando municipios...' : 'Seleccionar municipio'}
                  </option>
                  {municipalities.map((muni) => (
                    <option key={muni.id} value={muni.name}>
                      {muni.name}
                    </option>
                  ))}
                </select>
                {formErrors.city && <div className="form-error">{formErrors.city}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Codigo postal</label>
                <input
                  type="text"
                  name="postalCode"
                  placeholder="Ej. 01101"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-grid" style={{ marginTop: '16px' }}>
              <div className="form-group">
                <label className="form-label form-label--required">Calle / Colonia</label>
                <input
                  type="text"
                  name="addressLine1"
                  placeholder="Ej. Calle Principal #123, Col. Escalon"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  className={`form-input ${formErrors.addressLine1 ? 'form-input--error' : ''}`}
                />
                {formErrors.addressLine1 && (
                  <div className="form-error">{formErrors.addressLine1}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Complemento</label>
                <input
                  type="text"
                  name="addressLine2"
                  placeholder="Apartamento, referencia u otra indicacion"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-checkbox" style={{ marginTop: '16px' }}>
            <input
              type="checkbox"
              name="isDefault"
              id="checkDefault"
              checked={formData.isDefault}
              onChange={handleChange}
            />
            <label htmlFor="checkDefault" className="form-checkbox__label">
              Establecer como direccion predeterminada
            </label>
          </div>
        </form>
      </CleanModal>

      <ConfirmDeleteModal
        isOpen={addressToDelete !== null}
        onClose={() => setAddressToDelete(null)}
        onConfirm={handleDeleteConfirm}
        itemName={
          addressToDelete?.title ||
          addressToDelete?.addressLine1 ||
          addressToDelete?.address_line1 ||
          'Direccion'
        }
        loading={deleting}
      />
    </div>
  );
}
