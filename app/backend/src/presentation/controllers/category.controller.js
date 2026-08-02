const categoryRepo = require('../../infrastructure/repositories/category.repository');
const { validate }  = require('../validators/category.validator');

const getAll = async (_req, res) => {
  try {
    const categories = await categoryRepo.findAll();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener categorías', detail: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const category = await categoryRepo.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener categoría', detail: err.message });
  }
};

const create = async (req, res) => {
  try {
    const errors = validate(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const category = await categoryRepo.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
    res.status(500).json({ error: 'Error al crear categoría', detail: err.message });
  }
};

const update = async (req, res) => {
  try {
    const category = await categoryRepo.update(req.params.id, req.body);
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(category);
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
    res.status(500).json({ error: 'Error al actualizar categoría', detail: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const category = await categoryRepo.remove(req.params.id);
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json({ message: 'Categoría eliminada', category });
  } catch (err) {
    if (err.code === '23503')
      return res.status(409).json({ error: 'No se puede eliminar: la categoría tiene productos asociados' });
    res.status(500).json({ error: 'Error al eliminar categoría', detail: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
