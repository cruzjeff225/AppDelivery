const validate = (body) => {
  const errors = [];
  const { category_id, name, price } = body;

  if (!category_id || isNaN(Number(category_id)))
    errors.push('category_id: requerido y debe ser un número');

  if (!name || name.trim().length < 2)
    errors.push('name: mínimo 2 caracteres');

  if (name && name.trim().length > 150)
    errors.push('name: máximo 150 caracteres');

  if (price === undefined || price === null || price === '')
    errors.push('price: requerido');
  else if (isNaN(Number(price)) || Number(price) < 0)
    errors.push('price: debe ser un número mayor o igual a 0');

  return errors;
};

module.exports = { validate };
