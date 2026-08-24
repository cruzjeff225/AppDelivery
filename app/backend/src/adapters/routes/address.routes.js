const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address.controller');
const { validateCreateAddress, validateUpdateAddress } = require('../validators/address.validator');
const authenticateJwt = require('../middlewares/authenticate-jwt.middleware');

/**
 * Enrutador de Express para Direcciones (`/api/addresses`)
 */

router.use(authenticateJwt);

// Crear dirección
router.post('/', validateCreateAddress, (req, res) => addressController.create(req, res));

// Obtener todas las direcciones del usuario
router.get('/', (req, res) => addressController.getMyAddresses(req, res));

// Actualizar dirección por ID
router.put('/:id', validateUpdateAddress, (req, res) => addressController.update(req, res));

// Marcar dirección como predeterminada por ID
router.patch('/:id/default', validateUpdateAddress, (req, res) => addressController.setDefault(req, res));

// Eliminar dirección por ID
router.delete('/:id', validateUpdateAddress, (req, res) => addressController.delete(req, res));

module.exports = router;
