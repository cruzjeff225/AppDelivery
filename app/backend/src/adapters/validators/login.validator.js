const validate = (body) => {
  const errors = [];
  const { email, password } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.push('email: formato inválido');

  if (!password)
    errors.push('password: es requerido');

  return errors;
};

module.exports = { validate };
