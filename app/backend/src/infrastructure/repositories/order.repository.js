const database = require('../config/database.config');

const fail = (status, message) => Object.assign(new Error(message), { status });
const money = (cents) => (cents / 100).toFixed(2);

// All writes use the same connection: a failed line rolls back the entire order.
const create = async (userId, key, input) => {
  const client = await database.getClient();
  try {
    await client.query('BEGIN');
    // The unique key also serializes simultaneous retries of the same checkout.
    const inserted = await client.query(
      `INSERT INTO orders (user_id, idempotency_key, request_payload)
       VALUES ($1, $2, $3::jsonb)
       ON CONFLICT (user_id, idempotency_key) DO NOTHING RETURNING id`,
      [userId, key, JSON.stringify(input)]
    );
    if (!inserted.rows.length) {
      const { rows: [existing] } = await client.query(
        'SELECT * FROM orders WHERE user_id = $1 AND idempotency_key = $2', [userId, key]
      );
      if (existing.request_payload.address_id !== input.address_id ||
          existing.request_payload.items.length !== input.items.length ||
          existing.request_payload.items.some((item, i) => item.product_id !== input.items[i].product_id || item.quantity !== input.items[i].quantity)) {
        throw fail(409, 'Esta clave ya corresponde a otro pedido.');
      }
      await client.query('COMMIT');
      return { order: publicOrder(existing), replayed: true };
    }
    const orderId = inserted.rows[0].id;
    const { rows: [address] } = await client.query(
      'SELECT * FROM addresses WHERE id = $1 AND user_id = $2 FOR SHARE', [input.address_id, userId]
    );
    if (!address) throw fail(400, 'La dirección no existe o no te pertenece.');

    let subtotalCents = 0;
    let taxCents = 0;
    // Always lock products in ascending ID order to avoid checkout deadlocks.
    for (const item of input.items) {
      const { rows: [product] } = await client.query(
        'SELECT * FROM products WHERE id = $1 FOR UPDATE', [item.product_id]
      );
      if (!product || !product.is_available || Number(product.price) <= 0) {
        throw fail(409, 'Un producto ya no está disponible. Revisa el catálogo.');
      }
      const { rows: lots } = await client.query(
        'SELECT id, quantity FROM stock WHERE product_id = $1 ORDER BY entry_date, id FOR UPDATE', [item.product_id]
      );
      if (lots.reduce((sum, lot) => sum + lot.quantity, 0) < item.quantity) {
        throw fail(409, `No hay existencias suficientes de ${product.name}. Revisa el catálogo.`);
      }
      const unitCents = Math.round(Number(product.price) * 100);
      const lineCents = unitCents * item.quantity;
      const lineTax = Math.round(lineCents * 13 / 100);
      subtotalCents += lineCents;
      taxCents += lineTax;
      if (!Number.isSafeInteger(subtotalCents + taxCents + 250)) {
        throw fail(400, 'El importe del pedido supera el máximo permitido.');
      }
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal, tax, total)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [orderId, product.id, product.name, item.quantity, money(unitCents), money(lineCents), money(lineTax), money(lineCents + lineTax)]
      );
      let remaining = item.quantity;
      for (const lot of lots) {
        if (!remaining) break;
        const taken = Math.min(remaining, lot.quantity);
        await client.query('UPDATE stock SET quantity = quantity - $1 WHERE id = $2', [taken, lot.id]);
        remaining -= taken;
      }
    }
    await client.query(
      `INSERT INTO order_status_history (order_id, from_status, to_status, changed_by)
       VALUES ($1, NULL, 'CREADO', $2)`,
      [orderId, userId]
    );
    const shippingCents = 250;
    const { rows: [order] } = await client.query(
      `UPDATE orders SET delivery_address = $1::jsonb, subtotal = $2, tax = $3, shipping_fee = $4, total = $5
       WHERE id = $6 RETURNING *`,
      [JSON.stringify(address), money(subtotalCents), money(taxCents), money(shippingCents), money(subtotalCents + taxCents + shippingCents), orderId]
    );
    await client.query('COMMIT');
    return { order: publicOrder(order), replayed: false };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

function publicOrder(order) {
  const { id, status, subtotal, tax, shipping_fee, total, delivery_address, created_at } = order;
  return { id, status, subtotal, tax, shipping_fee, total, delivery_address, created_at };
}

const SUMMARY_SQL = `
  SELECT o.id, o.user_id, o.status, o.delivery_user_id, o.subtotal, o.tax, o.shipping_fee, o.total,
         o.delivery_address, o.created_at, o.updated_at,
         c.name AS customer_name, c.phone AS customer_phone, d.name AS delivery_name,
         (SELECT COALESCE(SUM(i.quantity), 0)::int FROM order_items i WHERE i.order_id = o.id) AS item_count
  FROM orders o
  JOIN users c ON c.id = o.user_id
  LEFT JOIN users d ON d.id = o.delivery_user_id`;

// Uses a pooled client like create(), so every query runs through the same connection helper.
const withClient = async (work) => {
  const client = await database.getClient();
  try {
    return await work(client);
  } finally {
    client.release();
  }
};

const list = ({ statuses = null, userId = null, limit = 200 } = {}) => withClient(async (client) => {
  const { rows } = await client.query(
    `${SUMMARY_SQL}
     WHERE ($1::text[] IS NULL OR o.status = ANY($1::text[]))
       AND ($2::int IS NULL OR o.user_id = $2::int)
     ORDER BY o.created_at DESC, o.id DESC
     LIMIT $3`,
    [statuses, userId, limit]
  );
  return rows;
});

const findById = (id) => withClient(async (client) => {
  const { rows: [order] } = await client.query(`${SUMMARY_SQL} WHERE o.id = $1`, [id]);
  if (!order) return null;
  const { rows: items } = await client.query(
    `SELECT id, product_id, product_name, quantity, unit_price, subtotal, tax, total
     FROM order_items WHERE order_id = $1 ORDER BY id`, [id]
  );
  const { rows: history } = await client.query(
    `SELECT h.from_status, h.to_status, h.changed_at, u.name AS changed_by_name
     FROM order_status_history h LEFT JOIN users u ON u.id = h.changed_by
     WHERE h.order_id = $1 ORDER BY h.changed_at, h.id`, [id]
  );
  return { ...order, items, history };
});

/**
 * Locks the order row, lets `decide` apply the domain transition and persists the
 * new status, the history entry and (when cancelling) the returned inventory atomically.
 * `decide(row)` returns { status, deliveryUserId, previousStatus, restock }.
 */
const changeStatus = (id, changedBy, decide) => withClient(async (client) => {
  try {
    await client.query('BEGIN');
    const { rows: [row] } = await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [id]);
    const result = decide(row || null);
    await client.query(
      `UPDATE orders SET status = $1, delivery_user_id = $2, updated_at = NOW() WHERE id = $3`,
      [result.status, result.deliveryUserId, id]
    );
    await client.query(
      `INSERT INTO order_status_history (order_id, from_status, to_status, changed_by)
       VALUES ($1, $2, $3, $4)`,
      [id, result.previousStatus, result.status, changedBy]
    );
    if (result.restock) {
      // Cancelled goods go back as a return lot so the consumed lots keep their history.
      await client.query(
        `INSERT INTO stock (product_id, lot_number, quantity)
         SELECT product_id, 'DEV-' || order_id, quantity
         FROM order_items WHERE order_id = $1 AND product_id IS NOT NULL
         ORDER BY product_id`,
        [id]
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
});

module.exports = { create, list, findById, changeStatus };
