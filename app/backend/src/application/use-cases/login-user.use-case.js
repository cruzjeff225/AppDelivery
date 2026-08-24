const User = require('../../domain/entities/User');
const UnauthorizedError = require('../../domain/errors/UnauthorizedError');
const userRepository = require('../../infrastructure/repositories/user.repository');
const passwordService = require('../../infrastructure/security/password.service');
const jwtService = require('../../infrastructure/security/jwt.service');

/**
 * Caso de Uso: Iniciar Sesión
 * Valida las credenciales contra la base de datos y, de ser correctas,
 * emite un JWT firmado con la identidad y el rol del usuario.
 */
class LoginUserUseCase {
  async execute({ email, password }) {
    const record = await userRepository.findByEmail(email);
    if (!record) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const matches = await passwordService.compare(password, record.password);
    if (!matches) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const userEntity = new User({
      id: record.id,
      name: record.name,
      email: record.email,
      phone: record.phone,
      password: record.password,
      role: record.role,
      createdAt: record.created_at
    });

    const token = jwtService.sign({
      id: userEntity.id,
      role: userEntity.role,
      name: userEntity.name,
      email: userEntity.email
    });

    return { token, user: userEntity.toPublic() };
  }
}

module.exports = new LoginUserUseCase();
