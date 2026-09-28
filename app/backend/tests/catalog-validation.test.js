const { PGlite } = require('@electric-sql/pglite');
const fs = require('fs');
const path = require('path');
const request = require('supertest');

jest.mock('../src/infrastructure/config/database.config', () => ({ query: jest.fn(), getClient: jest.fn() }));
process.env.JWT_SECRET = 'catalog-test-secret-only';
const database = require('../src/infrastructure/config/database.config');
const jwtService = require('../src/infrastructure/security/jwt.service');
const app = require('../src/app');
const productValidator = require('../src/adapters/validators/product.validator');
const stockValidator = require('../src/adapters/validators/stock.validator');

const admin = `Bearer ${jwtService.sign({ id: 1, role: 'admin' })}`;
const migrations = path.join(__dirname, '../src/infrastructure/database/migrations');
const migration = (file) => fs.readFileSync(path.join(migrations, file), 'utf8');
const product = { category_id: 1, name: 'Pizza', price: '4.75' };

beforeEach(() => database.query.mockReset());

test.each([['0'], [0], ['-1'], ['abc'], ['']])('product price %j is rejected', (price) => {
  expect(productValidator.validate({ ...product, price })).toEqual([expect.stringMatching(/^price:/)]);
});

test('product price above 0 is accepted, and partial updates only check sent fields', () => {
  expect(productValidator.validate({ ...product, price: '0.01' })).toEqual([]);
  expect(productValidator.validate({ name: 'Pizza grande' }, { partial: true })).toEqual([]);
  expect(productValidator.validate({ price: '0' }, { partial: true })).toEqual([expect.stringMatching(/^price:/)]);
});

test.each([['0'], ['-3'], ['1.5'], ['x']])('stock quantity %j is rejected', (quantity) => {
  expect(stockValidator.validate({ lot_number: 'A', quantity, entry_date: '2026-09-27' }))
    .toEqual([expect.stringMatching(/^quantity:/)]);
});

test('creating or editing a product with price 0 returns 400 without touching the database', async () => {
  const created = await request(app).post('/api/products').set('Authorization', admin).send({ ...product, price: 0 });
  expect(created.status).toBe(400);
  const updated = await request(app).put('/api/products/1').set('Authorization', admin).send({ price: '0' });
  expect(updated.status).toBe(400);
  expect(updated.body.errors).toEqual(['price: debe ser un número mayor a 0']);
  expect(database.query).not.toHaveBeenCalled();
});

test('a partial product update with valid data reaches the repository', async () => {
  database.query.mockResolvedValue({ rows: [{ id: 1, name: 'Pizza grande' }] });
  const response = await request(app).put('/api/products/1').set('Authorization', admin).send({ name: 'Pizza grande' });
  expect(response.status).toBe(200);
  expect(database.query).toHaveBeenCalledTimes(1);
});

describe('migration 008', () => {
  let db;
  beforeEach(async () => {
    db = new PGlite();
    for (const file of ['001_create_users.sql', '002_create_categories.sql', '003_create_products.sql']) {
      await db.exec(migration(file));
    }
    await db.exec("INSERT INTO categories (name) VALUES ('Comida')");
  }, 30000);
  afterEach(async () => { await db?.close(); });

  test('enforces price > 0 in the database', async () => {
    await db.exec(migration('008_product_price_positive.sql'));
    await expect(db.query("INSERT INTO products (category_id,name,price) VALUES (1,'Gratis',0)")).rejects.toThrow(/products_price_check/);
    await db.query("INSERT INTO products (category_id,name,price) VALUES (1,'Pizza',0.01)");
  });

  test('stops and lists the products that still have price 0', async () => {
    await db.exec("INSERT INTO products (category_id,name,price) VALUES (1,'Gratis',0)");
    await expect(db.exec(migration('008_product_price_positive.sql'))).rejects.toThrow(/1 \(Gratis\)/);
  });
});
