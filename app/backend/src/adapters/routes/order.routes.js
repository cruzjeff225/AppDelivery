const router = require('express').Router();
const authenticateJwt = require('../middlewares/authenticate-jwt.middleware');
const authorizeRole = require('../middlewares/authorize-role.middleware');
const validateOrder = require('../validators/order.validator');
const { validateOrderId, validateStatusChange, validateStatusFilter } = require('../validators/order-status.validator');
const orders = require('../../infrastructure/repositories/order.repository');
const listOrders = require('../../application/use-cases/list-orders.use-case');
const listMyOrders = require('../../application/use-cases/list-my-orders.use-case');
const getOrder = require('../../application/use-cases/get-order.use-case');
const updateOrderStatus = require('../../application/use-cases/update-order-status.use-case');

const DOMAIN_ERROR_STATUS = { NotFoundError: 404, ForbiddenError: 403, ConflictError: 409 };

const handleError = (res, error, logMessage, clientMessage) => {
  const status = DOMAIN_ERROR_STATUS[error.name];
  if (status) return res.status(status).json({ error: error.message });
  console.error(logMessage, error);
  return res.status(500).json({ error: clientMessage });
};

// Solo el cliente compra: evita que quien aprueba pedidos (admin/repartidor) también los genere.
router.post('/', authenticateJwt, authorizeRole('customer'), validateOrder, async (req, res) => {
  try {
    const result = await orders.create(req.user.id, req.orderKey, req.orderInput);
    return res.status(result.replayed ? 200 : 201).json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    console.error('Error al crear pedido:', error);
    return res.status(500).json({ error: 'No se pudo guardar el pedido. Puedes reintentar.' });
  }
});

// Mis pedidos: el cliente ve los suyos.
router.get('/mine', authenticateJwt, authorizeRole('customer'), async (req, res) => {
  try {
    return res.json(await listMyOrders.execute(req.user));
  } catch (error) {
    return handleError(res, error, 'Error al listar pedidos del usuario:', 'No se pudieron cargar tus pedidos.');
  }
});

// La entidad decide la visibilidad: dueño, administrador o repartidor correspondiente.
router.get('/:id', authenticateJwt, validateOrderId, async (req, res) => {
  try {
    return res.json(await getOrder.execute(req.orderId, req.user));
  } catch (error) {
    return handleError(res, error, 'Error al consultar pedido:', 'No se pudo cargar el pedido.');
  }
});

// Panel de monitoreo (RF-10): solo administrador y repartidor.
router.use(authenticateJwt, authorizeRole('admin', 'delivery'));

router.get('/', validateStatusFilter, async (req, res) => {
  try {
    const options = req.statusFilter === undefined ? {} : { statuses: req.statusFilter };
    return res.json(await listOrders.execute(req.user, options));
  } catch (error) {
    return handleError(res, error, 'Error al listar pedidos:', 'No se pudieron cargar los pedidos.');
  }
});

router.patch('/:id/status', validateOrderId, validateStatusChange, async (req, res) => {
  try {
    return res.json(await updateOrderStatus.execute(req.orderId, req.body.status, req.user));
  } catch (error) {
    return handleError(res, error, 'Error al cambiar estado del pedido:', 'No se pudo actualizar el estado.');
  }
});

module.exports = router;
