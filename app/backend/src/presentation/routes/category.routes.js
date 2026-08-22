const { Router } = require('express');
const ctrl = require('../controllers/category.controller');
const authenticateJwt = require('../middlewares/authenticate-jwt.middleware');
const authorizeRole = require('../middlewares/authorize-role.middleware');

const router = Router();
const requireAdmin = [authenticateJwt, authorizeRole('admin')];

router.get('/',    ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/',   requireAdmin, ctrl.create);
router.put('/:id', requireAdmin, ctrl.update);
router.delete('/:id', requireAdmin, ctrl.remove);

module.exports = router;
