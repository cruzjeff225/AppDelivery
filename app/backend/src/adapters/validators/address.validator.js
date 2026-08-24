/**
 * Middleware de Validación de Peticiones HTTP para Direcciones.
 * Filtra datos de entrada antes de tocar los casos de uso.
 */
function validateCreateAddress(req, res, next) {
  const { title, addressLine1, city } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim() === '') {
    errors.push('El campo "title" es obligatorio y debe ser un texto.');
  }

  if (!addressLine1 || typeof addressLine1 !== 'string' || addressLine1.trim() === '') {
    errors.push('El campo "addressLine1" es obligatorio y debe ser un texto.');
  }

  if (!city || typeof city !== 'string' || city.trim() === '') {
    errors.push('El campo "city" es obligatorio y debe ser un texto.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ status: 'error', errors });
  }

  next();
}

function validateUpdateAddress(req, res, next) {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id, 10))) {
    return res.status(400).json({ status: 'error', message: 'ID de dirección inválido en los parámetros.' });
  }
  next();
}

module.exports = {
  validateCreateAddress,
  validateUpdateAddress
};
