const { PGlite } = require('@electric-sql/pglite');
const fs = require('fs');
const path = require('path');
const request = require('supertest');

jest.mock('../src/infrastructure/config/database.config', () => ({ getClient: jest.fn() }));
process.env.JWT_SECRET = 'checkout-test-secret-only';
const database = require('../src/infrastructure/config/database.config');
const jwtService = require('../src/infrastructure/security/jwt.service');
const app = require('../src/app');
let db;
const token = jwtService.sign({ id: 1, role: 'customer' });
const payload = { address_id: 1, items: [{ product_id: 1, quantity: 2 }] };
const post = (body = payload, key = 'checkout-test-key-0001') => request(app).post('/api/orders')
  .set('Authorization', `Bearer ${token}`).set('Idempotency-Key', key).send(body);

beforeAll(async () => {
  db = new PGlite();
  // Real PostgreSQL SQL/constraints/transactions in an isolated in-memory database.
  const migrations = path.join(__dirname, '../src/infrastructure/database/migrations');
  for (const file of ['001_create_users.sql', '002_create_categories.sql', '003_create_products.sql', '004_create_stock.sql', 'create_addresses_table.sql', '006_create_orders.sql']) {
    await db.exec(fs.readFileSync(path.join(migrations, file), 'utf8'));
  }
  database.getClient.mockImplementation(async () => ({ query: (sql, values) => db.query(sql, values), release() {} }));
}, 30000);

beforeEach(async () => {
  await db.exec(`TRUNCATE order_items, orders, stock, products, categories, addresses, users RESTART IDENTITY CASCADE;
    INSERT INTO users (name,email,password) VALUES ('Cliente','test@example.com','test'), ('Otro','other@example.com','test');
    INSERT INTO addresses (user_id,title,address_line1,city) VALUES (1,'Casa','Calle 1','San Salvador'), (2,'Otra','Calle 2','Santa Ana');
    INSERT INTO categories (name) VALUES ('Comida');
    INSERT INTO products (category_id,name,price) VALUES (1,'Pizza',10.00),(1,'Bebida',0.05);
    INSERT INTO stock (product_id,lot_number,quantity) VALUES (1,'A',1),(1,'B',4),(2,'C',2);`);
});
afterAll(async () => { await db?.close(); });

test('saves header, lines, IVA and consumes lots, including a zero balance', async () => {
  const result = await post({ ...payload, total: 0, items: [{ product_id: 1, quantity: 2, price: 0 }] });
  expect(result.status).toBe(201);
  expect(result.body.order).toMatchObject({ status: 'CREADO', subtotal: '20.00', tax: '2.60', shipping_fee: '2.50', total: '25.10' });
  expect((await db.query('SELECT quantity FROM stock WHERE product_id=1 ORDER BY id')).rows).toEqual([{ quantity: 0 }, { quantity: 3 }]);
  expect((await db.query('SELECT count(*) FROM order_items')).rows[0].count).toBe(1);
});

test('a retry returns the same order without a second inventory discount', async () => {
  const first = await post();
  const retry = await post();
  expect(retry.status).toBe(200);
  expect(retry.body.order.id).toBe(first.body.order.id);
  expect((await db.query('SELECT sum(quantity) AS quantity FROM stock WHERE product_id=1')).rows[0].quantity).toBe(3);
  expect((await post({ ...payload, items: [{ product_id: 1, quantity: 1 }] })).status).toBe(409);
});

test('insufficient stock on a later line rolls back header, details and earlier discounts', async () => {
  const response = await post({ ...payload, items: [{ product_id: 1, quantity: 2 }, { product_id: 2, quantity: 3 }] });
  expect(response.status).toBe(409);
  expect((await db.query('SELECT count(*) FROM orders')).rows[0].count).toBe(0);
  expect((await db.query('SELECT count(*) FROM order_items')).rows[0].count).toBe(0);
  expect((await db.query('SELECT sum(quantity) AS quantity FROM stock WHERE product_id=1')).rows[0].quantity).toBe(5);
});

test('a database failure rolls back all writes', async () => {
  await db.exec('ALTER TABLE orders ADD CONSTRAINT simulate_failure CHECK (total < 1)');
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    expect((await post()).status).toBe(500);
    expect((await db.query('SELECT count(*) FROM orders')).rows[0].count).toBe(0);
    expect((await db.query('SELECT sum(quantity) AS quantity FROM stock WHERE product_id=1')).rows[0].quantity).toBe(5);
  } finally {
    log.mockRestore();
    await db.exec('ALTER TABLE orders DROP CONSTRAINT simulate_failure');
  }
});

test('rejects another user address and unavailable products', async () => {
  expect((await post({ ...payload, address_id: 2 })).status).toBe(400);
  await db.exec('UPDATE products SET is_available=false WHERE id=1');
  expect((await post()).status).toBe(409);
});

test.each([[], [{ product_id: 1, quantity: 0 }], [{ product_id: 1, quantity: 1.5 }], [{ product_id: 1, quantity: 1 }, { product_id: 1, quantity: 2 }], [null]].map((items) => [items]))('rejects invalid items %j', async (items) => {
  expect((await post({ ...payload, items })).status).toBe(400);
});

test('requires authentication and an idempotency key', async () => {
  expect((await request(app).post('/api/orders').send(payload)).status).toBe(401);
  expect((await request(app).post('/api/orders').set('Authorization', `Bearer ${token}`).send(payload)).status).toBe(400);
});

test('rounds tax per product line to cents', async () => {
  const response = await post({ ...payload, items: [{ product_id: 2, quantity: 2 }] });
  expect(response.body.order).toMatchObject({ subtotal: '0.10', tax: '0.01', total: '2.61' });
});
