const jwtService = require('../../infrastructure/security/jwt.service');

const authenticateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado: token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwtService.verify(token);
    req.user = { id: payload.id, role: payload.role, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'No autorizado: token inválido o expirado' });
  }
};

module.exports = authenticateJwt;
