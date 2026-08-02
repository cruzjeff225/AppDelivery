import { useState, useEffect, useCallback } from 'react';
import {
  getCategories, createCategory, updateCategory, deleteCategory,
  getProducts,   createProduct,  updateProduct,  deleteProduct,
  getStockByProduct, addStockLot, deleteStockLot,
} from '../services/catalog.service';

export function useCatalog() {
  const [categories,    setCategories]    = useState([]);
  const [products,      setProducts]      = useState([]);
  const [activeCatId,   setActiveCatId]   = useState(null);
  const [loadingCats,   setLoadingCats]   = useState(false);
  const [loadingProds,  setLoadingProds]  = useState(false);
  const [error,         setError]         = useState(null);

  // ─── Cargar categorías ────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    setLoadingCats(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (e) {
      setError(e.message ?? 'Error al cargar categorías');
    } finally {
      setLoadingCats(false);
    }
  }, []);

  // ─── Cargar productos ─────────────────────────────────────────────────────
  const fetchProducts = useCallback(async (categoryId) => {
    setLoadingProds(true);
    try {
      const data = await getProducts(categoryId);
      setProducts(data);
    } catch (e) {
      setError(e.message ?? 'Error al cargar productos');
    } finally {
      setLoadingProds(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchProducts(activeCatId); }, [fetchProducts, activeCatId]);

  // ─── Acciones Categorías ──────────────────────────────────────────────────
  const handleCreateCategory = async (data) => {
    await createCategory(data);
    await fetchCategories();
  };

  const handleUpdateCategory = async (id, data) => {
    await updateCategory(id, data);
    await fetchCategories();
  };

  const handleDeleteCategory = async (id) => {
    await deleteCategory(id);
    if (activeCatId === id) setActiveCatId(null);
    await fetchCategories();
    await fetchProducts(null);
  };

  // ─── Acciones Productos ───────────────────────────────────────────────────
  const handleCreateProduct = async (formData) => {
    await createProduct(formData);
    await fetchProducts(activeCatId);
  };

  const handleUpdateProduct = async (id, formData) => {
    await updateProduct(id, formData);
    await fetchProducts(activeCatId);
  };

  const handleDeleteProduct = async (id) => {
    await deleteProduct(id);
    await fetchProducts(activeCatId);
  };

  // ─── Acciones Stock ───────────────────────────────────────────────────────
  const handleAddLot = async (productId, data) => {
    await addStockLot(productId, data);
    await fetchProducts(activeCatId);
  };

  const handleDeleteLot = async (lotId) => {
    await deleteStockLot(lotId);
    await fetchProducts(activeCatId);
  };

  return {
    categories,
    products,
    activeCatId,
    setActiveCatId,
    loadingCats,
    loadingProds,
    error,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    handleAddLot,
    handleDeleteLot,
    getStockByProduct,
  };
}
