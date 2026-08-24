const registerUserUseCase = require('../../application/use-cases/register-user.use-case');
const loginUserUseCase = require('../../application/use-cases/login-user.use-case');
const ConflictError = require('../../domain/errors/ConflictError');
const UnauthorizedError = require('../../domain/errors/UnauthorizedError');
const { validate } = require('../validators/register.validator');
const { validate: validateLogin } = require('../validators/login.validator');

/**
 * Controlador de Presentación para Autenticación.
 * Traduce peticiones HTTP (req, res) a invocaciones de Casos de Uso.
 */
const register = async (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const { name, email, phone, password } = req.body;

  try {
    const user = await registerUserUseCase.execute({ name, email, phone, password });
    return res.status(201).json({ message: 'Usuario registrado exitosamente', user });
  } catch (err) {
    if (err instanceof ConflictError) {
      return res.status(409).json({ error: err.message });
    }
    console.error('Error en registro:', err);
    return res.status(500).json({ error: 'Error al registrar el usuario' });
  }
};

const login = async (req, res) => {
  const errors = validateLogin(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const { email, password } = req.body;

  try {
    const result = await loginUserUseCase.execute({ email, password });
    return res.json(result);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return res.status(401).json({ error: err.message });
    }
    console.error('Error en login:', err);
    return res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

module.exports = { register, login };
