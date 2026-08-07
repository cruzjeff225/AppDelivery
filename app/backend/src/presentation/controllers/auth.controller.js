const bcrypt = require('bcrypt');
const userRepo = require('../../infrastructure/repositories/user.repository');
const { validate } = require('../validators/register.validator');

const SALT_ROUNDS = 10;

const register = async (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const { name, email, password } = req.body;

  const existing = await userRepo.findByEmail(email);
  if (existing) return res.status(409).json({ error: 'Email ya registrado' });

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepo.create({ name, email, password: hashed });

  return res.status(201).json({ user });
};

module.exports = { register };