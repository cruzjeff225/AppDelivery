import { useState, useEffect } from 'react';
import { HeaderBar } from './HeaderBar';

const EL_SALVADOR_DEPARTAMENTOS = {
  'San Salvador': ['San Salvador', 'Soyapango', 'Mejicanos', 'Ilopango', 'Delgado', 'Apopa', 'San Marcos'],
  'La Libertad': ['Santa Tecla', 'Antiguo Cuscatlan', 'La Libertad', 'Colon', 'San Juan Opico', 'Zaragoza'],
  'Usulutan': ['Santiago De Maria', 'Usulutan', 'Jiquilisco', 'Berlin', 'Puerto El Triunfo', 'Alegria'],
  'Santa Ana': ['Santa Ana', 'Chalchuapa', 'Metapan', 'Coatepeque'],
  'San Miguel': ['San Miguel', 'Ciudad Barrios', 'Chinameca'],
  'Sonsonate': ['Sonsonate', 'Acajutla', 'Izalco', 'Nahuizalco'],
  'Ahuachapan': ['Ahuachapan', 'Ataco', 'Apaneca'],
  'La Paz': ['Zacatecoluca', 'Olocuilta', 'San Luis Talpa'],
  'Cuscatlan': ['Cojutepeque', 'Suchitoto'],
  'Chalatenango': ['Chalatenango', 'La Palma', 'Nueva Concepcion'],
  'Morazan': ['San Francisco Gotera', 'Perquin'],
  'San Vicente': ['San Vicente', 'Tecoluca'],
  'Cabanas': ['Sensuntepeque', 'Ilobasco'],
  'La Union': ['La Union', 'Conchagua'],
};

