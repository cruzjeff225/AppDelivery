const stockRepo  = require('../../infrastructure/repositories/stock.repository');
const { validate } = require('../validators/stock.validator');

const getByProduct = async (req, res) => {
  try {
    const lots = await stockRepo.findByProduct(req.params.product_id);
    res.json(lots);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener lotes', detail: err.message });
  }
};

const getTotal = async (req, res) => {
  try {
    const total = await stockRepo.getTotalByProduct(req.params.product_id);
    res.json({ product_id: Number(req.params.product_id), total_stock: total });
  } catch (err) {
    res.status(500).json({ error: 'Error al calcular stock total', detail: err.message });
  }
};

const addLot = async (req, res) => {
  try {
    const errors = validate(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const lot = await stockRepo.create({
      ...req.body,
      product_id: req.params.product_id,
    });
    res.status(201).json(lot);
  } catch (err) {
    if (err.code === '23503')
      return res.status(404).json({ error: 'Producto no encontrado' });
    res.status(500).json({ error: 'Error al registrar lote', detail: err.message });
  }
};

const removeLot = async (req, res) => {
  try {
    const lot = await stockRepo.remove(req.params.lot_id);
    if (!lot) return res.status(404).json({ error: 'Lote no encontrado' });
    res.json({ message: 'Lote eliminado', lot });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar lote', detail: err.message });
  }
};

module.exports = { getByProduct, getTotal, addLot, removeLot };
