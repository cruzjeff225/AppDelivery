const pool = require('../config/database.config');

const findByProduct = async (productId) => {
  const { rows } = await pool.query(
    'SELECT * FROM stock WHERE product_id = $1 ORDER BY entry_date DESC',
    [productId]
  );
  return rows;
};

const getTotalByProduct = async (productId) => {
  const { rows } = await pool.query(
    'SELECT COALESCE(SUM(quantity), 0) AS total FROM stock WHERE product_id = $1',
    [productId]
  );
  return parseInt(rows[0].total, 10);
};

const create = async ({ product_id, lot_number, quantity, entry_date, expiry_date }) => {
  const { rows } = await pool.query(
    `INSERT INTO stock (product_id, lot_number, quantity, entry_date, expiry_date)
          VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [product_id, lot_number, quantity, entry_date, expiry_date ?? null]
  );
  return rows[0];
};

const remove = async (lotId) => {
  const { rows } = await pool.query(
    'DELETE FROM stock WHERE id = $1 RETURNING *',
    [lotId]
  );
  return rows[0] || null;
};

module.exports = { findByProduct, getTotalByProduct, create, remove };
