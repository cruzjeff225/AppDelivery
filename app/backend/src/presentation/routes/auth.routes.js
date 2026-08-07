const { Router } = require('express');
const { register } = require('../controllers/auth.controller');

const router = Router();
router.post('/register', register);

module.exports = router;