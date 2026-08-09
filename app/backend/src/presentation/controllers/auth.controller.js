const bcrypt = require('bcrypt');
const userRepo = require('../../infrastructure/repositories/user.repository');
const { validate } = require('../validators/register.validator');

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

module.exports = { register };