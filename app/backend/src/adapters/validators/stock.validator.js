const validate = (body) => {
  const errors = [];
  const { lot_number, quantity, entry_date } = body;

  if (!lot_number || lot_number.trim().length < 1)
    errors.push('lot_number: requerido');

  if (lot_number && lot_number.trim().length > 50)
    errors.push('lot_number: máximo 50 caracteres');

  if (quantity === undefined || quantity === null || quantity === '')
    errors.push('quantity: requerido');
  else if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0)
    errors.push('quantity: debe ser un número entero mayor a 0');

  if (!entry_date)
    errors.push('entry_date: requerido (formato YYYY-MM-DD)');
  else if (isNaN(Date.parse(entry_date)))
    errors.push('entry_date: formato de fecha inválido (use YYYY-MM-DD)');

  return errors;
};

module.exports = { validate };
