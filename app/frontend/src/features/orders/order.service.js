import api from '../../services/api';

export async function createOrder(addressId, items, key) {
  const { data } = await api.post('/orders', {
    address_id: Number(addressId),
    items: items.map((item) => ({ product_id: Number(item.id), quantity: item.quantity })),
  }, { headers: { 'Idempotency-Key': key } });
  return data.order;
}

// status: undefined = pedidos en curso, 'ALL' = todos, o una lista de estados separada por comas.
export async function getOrders(status) {
  const { data } = await api.get('/orders', { params: status ? { status } : {} });
  return data;
}

export async function getOrder(id) {
  const { data } = await api.get(`/orders/${id}`);
  return data;
}

export async function updateOrderStatus(id, status) {
  const { data } = await api.patch(`/orders/${id}/status`, { status });
  return data;
}
