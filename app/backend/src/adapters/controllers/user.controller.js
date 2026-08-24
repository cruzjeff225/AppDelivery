const bcrypt = require('bcrypt');
const userRepo = require('../../infrastructure/repositories/user.repository');
const { validate } = require('../validators/register.validator');

const SALT_ROUNDS = 10;

const getAll = async (req, res) => {
  try {
    const users = await userRepo.findAll();
    return res.json(users);
  } catch (err) {
    console.error('Error al listar usuarios:', err);
    return res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

const getById = async (req, res) => {
  try {
    const user = await userRepo.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json(user);
  } catch (err) {
    console.error('Error al obtener usuario:', err);
    return res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

const create = async (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const { name, email, phone, password, role } = req.body;

  try {
    const existing = await userRepo.findByEmail(email);
    if (existing) return res.status(409).json({ error: 'El correo electrónico ya está registrado.' });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepo.create({ name, email, phone, password: hashed, role });

    return res.status(201).json(user);
  } catch (err) {
    console.error('Error al crear usuario:', err);
    return res.status(500).json({ error: 'Error al registrar el usuario' });
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, role, password } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Nombre y correo electrónico son requeridos' });
  }

  try {
    const existing = await userRepo.findById(id);
    if (!existing) return res.status(404).json({ error: 'Usuario no encontrado' });

    let hashedPassword = null;
    if (password && password.trim().length >= 8) {
      hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const updatedUser = await userRepo.update(id, {
      name,
      email,
      phone,
      role: role || existing.role,
      password: hashedPassword
    });

    return res.json(updatedUser);
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    return res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};

const remove = async (req, res) => {
  try {
    const removed = await userRepo.remove(req.params.id);
    if (!removed) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json({ message: 'Usuario eliminado correctamente', id: req.params.id });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    return res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};

module.exports = { getAll, getById, create, update, remove };
