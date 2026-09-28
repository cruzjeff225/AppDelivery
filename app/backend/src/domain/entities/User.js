const VALID_ROLES = ['customer', 'admin', 'delivery'];

/**
 * Entidad de Dominio: User
 * Representa un usuario dentro del modelo de negocio.
 * Es independiente de frameworks (Express) y de persistencia (PostgreSQL).
 * El campo `password` siempre contiene el valor tal como se persiste (hash),
 * nunca texto plano: el hashing es responsabilidad de la capa de infraestructura.
 */
class User {
  constructor({
    id = null,
    name,
    email,
    phone = null,
    password,
    role = 'customer',
    createdAt = null
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.password = password;
    this.role = role;
    this.createdAt = createdAt;

    this.validate();
  }

  /**
   * Valida las reglas de negocio indispensables de un usuario.
   */
  validate() {
    if (!this.name || this.name.trim().length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres.');
    }
    if (!this.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      throw new Error('El correo electrónico no tiene un formato válido.');
    }
    if (!this.password) {
      throw new Error('La contraseña es obligatoria.');
    }
    if (!VALID_ROLES.includes(this.role)) {
      throw new Error(`Rol inválido: ${this.role}. Roles permitidos: ${VALID_ROLES.join(', ')}.`);
    }
  }

  /**
   * Representación pública del usuario, sin el hash de la contraseña.
   */
  toPublic() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      role: this.role
    };
  }
}

module.exports = User;
