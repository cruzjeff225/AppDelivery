const pool = require('../config/database.config');

const findAll = async () => {
  const { rows } = await pool.query(
    'SELECT id, name, email, phone, role, created_at FROM users ORDER BY id DESC'
  );
  return rows;
};

const findById = async (id) => {
  const { rows } = await pool.query(
    'SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
};

const findByEmail = async (email) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
};

const create = async ({ name, email, phone, password, role = 'customer' }) => {
  const { rows } = await pool.query(
    'INSERT INTO users (name, email, phone, password, role) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, phone, role, created_at',
    [name, email, phone || null, password, role]
  );
  return rows[0];
};

const update = async (id, { name, email, phone, role, password }) => {
  if (password) {
    const { rows } = await pool.query(
      'UPDATE users SET name = $1, email = $2, phone = $3, role = $4, password = $5 WHERE id = $6 RETURNING id, name, email, phone, role, created_at',
      [name, email, phone || null, role || 'customer', password, id]
    );
    return rows[0];
  } else {
    const { rows } = await pool.query(
      'UPDATE users SET name = $1, email = $2, phone = $3, role = $4 WHERE id = $5 RETURNING id, name, email, phone, role, created_at',
      [name, email, phone || null, role || 'customer', id]
    );
    return rows[0];
  }
};

const remove = async (id) => {
  const { rows } = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
  return rows[0] || null;
};

module.exports = { findAll, findById, findByEmail, create, update, remove };