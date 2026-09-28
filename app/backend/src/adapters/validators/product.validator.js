// En una actualización (partial = true) solo se validan los campos enviados.
const validate = (body, { partial = false } = {}) => {
  const errors = [];
  const { category_id, name, price } = body;
  const has = (value) => value !== undefined && value !== null && value !== '';

  if (!partial || has(category_id)) {
    if (!category_id || isNaN(Number(category_id)))
      errors.push('category_id: requerido y debe ser un número');
  }

  if (!partial || has(name)) {
    if (!name || name.trim().length < 2)
      errors.push('name: mínimo 2 caracteres');

    if (name && name.trim().length > 150)
      errors.push('name: máximo 150 caracteres');
  }

  if (!partial || has(price)) {
    if (!has(price))
      errors.push('price: requerido');
    else if (isNaN(Number(price)) || Number(price) <= 0)
      errors.push('price: debe ser un número mayor a 0');
  }

  return errors;
};

module.exports = { validate };
