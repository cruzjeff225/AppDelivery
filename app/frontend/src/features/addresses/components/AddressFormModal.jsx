import { useState, useEffect } from 'react';
import { HeaderBar } from './HeaderBar';

// Departamentos y Municipios representativos de El Salvador
const EL_SALVADOR_DEPARTAMENTOS = {
  'San Salvador': ['San Salvador', 'Soyapango', 'Mejicanos', 'Ilopango', 'Delgado', 'Apopa', 'San Marcos'],
  'La Libertad': ['Santa Tecla', 'Antiguo Cuscatlán', 'La Libertad', 'Colón', 'San Juan Opico', 'Zaragoza'],
  'Usulután': ['Santiago De María', 'Usulután', 'Jiquilisco', 'Berlin', 'Puerto El Triunfo', 'Alegría'],
  'Santa Ana': ['Santa Ana', 'Chalchuapa', 'Metapán', 'Coatepeque'],
  'San Miguel': ['San Miguel', 'Ciudad Barrios', 'Chinameca'],
  'Sonsonate': ['Sonsonate', 'Acajutla', 'Izalco', 'Nahuizalco'],
  'Ahuachapán': ['Ahuachapán', 'Ataco', 'Apaneca'],
  'La Paz': ['Zacatecoluca', 'Olocuilta', 'San Luis Talpa'],
  'Cuscatlán': ['Cojutepeque', 'Suchitoto'],
  'Chalatenango': ['Chalatenango', 'La Palma', 'Nueva Concepción'],
  'Morazán': ['San Francisco Gotera', 'Perquín'],
  'San Vicente': ['San Vicente', 'Tecoluca'],
  'Cabañas': ['Sensuntepeque', 'Ilobasco'],
  'La Unión': ['La Unión', 'Conchagua']
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
    isDefault: false
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
        isDefault: addressToEdit.isDefault || addressToEdit.is_default || false
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
        isDefault: false
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
      setFormData(prev => ({
        ...prev,
        state: value,
        city: newMunicipios[0] || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.receiverName.trim()) newErrors.receiverName = 'Ingrese el nombre y apellido del destinatario';
    if (!formData.receiverPhone.trim()) newErrors.receiverPhone = 'Ingrese el número de teléfono de contacto';
    if (!formData.state) newErrors.state = 'Seleccione un departamento';
    if (!formData.city) newErrors.city = 'Seleccione un municipio';
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Ingrese el nombre y número de la calle';
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
      title: formData.title || `${formData.city}, ${formData.state}`
    });
    setIsSubmitting(false);

    if (result && result.success !== false) {
      onClose();
    }
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 bg-white z-3 overflow-auto" style={{ zIndex: 1050 }}>
      {/* Header Bar */}
      <HeaderBar
        title={addressToEdit ? 'Editar dirección' : 'Agregar una nueva dirección'}
        onBack={onClose}
        showSecurity={true}
      />

      {/* Form Content Body */}
      <div className="container py-3 px-3 max-w-lg mx-auto" style={{ maxWidth: '600px', paddingBottom: '100px' }}>
        <form onSubmit={handleSubmit}>

          {/* Nombre y Apellidos de Contacto */}
          <div className="app-form-group">
            <label className="app-form-label">
              Nombre y apellido <span className="required-asterisk">*</span>
            </label>
            <input
              type="text"
              name="receiverName"
              className={`app-form-control ${errors.receiverName ? 'border-danger' : ''}`}
              placeholder="Ej. Juan Pérez"
              value={formData.receiverName}
              onChange={handleChange}
            />
            {errors.receiverName && <small className="text-danger mt-1 d-block">{errors.receiverName}</small>}
          </div>

          {/* Teléfono de contacto */}
          <div className="app-form-group">
            <label className="app-form-label">
              Teléfono de contacto <span className="required-asterisk">*</span>
            </label>
            <input
              type="text"
              name="receiverPhone"
              className={`app-form-control ${errors.receiverPhone ? 'border-danger' : ''}`}
              placeholder="0000-0000"
              value={formData.receiverPhone}
              onChange={handleChange}
            />
            {errors.receiverPhone && <small className="text-danger mt-1 d-block">{errors.receiverPhone}</small>}
          </div>

          {/* Etiqueta / Título de la dirección (ej. Casa, Trabajo) */}
          <div className="app-form-group">
            <label className="app-form-label">
              Etiqueta de la dirección <span className="text-muted fw-normal">(opcional)</span>
            </label>
            <input
              type="text"
              name="title"
              className="app-form-control"
              placeholder="Ej. Casa, Trabajo, Oficina"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          {/* Departamento */}
          <div className="app-form-group">
            <label className="app-form-label">
              Departamento <span className="required-asterisk">*</span>
            </label>
            <select
              name="state"
              className={`app-form-control app-form-select ${errors.state ? 'border-danger' : ''}`}
              value={formData.state}
              onChange={handleChange}
            >
              <option value="">Seleccionar departamento</option>
              {Object.keys(EL_SALVADOR_DEPARTAMENTOS).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {errors.state && <small className="text-danger mt-1 d-block">{errors.state}</small>}
          </div>

          {/* Municipio */}
          <div className="app-form-group">
            <label className="app-form-label">
              Municipio <span className="required-asterisk">*</span>
            </label>
            <select
              name="city"
              className={`app-form-control app-form-select ${errors.city ? 'border-danger' : ''}`}
              value={formData.city}
              onChange={handleChange}
            >
              <option value="">Seleccionar municipio</option>
              {availableMunicipios.map(muni => (
                <option key={muni} value={muni}>{muni}</option>
              ))}
            </select>
            {errors.city && <small className="text-danger mt-1 d-block">{errors.city}</small>}
          </div>

          {/* Código Postal */}
          <div className="app-form-group">
            <label className="app-form-label">
              Código postal <span className="text-muted fw-normal">(opcional)</span>
            </label>
            <input
              type="text"
              name="postalCode"
              className="app-form-control"
              placeholder="Ej. 01101"
              value={formData.postalCode}
              onChange={handleChange}
            />
          </div>

          {/* Nombre y Número de la calle */}
          <div className="app-form-group">
            <label className="app-form-label">
              Nombre y número de la calle / colonia <span className="required-asterisk">*</span>
            </label>
            <input
              type="text"
              name="addressLine1"
              className={`app-form-control ${errors.addressLine1 ? 'border-danger' : ''}`}
              placeholder="Ej. Calle Principal #123, Col. Escalón"
              value={formData.addressLine1}
              onChange={handleChange}
            />
            {errors.addressLine1 && <small className="text-danger mt-1 d-block">{errors.addressLine1}</small>}
          </div>

          {/* Complemento (opcional) */}
          <div className="app-form-group">
            <label className="app-form-label text-secondary font-normal">
              Complemento de la dirección <span className="text-muted fw-normal">(opcional)</span>
            </label>
            <input
              type="text"
              name="addressLine2"
              className="app-form-control"
              placeholder="Apartamento, referencia u otra indicación"
              value={formData.addressLine2}
              onChange={handleChange}
            />
          </div>

          {/* Cambiar predeterminado */}
          <div className="app-switch-container">
            <span className="app-switch-label">Establecer como dirección predeterminada</span>
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

          {/* Sticky Bottom Bar */}
          <div className="app-sticky-footer fixed-bottom">
            <div className="container max-w-lg mx-auto p-0" style={{ maxWidth: '600px' }}>
              <button
                type="submit"
                className="btn-app-orange"
                style={{ backgroundColor: '#10b981', color: '#ffffff' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar dirección'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}