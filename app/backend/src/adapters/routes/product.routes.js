const { Router } = require('express');
const ctrl   = require('../controllers/product.controller');
const upload = require('../middlewares/upload.middleware');
const authenticateJwt = require('../middlewares/authenticate-jwt.middleware');
const authorizeRole = require('../middlewares/authorize-role.middleware');

const router = Router();
const requireAdmin = [authenticateJwt, authorizeRole('admin')];

router.get('/',    ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/',   requireAdmin, upload.single('image'), ctrl.create);
router.put('/:id', requireAdmin, upload.single('image'), ctrl.update);
router.delete('/:id', requireAdmin, ctrl.remove);

module.exports = router;
