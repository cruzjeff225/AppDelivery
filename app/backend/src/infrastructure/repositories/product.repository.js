const pool = require('../config/database.config');

const findAll = async (categoryId) => {
  const base = `
    SELECT p.*, c.name AS category_name,
           COALESCE(SUM(s.quantity), 0) AS total_stock
      FROM products p
      JOIN categories c ON c.id = p.category_id
      LEFT JOIN stock s ON s.product_id = p.id
  `;
  if (categoryId) {
    const { rows } = await pool.query(
      base + ' WHERE p.category_id = $1 GROUP BY p.id, c.name ORDER BY p.name ASC',
      [categoryId]
    );
    return rows;
  }
  const { rows } = await pool.query(
    base + ' GROUP BY p.id, c.name ORDER BY p.name ASC'
  );
  return rows;
};

const findById = async (id) => {
  const { rows } = await pool.query(
    `SELECT p.*, c.name AS category_name,
            COALESCE(SUM(s.quantity), 0) AS total_stock
       FROM products p
       JOIN categories c ON c.id = p.category_id
       LEFT JOIN stock s ON s.product_id = p.id
      WHERE p.id = $1
      GROUP BY p.id, c.name`,
    [id]
  );
  return rows[0] || null;
};

const create = async ({ category_id, name, description, price, image_path }) => {
  const { rows } = await pool.query(
    `INSERT INTO products (category_id, name, description, price, image_path)
          VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [category_id, name, description ?? null, price, image_path ?? null]
  );
  return rows[0];
};

const update = async (id, { category_id, name, description, price, image_path, is_available }) => {
  const { rows } = await pool.query(
    `UPDATE products
        SET category_id  = COALESCE($1, category_id),
            name         = COALESCE($2, name),
            description  = COALESCE($3, description),
            price        = COALESCE($4, price),
            image_path   = COALESCE($5, image_path),
            is_available = COALESCE($6, is_available),
            updated_at   = NOW()
      WHERE id = $7
  RETURNING *`,
    [
      category_id  ?? null,
      name         ?? null,
      description  ?? null,
      price        ?? null,
      image_path   ?? null,
      is_available ?? null,
      id,
    ]
  );
  return rows[0] || null;
};

const remove = async (id) => {
  const { rows } = await pool.query(
    'DELETE FROM products WHERE id = $1 RETURNING *',
    [id]
  );
  return rows[0] || null;
};

module.exports = { findAll, findById, create, update, remove };
