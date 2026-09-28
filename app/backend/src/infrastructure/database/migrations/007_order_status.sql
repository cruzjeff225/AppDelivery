BEGIN;

-- Solo se admiten los estados de la máquina de estados del pedido (RF-06).
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('CREADO', 'PAGADO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'));

-- Repartidor que tomó el pedido al pasar a EN_CAMINO.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_user_id INT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);

-- Bitácora de cada cambio de estado.
CREATE TABLE IF NOT EXISTS order_status_history (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status VARCHAR(30),
  to_status VARCHAR(30) NOT NULL,
  changed_by INT REFERENCES users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS order_status_history_order_id_idx ON order_status_history(order_id);

-- Los pedidos anteriores a esta migración inician su historial con el estado actual.
INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, changed_at)
SELECT o.id, NULL, o.status, o.user_id, o.created_at FROM orders o
WHERE NOT EXISTS (SELECT 1 FROM order_status_history h WHERE h.order_id = o.id);

COMMIT;
