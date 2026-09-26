const validateOrder = (req, res, next) => {
  const { address_id, items } = req.body || {};
  const key = req.get('Idempotency-Key');
  const validId = (value) => Number.isInteger(value) && value > 0 && value <= 2147483647;
  if (!key || !/^[a-zA-Z0-9-]{16,80}$/.test(key)) {
    return res.status(400).json({ error: 'Se requiere una clave de pedido válida (Idempotency-Key).' });
  }
  if (!validId(address_id) || !Array.isArray(items) || items.length === 0 || items.length > 100) {
    return res.status(400).json({ error: 'Indica una dirección y entre 1 y 100 productos.' });
  }
  if (items.some((item) => !item || !validId(item.product_id) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10000)) {
    return res.status(400).json({ error: 'Los productos y cantidades deben ser enteros positivos (máximo 10000 unidades).' });
  }
  if (new Set(items.map((item) => item.product_id)).size !== items.length) {
    return res.status(400).json({ error: 'No repitas productos; utiliza su cantidad.' });
  }
  req.orderInput = {
    address_id,
    items: items.map(({ product_id, quantity }) => ({ product_id, quantity })).sort((a, b) => a.product_id - b.product_id),
  };
  req.orderKey = key;
  next();
};

module.exports = validateOrder;
