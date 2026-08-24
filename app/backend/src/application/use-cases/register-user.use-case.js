const User = require('../../domain/entities/User');
const ConflictError = require('../../domain/errors/ConflictError');
const userRepository = require('../../infrastructure/repositories/user.repository');
const passwordService = require('../../infrastructure/security/password.service');

/**
 * Caso de Uso: Registrar Usuario
 * Orquesta la creación de una cuenta de cliente: valida unicidad del correo,
 * cifra la contraseña y persiste al usuario respetando las reglas de la entidad de dominio.
 */
class RegisterUserUseCase {
  async execute({ name, email, phone, password }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('El correo electrónico ya está registrado.');
    }

    const hashedPassword = await passwordService.hash(password);

    // Instanciar la Entidad de Dominio para ejecutar las reglas de negocio básicas
    const userEntity = new User({ name, email, phone, password: hashedPassword });

    return userRepository.create({
      name: userEntity.name,
      email: userEntity.email,
      phone: userEntity.phone,
      password: userEntity.password,
      role: userEntity.role
    });
  }
}

module.exports = new RegisterUserUseCase();
