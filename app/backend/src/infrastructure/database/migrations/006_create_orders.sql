BEGIN;

-- Los lotes agotados se conservan para mantener el historial de inventario.
ALTER TABLE stock DROP CONSTRAINT IF EXISTS stock_quantity_check;
ALTER TABLE stock ADD CONSTRAINT stock_quantity_check CHECK (quantity >= 0);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  idempotency_key VARCHAR(80) NOT NULL,
  request_payload JSONB NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'CREADO',
  delivery_address JSONB NOT NULL DEFAULT '{}'::jsonb,
  subtotal NUMERIC(16,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  tax NUMERIC(16,2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  shipping_fee NUMERIC(16,2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
  total NUMERIC(16,2) NOT NULL DEFAULT 0 CHECK (total = subtotal + tax + shipping_fee),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(150) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price > 0),
  subtotal NUMERIC(16,2) NOT NULL CHECK (subtotal = unit_price * quantity),
  tax NUMERIC(16,2) NOT NULL CHECK (tax >= 0),
  total NUMERIC(16,2) NOT NULL CHECK (total = subtotal + tax)
);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
COMMIT;
