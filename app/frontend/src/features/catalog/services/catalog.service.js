import api from '../../../services/api';

// Usa el cliente central para que las mutaciones (solo admin) lleven el token JWT.

// Lecturas: los hooks muestran `error.message`.
const read = async (request, message) => {
  try {
    const { data } = await request;
    return data;
  } catch {
    throw new Error(message);
  }
};

// Escrituras: los modales esperan el cuerpo de error del servidor ({ errors } o { error }).
const write = async (request) => {
  try {
    const { data } = await request;
    return data;
  } catch (err) {
    throw err.response?.data ?? { error: 'No se pudo conectar con el servidor' };
  }
};

// Sin JSON: axios conserva el FormData y el navegador define el boundary de la imagen.
const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

// ─── Categorías ───────────────────────────────────────────────────────────────

export const getCategories = () =>
  read(api.get('/categories'), 'Error al cargar categorías');

export const createCategory = (data) => write(api.post('/categories', data));

export const updateCategory = (id, data) => write(api.put(`/categories/${id}`, data));

export const deleteCategory = (id) => write(api.delete(`/categories/${id}`));

// ─── Productos ────────────────────────────────────────────────────────────────

export const getProducts = (categoryId) =>
  read(
    api.get('/products', { params: categoryId ? { category_id: categoryId } : {} }),
    'Error al cargar productos'
  );

export const getProductById = (id) =>
  read(api.get(`/products/${id}`), 'Producto no encontrado');

// Usa FormData para enviar imagen + campos de texto
export const createProduct = (formData) => write(api.post('/products', formData, multipart));

export const updateProduct = (id, formData) =>
  write(api.put(`/products/${id}`, formData, multipart));

export const deleteProduct = (id) => write(api.delete(`/products/${id}`));

// ─── Stock ────────────────────────────────────────────────────────────────────

export const getStockByProduct = (productId) =>
  read(api.get(`/stock/${productId}`), 'Error al cargar stock');

export const getStockTotal = (productId) =>
  read(api.get(`/stock/${productId}/total`), 'Error al calcular stock');

export const addStockLot = (productId, data) => write(api.post(`/stock/${productId}`, data));

export const deleteStockLot = (lotId) => write(api.delete(`/stock/lot/${lotId}`));
