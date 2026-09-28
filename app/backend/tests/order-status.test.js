const { PGlite } = require('@electric-sql/pglite');
const fs = require('fs');
const path = require('path');
const request = require('supertest');

jest.mock('../src/infrastructure/config/database.config', () => ({ getClient: jest.fn() }));
process.env.JWT_SECRET = 'order-status-test-secret-only';
const database = require('../src/infrastructure/config/database.config');
const jwtService = require('../src/infrastructure/security/jwt.service');
const app = require('../src/app');
let db;
// Users: 1 customer, 2 admin, 3 and 4 riders.
const auth = (id, role) => `Bearer ${jwtService.sign({ id, role })}`;
const customer = auth(1, 'customer');
const admin = auth(2, 'admin');
const rider = auth(3, 'delivery');
const otherRider = auth(4, 'delivery');
const setStatus = (id, status, as = admin) => request(app).patch(`/api/orders/${id}/status`).set('Authorization', as).send({ status });
const stockOf = async (productId) => (await db.query('SELECT sum(quantity)::int AS q FROM stock WHERE product_id=$1', [productId])).rows[0].q;

beforeAll(async () => {
  db = new PGlite();
  const migrations = path.join(__dirname, '../src/infrastructure/database/migrations');
  for (const file of ['001_create_users.sql', '002_create_categories.sql', '003_create_products.sql', '004_create_stock.sql', 'create_addresses_table.sql', '006_create_orders.sql', '007_order_status.sql']) {
    await db.exec(fs.readFileSync(path.join(migrations, file), 'utf8'));
  }
  database.getClient.mockImplementation(async () => ({ query: (sql, values) => db.query(sql, values), release() {} }));
}, 30000);

beforeEach(async () => {
  await db.exec(`TRUNCATE order_status_history, order_items, orders, stock, products, categories, addresses, users RESTART IDENTITY CASCADE;
    INSERT INTO users (name,email,password,role) VALUES ('Cliente','c@x.com','x','customer'), ('Admin','a@x.com','x','admin'),
      ('Rider','r@x.com','x','delivery'), ('Rider 2','r2@x.com','x','delivery');
    INSERT INTO addresses (user_id,title,address_line1,city) VALUES (1,'Casa','Calle 1','San Salvador');
    INSERT INTO categories (name) VALUES ('Comida');
    INSERT INTO products (category_id,name,price) VALUES (1,'Pizza',10.00);
    INSERT INTO stock (product_id,lot_number,quantity) VALUES (1,'A',5);`);
  const created = await request(app).post('/api/orders').set('Authorization', customer)
    .set('Idempotency-Key', 'status-test-key-0001').send({ address_id: 1, items: [{ product_id: 1, quantity: 2 }] });
  expect(created.status).toBe(201);
});
afterAll(async () => { await db?.close(); });

test('admin moves an order through the lifecycle and every step is logged', async () => {
  for (const status of ['PAGADO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO']) {
    const response = await setStatus(1, status);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe(status);
  }
  const detail = await request(app).get('/api/orders/1').set('Authorization', admin);
  expect(detail.body.history.map((h) => h.to_status)).toEqual(['CREADO', 'PAGADO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO']);
  expect(detail.body.items).toHaveLength(1);
  expect(detail.body.available_transitions).toEqual([]);
});

test('invalid transitions return 409 and change nothing', async () => {
  expect((await setStatus(1, 'ENTREGADO')).status).toBe(409);
  expect((await setStatus(1, 'INEXISTENTE')).status).toBe(400);
  expect((await db.query('SELECT status FROM orders WHERE id=1')).rows[0].status).toBe('CREADO');
  expect((await db.query('SELECT count(*)::int AS n FROM order_status_history')).rows[0].n).toBe(1);
});

test('cancelling returns the goods to inventory in a return lot', async () => {
  expect(await stockOf(1)).toBe(3);
  await setStatus(1, 'PAGADO');
  const response = await setStatus(1, 'CANCELADO');
  expect(response.status).toBe(200);
  expect(await stockOf(1)).toBe(5);
  expect((await db.query("SELECT quantity FROM stock WHERE lot_number='DEV-1'")).rows).toEqual([{ quantity: 2 }]);
  expect((await setStatus(1, 'CANCELADO')).status).toBe(409);
  expect(await stockOf(1)).toBe(5);
});

