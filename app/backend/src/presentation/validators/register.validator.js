const validate = (body) => {
  const errors = [];
  const { name, email, password } = body;

  if (!name || name.trim().length < 2)
    errors.push('name: mínimo 2 caracteres');

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.push('email: formato inválido');

  if (!password || password.length < 8)
    errors.push('password: mínimo 8 caracteres');

  return errors;
};

module.exports = { validate };