-- Migración 004: tabla stock (lotes de ingreso por producto)
CREATE TABLE IF NOT EXISTS stock (
  id          SERIAL PRIMARY KEY,
  product_id  INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  lot_number  VARCHAR(50) NOT NULL,
  quantity    INT NOT NULL CHECK (quantity > 0),
  entry_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);