BEGIN;

-- RF-03 / RF-09: el precio de un producto debe ser mayor a 0.
-- Si existen productos con precio 0 hay que corregirlos antes de aplicar esta migración.
DO $$
DECLARE
  invalid TEXT;
BEGIN
  SELECT string_agg(id || ' (' || name || ')', ', ' ORDER BY id) INTO invalid
  FROM products WHERE price <= 0;
  IF invalid IS NOT NULL THEN
    RAISE EXCEPTION 'Productos con precio menor o igual a 0: %. Actualiza su precio y vuelve a ejecutar la migración.', invalid;
  END IF;
END $$;

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_price_check;
ALTER TABLE products ADD CONSTRAINT products_price_check CHECK (price > 0);

COMMIT;
