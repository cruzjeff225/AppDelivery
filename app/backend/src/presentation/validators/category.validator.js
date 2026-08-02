const validate = (body) => {
  const errors = [];
  const { name } = body;

  if (!name || name.trim().length < 2)
    errors.push('name: mínimo 2 caracteres');

  if (name && name.trim().length > 100)
    errors.push('name: máximo 100 caracteres');

  return errors;
};

module.exports = { validate };
