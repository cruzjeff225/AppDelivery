-- Esquema Unificado de Base de Datos - AppDelivery

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  phone      VARCHAR(20),
  password   VARCHAR(255) NOT NULL,
  role       VARCHAR(20) NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar usuario por defecto (ID: 1), password: admin123 (hash bcrypt)
INSERT INTO users (id, name, email, phone, password, role)
VALUES (1, 'Administrador', 'admin@delivery.com', '7000-0000', '$2b$10$27q0MfDStMsZUpPW7YFvkuM4j.mPED0TmSjHlAi7TrGWWfM8aSFm.', 'admin')
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 2. Tabla de Departamentos de El Salvador
CREATE TABLE IF NOT EXISTS departments (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- 3. Tabla de Municipios de El Salvador
CREATE TABLE IF NOT EXISTS municipalities (
  id            SERIAL PRIMARY KEY,
  department_id INT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL
);

-- Población de Departamentos
INSERT INTO departments (id, name) VALUES
  (1, 'San Salvador'),
  (2, 'La Libertad'),
  (3, 'Usulután'),
  (4, 'Santa Ana'),
  (5, 'San Miguel'),
  (6, 'Sonsonate'),
  (7, 'Ahuachapán'),
  (8, 'La Paz'),
  (9, 'Cuscatlán'),
  (10, 'Chalatenango'),
  (11, 'Morazán'),
  (12, 'San Vicente'),
  (13, 'Cabañas'),
  (14, 'La Unión')
ON CONFLICT (id) DO NOTHING;

SELECT setval('departments_id_seq', (SELECT MAX(id) FROM departments));

-- Población de Municipios por Departamento
INSERT INTO municipalities (department_id, name) VALUES
  (1, 'San Salvador'), (1, 'Soyapango'), (1, 'Mejicanos'), (1, 'Ilopango'), (1, 'Delgado'), (1, 'Apopa'), (1, 'San Marcos'),
  (2, 'Santa Tecla'), (2, 'Antiguo Cuscatlán'), (2, 'La Libertad'), (2, 'Colón'), (2, 'San Juan Opico'), (2, 'Zaragoza'),
  (3, 'Santiago De María'), (3, 'Usulután'), (3, 'Jiquilisco'), (3, 'Berlin'), (3, 'Puerto El Triunfo'), (3, 'Alegría'),
  (4, 'Santa Ana'), (4, 'Chalchuapa'), (4, 'Metapán'), (4, 'Coatepeque'),
  (5, 'San Miguel'), (5, 'Ciudad Barrios'), (5, 'Chinameca'),
  (6, 'Sonsonate'), (6, 'Acajutla'), (6, 'Izalco'), (6, 'Nahuizalco'),
  (7, 'Ahuachapán'), (7, 'Ataco'), (7, 'Apaneca'),
  (8, 'Zacatecoluca'), (8, 'Olocuilta'), (8, 'San Luis Talpa'),
  (9, 'Cojutepeque'), (9, 'Suchitoto'),
  (10, 'Chalatenango'), (10, 'La Palma'), (10, 'Nueva Concepción'),
  (11, 'San Francisco Gotera'), (11, 'Perquín'),
  (12, 'San Vicente'), (12, 'Tecoluca'),
  (13, 'Sensuntepeque'), (13, 'Ilobasco'),
  (14, 'La Unión'), (14, 'Conchagua')
ON CONFLICT DO NOTHING;

-- 4. Tabla de Categorías
CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de Productos
CREATE TABLE IF NOT EXISTS products (
  id           SERIAL PRIMARY KEY,
  category_id  INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name         VARCHAR(150) NOT NULL,
  description  TEXT,
  price        NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image_path   VARCHAR(255),
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabla de Inventario / Stock
CREATE TABLE IF NOT EXISTS stock (
  id          SERIAL PRIMARY KEY,
  product_id  INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  lot_number  VARCHAR(50) NOT NULL,
  quantity    INT NOT NULL CHECK (quantity > 0),
  entry_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabla de Direcciones del Cliente
CREATE TABLE IF NOT EXISTS addresses (
  id            SERIAL PRIMARY KEY,
  user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_name VARCHAR(100),
  receiver_phone VARCHAR(20),
  full_name     VARCHAR(100),
  phone         VARCHAR(20),
  dui           VARCHAR(20),
  title         VARCHAR(50) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city          VARCHAR(100) NOT NULL,
  state         VARCHAR(100),
  postal_code   VARCHAR(20),
  country       VARCHAR(100) DEFAULT 'El Salvador',
  latitude      DECIMAL(10,8),
  longitude     DECIMAL(11,8),
  is_default    BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
-- 8. Carrito y checkout transaccional
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

-- 9. Ciclo de vida del pedido (RF-06 / RF-10)
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
