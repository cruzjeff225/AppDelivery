import { API_BASE_URL } from '../../../config/api';

// ─── Categorías ───────────────────────────────────────────────────────────────

export const getCategories = async () => {
  const res = await fetch(`${API_BASE_URL}/categories`);
  if (!res.ok) throw new Error('Error al cargar categorías');
  return res.json();
};

export const createCategory = async (data) => {
  const res = await fetch(`${API_BASE_URL}/categories`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const updateCategory = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const deleteCategory = async (id) => {
  const res = await fetch(`${API_BASE_URL}/categories/${id}`, { method: 'DELETE' });
  if (!res.ok) throw await res.json();
  return res.json();
};

// ─── Productos ────────────────────────────────────────────────────────────────

export const getProducts = async (categoryId) => {
  const url = categoryId
    ? `${API_BASE_URL}/products?category_id=${categoryId}`
    : `${API_BASE_URL}/products`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al cargar productos');
  return res.json();
};

export const getProductById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/products/${id}`);
  if (!res.ok) throw new Error('Producto no encontrado');
  return res.json();
};

// Usa FormData para enviar imagen + campos de texto
export const createProduct = async (formData) => {
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    body:   formData, // sin Content-Type → browser lo pone automáticamente
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const updateProduct = async (id, formData) => {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    body:   formData,
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const deleteProduct = async (id) => {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
  if (!res.ok) throw await res.json();
  return res.json();
};

// ─── Stock ────────────────────────────────────────────────────────────────────

export const getStockByProduct = async (productId) => {
  const res = await fetch(`${API_BASE_URL}/stock/${productId}`);
  if (!res.ok) throw new Error('Error al cargar stock');
  return res.json();
};

export const getStockTotal = async (productId) => {
  const res = await fetch(`${API_BASE_URL}/stock/${productId}/total`);
  if (!res.ok) throw new Error('Error al calcular stock');
  return res.json();
};

export const addStockLot = async (productId, data) => {
  const res = await fetch(`${API_BASE_URL}/stock/${productId}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const deleteStockLot = async (lotId) => {
  const res = await fetch(`${API_BASE_URL}/stock/lot/${lotId}`, { method: 'DELETE' });
  if (!res.ok) throw await res.json();
  return res.json();
};
