const { Router } = require('express');
const ctrl   = require('../controllers/product.controller');
const upload = require('../middlewares/upload.middleware');

const router = Router();

router.get('/',    ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/',   upload.single('image'), ctrl.create);
router.put('/:id', upload.single('image'), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
