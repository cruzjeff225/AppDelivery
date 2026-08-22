const bcrypt = require('bcrypt');
const userRepo = require('../../infrastructure/repositories/user.repository');
const jwtService = require('../../infrastructure/security/jwt.service');
const { validate } = require('../validators/register.validator');
const { validate: validateLogin } = require('../validators/login.validator');

const SALT_ROUNDS = 10;

const register = async (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const { name, email, phone, password } = req.body;

  try {
    const existing = await userRepo.findByEmail(email);
    if (existing) return res.status(409).json({ error: 'El correo electrónico ya está registrado.' });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepo.create({ name, email, phone, password: hashed });

    return res.status(201).json({ message: 'Usuario registrado exitosamente', user });
  } catch (err) {
    console.error('Error en registro:', err);
    return res.status(500).json({ error: 'Error al registrar el usuario' });
  }
};

const login = async (req, res) => {
  const errors = validateLogin(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const { email, password } = req.body;

  try {
    const user = await userRepo.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwtService.sign({ id: user.id, role: user.role, name: user.name, email: user.email });

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

module.exports = { register, login };