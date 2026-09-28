import api from '../../services/api';

export async function createOrder(addressId, items, key) {
  const { data } = await api.post('/orders', {
    address_id: Number(addressId),
    items: items.map((item) => ({ product_id: Number(item.id), quantity: item.quantity })),
  }, { headers: { 'Idempotency-Key': key } });
  return data.order;
}
