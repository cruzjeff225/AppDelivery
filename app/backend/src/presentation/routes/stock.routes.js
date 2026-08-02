const { Router } = require('express');
const ctrl = require('../controllers/stock.controller');

const router = Router({ mergeParams: true });

// GET /api/stock/:product_id        → todos los lotes de un producto
// GET /api/stock/:product_id/total  → stock total acumulado
// POST /api/stock/:product_id       → registrar nuevo lote
// DELETE /api/stock/lot/:lot_id     → eliminar un lote

router.get('/:product_id',        ctrl.getByProduct);
router.get('/:product_id/total',  ctrl.getTotal);
router.post('/:product_id',       ctrl.addLot);
router.delete('/lot/:lot_id',     ctrl.removeLot);

module.exports = router;
