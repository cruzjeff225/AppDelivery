const productRepo = require('../../infrastructure/repositories/product.repository');
const { validate }  = require('../validators/product.validator');

const getAll = async (req, res) => {
  try {
    const { category_id } = req.query;
    const products = await productRepo.findAll(category_id || null);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos', detail: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const product = await productRepo.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener producto', detail: err.message });
  }
};

const create = async (req, res) => {
  try {
    const errors = validate(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const image_path = req.file ? req.file.filename : null;
    const product = await productRepo.create({ ...req.body, image_path });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear producto', detail: err.message });
  }
};

const update = async (req, res) => {
  try {
    const image_path = req.file ? req.file.filename : undefined;
    const data = image_path ? { ...req.body, image_path } : req.body;
    const product = await productRepo.update(req.params.id, data);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar producto', detail: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const product = await productRepo.remove(req.params.id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado', product });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar producto', detail: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
