import { useState, useEffect } from 'react';
import { useAddresses } from '../hooks/useAddresses';
import { locationService } from '../services/location.service';
import { CleanModal } from '../../../components/CleanModal';
import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal';
import { useSileoNotification } from '../../../context/SileoNotificationContext';

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

  // Dynamic Departments & Municipalities from Backend Database
  const [departments, setDepartments] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  // Modals state
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
    isDefault: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load Departments from Database API on mount
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

  // Load Municipalities dynamically from Database API whenever department state changes
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
      isDefault: addresses.length === 0
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
      isDefault: addr.isDefault || addr.is_default || false
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
      setFormData((prev) => ({
        ...prev,
        state: value,
        city: ''
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.receiverName.trim()) errs.receiverName = 'Ingrese el nombre del destinatario';
    if (!formData.receiverPhone.trim()) errs.receiverPhone = 'Ingrese el teléfono de contacto';
    if (!formData.state) errs.state = 'Seleccione un departamento';
    if (!formData.city) errs.city = 'Seleccione un municipio';
    if (!formData.addressLine1.trim()) errs.addressLine1 = 'Ingrese la calle o dirección principal';
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
        title: formData.title || `${formData.city}, ${formData.state}`
      };

      if (addressToEdit) {
        await editAddress(addressToEdit.id, payload);
        showSuccess('Dirección actualizada correctamente', 'Dirección Actualizada 📍');
      } else {
        await addAddress(payload);
        showSuccess('Nueva dirección registrada correctamente', 'Dirección Guardada 📍');
      }
      setIsFormModalOpen(false);
    } catch (err) {
      console.error(err);
      showError('Error al guardar la dirección');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (addr) => {
    try {
      await setDefaultAddress(addr.id);
      showSuccess(`'${addr.title || addr.city}' fijada como predeterminada`, 'Dirección Predeterminada ⭐');
    } catch (err) {
      showError('Error al establecer dirección predeterminada');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!addressToDelete) return;
    setDeleting(true);
    try {
      await removeAddress(addressToDelete.id);
      showSuccess('Dirección eliminada correctamente', 'Dirección Eliminada');
      setAddressToDelete(null);
    } catch (err) {
      showError('Error al eliminar la dirección');
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

  return (
    <div style={{ width: '100%' }}>
      {/* Header (Imagen 1 Reference Layout) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
            Gestión de Direcciones
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Administración de ubicaciones y direcciones de entrega.
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
          + Nueva Dirección
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
          placeholder="Buscar por etiqueta, destinatario, ciudad o departamento..."
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
                ETIQUETA
              </th>
              <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                DESTINATARIO
              </th>
              <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                TELÉFONO
              </th>
              <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                DIRECCIÓN
              </th>
              <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                UBICACIÓN
              </th>
              <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                ESTADO
              </th>
              <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                ACCIONES
              </th>
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
                  No hay direcciones registradas. ¡Crea la primera!
                </td>
              </tr>
            ) : (
              filteredAddresses.map((addr) => {
                const isDef = addr.isDefault || addr.is_default;
                return (
                  <tr key={addr.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 20px', fontWeight: '700', color: '#0f172a' }}>
                      📍 {addr.title || 'Dirección'}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#334155' }}>
                      {addr.receiverName || addr.full_name || 'N/A'}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#64748b' }}>
                      {addr.receiverPhone || addr.phone || 'N/A'}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#334155' }}>
                      {addr.addressLine1 || addr.address_line1}
                      {(addr.addressLine2 || addr.address_line2) && (
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{addr.addressLine2 || addr.address_line2}</div>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#475569' }}>
                      {addr.city}, {addr.state}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      {isDef ? (
                        <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: '#ecfdf5', color: '#047857' }}>
                          ⭐ Predeterminada
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetDefault(addr)}
                          style={{ border: 'none', background: 'none', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Fijar como principal
                        </button>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenEdit(addr)}
                          title="Editar Dirección"
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
                          onClick={() => handleOpenDelete(addr)}
                          title="Eliminar Dirección"
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
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Crear / Editar (Imagen 2 & 4 Grid Reference) */}
      <CleanModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={addressToEdit ? 'Editar Dirección' : 'Registrar Nueva Dirección'}
        subtitle={addressToEdit ? 'Modifica los datos de la ubicación de entrega.' : 'Ingresa la información requerida para el envío.'}
        icon={addressToEdit ? '✏️' : '📍'}
        maxWidth="680px"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                NOMBRE Y APELLIDO DESTINATARIO *
              </label>
              <input
                type="text"
                name="receiverName"
                placeholder="Ej. Juan Pérez"
                value={formData.receiverName}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: formErrors.receiverName ? '1px solid #ef4444' : '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {formErrors.receiverName && <small style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.receiverName}</small>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                TELÉFONO DE CONTACTO *
              </label>
              <input
                type="text"
                name="receiverPhone"
                placeholder="Ej. +503 7000-0000"
                value={formData.receiverPhone}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: formErrors.receiverPhone ? '1px solid #ef4444' : '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {formErrors.receiverPhone && <small style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.receiverPhone}</small>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                ETIQUETA DE LA DIRECCIÓN
              </label>
              <input
                type="text"
                name="title"
                placeholder="Ej. Casa, Trabajo, Oficina"
                value={formData.title}
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

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                DEPARTAMENTO *
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: formErrors.state ? '1px solid #ef4444' : '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Seleccionar departamento</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
              {formErrors.state && <small style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.state}</small>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                MUNICIPIO *
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!formData.state || loadingLocations}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: formErrors.city ? '1px solid #ef4444' : '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">{loadingLocations ? 'Cargando municipios...' : 'Seleccionar municipio'}</option>
                {municipalities.map((muni) => (
                  <option key={muni.id} value={muni.name}>{muni.name}</option>
                ))}
              </select>
              {formErrors.city && <small style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.city}</small>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                CÓDIGO POSTAL (OPCIONAL)
              </label>
              <input
                type="text"
                name="postalCode"
                placeholder="Ej. 01101"
                value={formData.postalCode}
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

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
              NOMBRE Y NÚMERO DE LA CALLE / COLONIA *
            </label>
            <input
              type="text"
              name="addressLine1"
              placeholder="Ej. Calle Principal #123, Col. Escalón"
              value={formData.addressLine1}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: formErrors.addressLine1 ? '1px solid #ef4444' : '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {formErrors.addressLine1 && <small style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.addressLine1}</small>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
              COMPLEMENTO DE LA DIRECCIÓN (OPCIONAL)
            </label>
            <input
              type="text"
              name="addressLine2"
              placeholder="Apartamento, referencia u otra indicación"
              value={formData.addressLine2}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <input
              type="checkbox"
              name="isDefault"
              id="checkDefault"
              checked={formData.isDefault}
              onChange={handleChange}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="checkDefault" style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
              Establecer como dirección predeterminada
            </label>
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
              {submitting ? 'Guardando...' : addressToEdit ? 'Guardar Cambios' : 'Guardar Dirección'}
            </button>
          </div>
        </form>
      </CleanModal>

      {/* Modal Confirmar Eliminación (Imagen 3 Warning Reference) */}
      <ConfirmDeleteModal
        isOpen={addressToDelete !== null}
        onClose={() => setAddressToDelete(null)}
        onConfirm={handleDeleteConfirm}
        itemName={addressToDelete?.title || addressToDelete?.addressLine1 || addressToDelete?.address_line1 || 'Dirección'}
        loading={deleting}
      />
    </div>
  );
}