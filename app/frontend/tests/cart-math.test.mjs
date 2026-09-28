import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cartAmounts, lineAmounts, sanitizeCart } from '../src/features/cart/cart-math.js';

test('empty cart has no shipping charge', () => {
  assert.deepEqual(cartAmounts([]), { itemCount: 0, subtotal: 0, tax: 0, shippingFee: 0, total: 0 });
});
test('subtotal, 13% IVA and existing shipping fee', () => {
  assert.deepEqual(cartAmounts([{ price: '10.00', quantity: 2 }]), { itemCount: 2, subtotal: 20, tax: 2.6, shippingFee: 2.5, total: 25.1 });
});
test('tax rounding matches server line rounding', () => {
  assert.deepEqual(lineAmounts('0.05', 2), { subtotal: 0.1, tax: 0.01, total: 0.11 });
  assert.equal(cartAmounts([{ price: '0.05', quantity: 2 }, { price: '1.15', quantity: 3 }]).total, 6.51);
});
test('malformed persisted carts and duplicate products are ignored', () => {
  const product = { id: 1, price: '10.00', quantity: 2, total_stock: '5' };
  assert.deepEqual(sanitizeCart([null, product, product, { ...product, id: 2, quantity: -1 }, { ...product, id: 3, total_stock: 0 }]), [product]);
  assert.deepEqual(sanitizeCart({}), []);
});
