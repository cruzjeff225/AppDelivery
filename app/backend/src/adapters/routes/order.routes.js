const router = require('express').Router();
const authenticateJwt = require('../middlewares/authenticate-jwt.middleware');
const validateOrder = require('../validators/order.validator');
const orders = require('../../infrastructure/repositories/order.repository');

router.post('/', authenticateJwt, validateOrder, async (req, res) => {
  try {
    const result = await orders.create(req.user.id, req.orderKey, req.orderInput);
    return res.status(result.replayed ? 200 : 201).json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    console.error('Error al crear pedido:', error);
    return res.status(500).json({ error: 'No se pudo guardar el pedido. Puedes reintentar.' });
  }
});

module.exports = router;
