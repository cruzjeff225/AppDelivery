const { Router } = require('express');
const ctrl = require('../controllers/user.controller');
const authenticateJwt = require('../middlewares/authenticate-jwt.middleware');
const authorizeRole = require('../middlewares/authorize-role.middleware');

const router = Router();

router.use(authenticateJwt, authorizeRole('admin'));

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
