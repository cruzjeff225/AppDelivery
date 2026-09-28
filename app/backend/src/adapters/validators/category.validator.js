// En una actualización (partial = true) solo se valida el nombre si se envía.
const validate = (body, { partial = false } = {}) => {
  const errors = [];
  const { name } = body;

  if (partial && name === undefined) return errors;

  if (typeof name !== 'string' || name.trim().length < 2)
    errors.push('name: mínimo 2 caracteres');
  else if (name.trim().length > 100)
    errors.push('name: máximo 100 caracteres');

  return errors;
};

module.exports = { validate };
