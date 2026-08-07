const pool = require('../config/database.config');

const findByEmail = async (email) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
};

const create = async ({ name, email, password, role = 'customer' }) => {
  const { rows } = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role, created_at',
    [name, email, password, role]
  );
  return rows[0];
};

module.exports = { findByEmail, create };