/**
 * Entidad de Dominio: Address
 * Representa una dirección dentro del modelo de negocio.
 * Es independiente de frameworks (Express) y de persistencia (PostgreSQL).
 */
class Address {
  constructor({
    id = null,
    userId,
    title,
    addressLine1,
    addressLine2 = null,
    city,
    state = null,
    postalCode = null,
    country = 'El Salvador',
    latitude = null,
    longitude = null,
    isDefault = false,
    receiverName = null,
    receiverPhone = null,
    createdAt = null,
    updatedAt = null
  }) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.addressLine1 = addressLine1;
    this.addressLine2 = addressLine2;
    this.city = city;
    this.state = state;
    this.postalCode = postalCode;
    this.country = country;
    this.latitude = latitude;
    this.longitude = longitude;
    this.isDefault = isDefault;
    this.receiverName = receiverName;
    this.receiverPhone = receiverPhone;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;

    this.validate();
  }

  /**
   * Valida las reglas de negocio indispensables de una dirección.
   */
  validate() {
    if (!this.userId) {
      throw new Error('La dirección debe pertenecer a un usuario válido (userId obligatorio).');
    }
    if (!this.title || this.title.trim().length === 0) {
      throw new Error('El título de la dirección es requerido (ej. Casa, Trabajo).');
    }
    if (!this.addressLine1 || this.addressLine1.trim().length === 0) {
      throw new Error('La dirección principal (addressLine1) es requerida.');
    }
    if (!this.city || this.city.trim().length === 0) {
      throw new Error('La ciudad o municipio es requerida.');
    }
  }

  /**
   * Método de dominio para marcar la dirección como predeterminada
   */
  markAsDefault() {
    this.isDefault = true;
  }

  /**
   * Método de dominio para desmarcar como predeterminada
   */
  unmarkDefault() {
    this.isDefault = false;
  }
}

module.exports = Address;
