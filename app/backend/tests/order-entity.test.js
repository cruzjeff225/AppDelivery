const Order = require('../src/domain/entities/Order');

const admin = { id: 1, role: 'admin' };
const rider = { id: 7, role: 'delivery' };
const otherRider = { id: 8, role: 'delivery' };
const customer = { id: 3, role: 'customer' };

test('admin walks the full happy path', () => {
  const order = new Order({ userId: 3 });
  for (const next of ['PAGADO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO']) {
    order.transitionTo(next, admin);
  }
  expect(order.status).toBe('ENTREGADO');
  expect(order.isFinal()).toBe(true);
  expect(order.availableTransitions(admin)).toEqual([]);
});

test.each([
  ['CREADO', 'EN_CAMINO'],
  ['PAGADO', 'ENTREGADO'],
  ['EN_CAMINO', 'CANCELADO'],
  ['ENTREGADO', 'CANCELADO'],
  ['CANCELADO', 'PAGADO'],
])('rejects %s -> %s', (from, to) => {
  const order = new Order({ userId: 3, status: from });
  expect(() => order.transitionTo(to, admin)).toThrow(expect.objectContaining({ name: 'ConflictError' }));
  expect(order.status).toBe(from);
});

test('cancelling is allowed before dispatch and requires restock', () => {
  for (const status of ['CREADO', 'PAGADO', 'EN_PREPARACION']) {
    const order = new Order({ userId: 3, status });
    expect(order.transitionTo('CANCELADO', admin)).toBe(status);
    expect(order.requiresRestock()).toBe(true);
  }
});

test('rider can only dispatch and deliver, and gets assigned', () => {
  const order = new Order({ userId: 3, status: 'PAGADO' });
  expect(order.availableTransitions(rider)).toEqual([]);
  expect(() => order.transitionTo('EN_PREPARACION', rider)).toThrow(expect.objectContaining({ name: 'ForbiddenError' }));

  order.transitionTo('EN_PREPARACION', admin);
  expect(order.availableTransitions(rider)).toEqual(['EN_CAMINO']);
  expect(() => order.transitionTo('CANCELADO', rider)).toThrow(expect.objectContaining({ name: 'ForbiddenError' }));
  order.transitionTo('EN_CAMINO', rider);
  expect(order.deliveryUserId).toBe(7);

  expect(order.isVisibleTo(otherRider)).toBe(false);
  expect(() => order.transitionTo('ENTREGADO', otherRider)).toThrow(expect.objectContaining({ name: 'ForbiddenError' }));
  order.transitionTo('ENTREGADO', rider);
  expect(order.status).toBe('ENTREGADO');
});

test('visibility by role', () => {
  expect(new Order({ userId: 3, status: 'CREADO' }).isVisibleTo(rider)).toBe(false);
  expect(new Order({ userId: 3, status: 'EN_PREPARACION' }).isVisibleTo(rider)).toBe(true);
  expect(new Order({ userId: 3, status: 'EN_CAMINO' }).isVisibleTo(rider)).toBe(true);
  expect(new Order({ userId: 3, status: 'CREADO' }).isVisibleTo(admin)).toBe(true);
  expect(new Order({ userId: 3, status: 'CREADO' }).isVisibleTo(customer)).toBe(true);
  expect(new Order({ userId: 9, status: 'CREADO' }).isVisibleTo(customer)).toBe(false);
  expect(new Order({ userId: 3, status: 'CREADO' }).availableTransitions(customer)).toEqual([]);
});

test('unknown statuses are rejected', () => {
  expect(() => new Order({ userId: 3, status: 'PERDIDO' })).toThrow();
  expect(Order.isValidStatus('EN_CAMINO')).toBe(true);
  expect(Order.isValidStatus('toString')).toBe(false);
});