test('rider takes a prepared order, only they can deliver it', async () => {
  await setStatus(1, 'PAGADO');
  expect((await request(app).get('/api/orders').set('Authorization', rider)).body).toEqual([]);
  expect((await setStatus(1, 'EN_PREPARACION', rider)).status).toBe(404);

  await setStatus(1, 'EN_PREPARACION');
  const board = await request(app).get('/api/orders').set('Authorization', rider);
  expect(board.body.map((o) => [o.id, o.available_transitions])).toEqual([[1, ['EN_CAMINO']]]);
  expect((await setStatus(1, 'CANCELADO', rider)).status).toBe(403);

  const taken = await setStatus(1, 'EN_CAMINO', rider);
  expect(taken.body).toMatchObject({ status: 'EN_CAMINO', delivery_user_id: 3, delivery_name: 'Rider' });
  expect((await request(app).get('/api/orders').set('Authorization', otherRider)).body).toEqual([]);
  expect((await setStatus(1, 'ENTREGADO', otherRider)).status).toBe(404);
  expect((await setStatus(1, 'ENTREGADO', rider)).status).toBe(200);
});

test('a failed write rolls back the status change', async () => {
  await db.exec("ALTER TABLE order_status_history ADD CONSTRAINT simulate_failure CHECK (to_status <> 'PAGADO')");
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    expect((await setStatus(1, 'PAGADO')).status).toBe(500);
    expect((await db.query('SELECT status FROM orders WHERE id=1')).rows[0].status).toBe('CREADO');
  } finally {
    log.mockRestore();
    await db.exec('ALTER TABLE order_status_history DROP CONSTRAINT simulate_failure');
  }
});

test('list shows active orders by default and supports filters', async () => {
  expect((await request(app).get('/api/orders').set('Authorization', admin)).body.map((o) => o.status)).toEqual(['CREADO']);
  await setStatus(1, 'CANCELADO');
  expect((await request(app).get('/api/orders').set('Authorization', admin)).body).toEqual([]);
  expect((await request(app).get('/api/orders?status=CANCELADO').set('Authorization', admin)).body).toHaveLength(1);
  expect((await request(app).get('/api/orders?status=ALL').set('Authorization', admin)).body[0]).toMatchObject({
    customer_name: 'Cliente', item_count: 2, total: '25.10',
  });
  expect((await request(app).get('/api/orders?status=NOPE').set('Authorization', admin)).status).toBe(400);
});

test('customers see only their own orders, including finished ones, without actions', async () => {
  await db.exec("INSERT INTO users (name,email,password) VALUES ('Otro','o@x.com','x')");
  const other = auth(5, 'customer');
  await setStatus(1, 'CANCELADO');

  const mine = await request(app).get('/api/orders/mine').set('Authorization', customer);
  expect(mine.status).toBe(200);
  expect(mine.body.map((o) => [o.id, o.status, o.available_transitions])).toEqual([[1, 'CANCELADO', []]]);
  expect((await request(app).get('/api/orders/mine').set('Authorization', other)).body).toEqual([]);

  const detail = await request(app).get('/api/orders/1').set('Authorization', customer);
  expect(detail.status).toBe(200);
  expect(detail.body.history.map((h) => h.to_status)).toEqual(['CREADO', 'CANCELADO']);
  expect((await request(app).get('/api/orders/1').set('Authorization', other)).status).toBe(404);
  expect((await request(app).get('/api/orders/mine')).status).toBe(401);
});

test('only customers can buy, list their orders and manage addresses', async () => {
  const payload = { address_id: 1, items: [{ product_id: 1, quantity: 1 }] };
  for (const staff of [admin, rider]) {
    const order = await request(app).post('/api/orders').set('Authorization', staff)
      .set('Idempotency-Key', 'staff-purchase-key-0001').send(payload);
    expect(order.status).toBe(403);
    expect((await request(app).get('/api/orders/mine').set('Authorization', staff)).status).toBe(403);
    expect((await request(app).get('/api/addresses').set('Authorization', staff)).status).toBe(403);
    expect((await request(app).post('/api/addresses').set('Authorization', staff).send({})).status).toBe(403);
  }
  expect((await db.query('SELECT count(*)::int AS n FROM orders')).rows[0].n).toBe(1);
  expect((await request(app).get('/api/orders/mine').set('Authorization', customer)).status).toBe(200);
});

test('customers and anonymous users cannot use the monitoring endpoints', async () => {
  expect((await request(app).get('/api/orders')).status).toBe(401);
  expect((await request(app).get('/api/orders').set('Authorization', customer)).status).toBe(403);
  expect((await setStatus(1, 'PAGADO', customer)).status).toBe(403);
  expect((await request(app).get('/api/orders/99').set('Authorization', admin)).status).toBe(404);
  expect((await request(app).get('/api/orders/abc').set('Authorization', admin)).status).toBe(400);
});