export function AddressFormModal({ isOpen, onClose, onSubmit, addressToEdit }) {
  const [formData, setFormData] = useState({
    receiverName: '',
    receiverPhone: '',
    title: '',
    state: '',
    city: '',
    postalCode: '',
    addressLine1: '',
    addressLine2: '',
    dui: '',
    country: 'El Salvador',
    isDefault: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (addressToEdit) {
      setFormData({
        receiverName: addressToEdit.receiverName || addressToEdit.full_name || '',
        receiverPhone: addressToEdit.receiverPhone || addressToEdit.phone || '',
        title: addressToEdit.title || '',
        state: addressToEdit.state || '',
        city: addressToEdit.city || '',
        postalCode: addressToEdit.postalCode || addressToEdit.postal_code || '',
        addressLine1: addressToEdit.addressLine1 || addressToEdit.address_line1 || '',
        addressLine2: addressToEdit.addressLine2 || addressToEdit.address_line2 || '',
        dui: addressToEdit.dui || '',
        country: addressToEdit.country || 'El Salvador',
        isDefault: addressToEdit.isDefault || addressToEdit.is_default || false,
      });
    } else {
      setFormData({
        receiverName: '',
        receiverPhone: '',
        title: '',
        state: '',
        city: '',
        postalCode: '',
        addressLine1: '',
        addressLine2: '',
        dui: '',
        country: 'El Salvador',
        isDefault: false,
      });
    }
    setErrors({});
  }, [addressToEdit, isOpen]);

  if (!isOpen) return null;

  const availableMunicipios = EL_SALVADOR_DEPARTAMENTOS[formData.state] || [];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'state') {
      const newMunicipios = EL_SALVADOR_DEPARTAMENTOS[value] || [];
      setFormData((prev) => ({
        ...prev,
        state: value,
        city: newMunicipios[0] || '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.receiverName.trim()) newErrors.receiverName = 'Ingresa el nombre y apellido del destinatario';
    if (!formData.receiverPhone.trim()) newErrors.receiverPhone = 'Ingresa el numero de telefono de contacto';
    if (!formData.state) newErrors.state = 'Selecciona un departamento';
    if (!formData.city) newErrors.city = 'Selecciona un municipio';
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Ingresa el nombre y numero de la calle';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    const result = await onSubmit({
      ...formData,
      title: formData.title || `${formData.city}, ${formData.state}`,
    });
    setIsSubmitting(false);

    if (result && result.success !== false) {
      onClose();
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 bg-white z-3 overflow-auto"
      style={{ zIndex: 1050 }}
    >
      <HeaderBar
        title={addressToEdit ? 'Editar direccion' : 'Agregar una nueva direccion'}
        onBack={onClose}
        showSecurity={true}
      />

      <div
        className="container py-3 px-3 max-w-lg mx-auto"
        style={{ maxWidth: '600px', paddingBottom: '100px' }}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label form-label--required">Nombre y apellido</label>
            <input
              type="text"
              name="receiverName"
              className={`form-input ${errors.receiverName ? 'form-input--error' : ''}`}
              placeholder="Ej. Juan Perez"
              value={formData.receiverName}
              onChange={handleChange}
            />
            {errors.receiverName && (
              <div className="form-error">{errors.receiverName}</div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label form-label--required">Telefono de contacto</label>
            <input
              type="text"
              name="receiverPhone"
              className={`form-input ${errors.receiverPhone ? 'form-input--error' : ''}`}
              placeholder="0000-0000"
              value={formData.receiverPhone}
              onChange={handleChange}
            />
            {errors.receiverPhone && (
              <div className="form-error">{errors.receiverPhone}</div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">
              Etiqueta de la direccion{' '}
              <span style={{ color: '#94a3b8', fontWeight: 400 }}>(opcional)</span>
            </label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="Ej. Casa, Trabajo, Oficina"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label form-label--required">Departamento</label>
            <select
              name="state"
              className={`form-select ${errors.state ? 'form-input--error' : ''}`}
              value={formData.state}
              onChange={handleChange}
            >
              <option value="">Seleccionar departamento</option>
              {Object.keys(EL_SALVADOR_DEPARTAMENTOS).map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {errors.state && <div className="form-error">{errors.state}</div>}
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label form-label--required">Municipio</label>
            <select
              name="city"
              className={`form-select ${errors.city ? 'form-input--error' : ''}`}
              value={formData.city}
              onChange={handleChange}
            >
              <option value="">Seleccionar municipio</option>
              {availableMunicipios.map((muni) => (
                <option key={muni} value={muni}>{muni}</option>
              ))}
            </select>
            {errors.city && <div className="form-error">{errors.city}</div>}
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">
              Codigo postal <span style={{ color: '#94a3b8', fontWeight: 400 }}>(opcional)</span>
            </label>
            <input
              type="text"
              name="postalCode"
              className="form-input"
              placeholder="Ej. 01101"
              value={formData.postalCode}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label form-label--required">
              Nombre y numero de la calle / colonia
            </label>
            <input
              type="text"
              name="addressLine1"
              className={`form-input ${errors.addressLine1 ? 'form-input--error' : ''}`}
              placeholder="Ej. Calle Principal #123, Col. Escalon"
              value={formData.addressLine1}
              onChange={handleChange}
            />
            {errors.addressLine1 && (
              <div className="form-error">{errors.addressLine1}</div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">
              Complemento de la direccion{' '}
              <span style={{ color: '#94a3b8', fontWeight: 400 }}>(opcional)</span>
            </label>
            <input
              type="text"
              name="addressLine2"
              className="form-input"
              placeholder="Apartamento, referencia u otra indicacion"
              value={formData.addressLine2}
              onChange={handleChange}
            />
          </div>

          <div className="app-switch-container" style={{ marginBottom: '16px' }}>
            <span className="app-switch-label">Establecer como direccion predeterminada</span>
            <div className="form-check form-switch m-0 p-0">
              <input
                className="form-check-input float-none ms-0"
                type="checkbox"
                name="isDefault"
                id="switchDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                style={{ width: '44px', height: '24px', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div className="app-sticky-footer fixed-bottom">
            <div className="container max-w-lg mx-auto p-0" style={{ maxWidth: '600px' }}>
              <button
                type="submit"
                className="btn btn--primary btn--lg"
                style={{ width: '100%' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar direccion'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
