const { Router } = require('express');
const ctrl = require('../controllers/location.controller');

const router = Router();

router.get('/departments', ctrl.getDepartments);
router.get('/departments/:departmentId/municipalities', ctrl.getMunicipalities);
router.get('/municipalities', ctrl.getMunicipalities);

module.exports = router;
