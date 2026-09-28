const Order = require('../../domain/entities/Order');

const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 && id <= 2147483647 ? id : null;
};

const validateOrderId = (req, res, next) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El ID del pedido no es válido.' });
  req.orderId = id;
  next();
};

const validateStatusChange = (req, res, next) => {
  const { status } = req.body || {};
  if (typeof status !== 'string' || !Order.isValidStatus(status)) {
    return res.status(400).json({ error: `Estado inválido. Usa uno de: ${Object.keys(Order.TRANSITIONS).join(', ')}.` });
  }
  next();
};

// ?status=CREADO,PAGADO filtra por estados; ?status=ALL incluye los finalizados; sin filtro, solo en curso.
const validateStatusFilter = (req, res, next) => {
  const raw = req.query.status;
  if (raw === undefined || raw === '') return next();
  if (raw === 'ALL') {
    req.statusFilter = null;
    return next();
  }
  const statuses = String(raw).split(',').map((s) => s.trim());
  if (statuses.some((status) => !Order.isValidStatus(status))) {
    return res.status(400).json({ error: 'Filtro de estado inválido.' });
  }
  req.statusFilter = statuses;
  next();
};

module.exports = { validateOrderId, validateStatusChange, validateStatusFilter };
