import { useState } from 'react';
import { useCatalog } from '../hooks/use-catalog';
import CategoryFilter from '../components/CategoryFilter';
import CategoryModal from '../components/CategoryModal';
import ProductModal from '../components/ProductModal';
import StockModal from '../components/StockModal';
import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal';
import { Package, Tag, Plus, Pencil, Trash2, Boxes } from 'lucide-react';
import './AdminCatalogPage.css';

export default function AdminCatalogPage() {
  const {
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
  } = useCatalog();

  const [catModal, setCatModal] = useState(null);
  const [prodModal, setProdModal] = useState(null);
  const [stockModal, setStockModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [tab, setTab] = useState('products');

  const confirmDelete = (label, onConfirm) => {
    setDeleteConfirm({ label, onConfirm });
  };

  const handleConfirmDeleteAction = async () => {
    if (!deleteConfirm) return;
    await deleteConfirm.onConfirm();
    setDeleteConfirm(null);
  };

  return (
    <div className="admin-page">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <h2 className="page-header__title">Administración del Catálogo</h2>
          <p className="page-header__subtitle">
            Gestiona categorías, productos y stock de inventario
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {tab === 'categories' && (
            <button onClick={() => setCatModal('new')} className="btn btn--primary" style={{ gap: '6px' }}>
              <Plus size={16} /> Nueva Categoría
            </button>
          )}
          {tab === 'products' && (
            <button onClick={() => setProdModal('new')} className="btn btn--primary" style={{ gap: '6px' }}>
              <Plus size={16} /> Nuevo Producto
            </button>
          )}
        </div>
      </div>

      {error && (
        <p style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '10px', padding: '12px 16px', fontSize: '0.875rem' }}>
          {error}
        </p>
      )}

      <nav className="tabs">
        <button
          className={`tabs__btn ${tab === 'products' ? 'tabs__btn--active' : ''}`}
          onClick={() => setTab('products')}
        >
          <Package size={14} style={{ marginRight: '6px' }} /> Productos
        </button>
        <button
          className={`tabs__btn ${tab === 'categories' ? 'tabs__btn--active' : ''}`}
          onClick={() => setTab('categories')}
        >
          <Tag size={14} style={{ marginRight: '6px' }} /> Categorías
        </button>
      </nav>

      {tab === 'products' && (
        <>
          <CategoryFilter
            categories={categories}
            activeCatId={activeCatId}
            onChange={setActiveCatId}
          />
          {loadingProds ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              Cargando productos...
            </p>
          ) : products.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              No hay productos. ¡Crea el primero!
            </p>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock Total</th>
                    <th>Disponible</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        {p.image_path ? (
                          <img
                            src={`http://localhost:4000/uploads/${p.image_path}`}
                            alt={p.name}
                            className="admin-table__thumb"
                          />
                        ) : (
                          <Package size={24} color="#cbd5e1" />
                        )}
                      </td>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{p.name}</td>
                      <td>{p.category_name}</td>
                      <td>${Number(p.price).toFixed(2)}</td>
                      <td>
                        <span
                          style={{
                            fontWeight: 600,
                            color: Number(p.total_stock) === 0 ? '#dc2626' : '#059669',
                          }}
                        >
                          {p.total_stock}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            p.is_available ? 'badge--success' : 'badge--danger'
                          }`}
                        >
                          {p.is_available ? 'Disponible' : 'No disponible'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn btn--secondary btn--sm"
                            style={{ gap: '4px' }}
                            onClick={() => setStockModal(p)}
                          >
                            <Boxes size={12} /> Stock
                          </button>
                          <button
                            className="btn btn--secondary btn--sm"
                            style={{ gap: '4px' }}
                            onClick={() => setProdModal(p)}
                          >
                            <Pencil size={12} /> Editar
                          </button>
                          <button
                            className="btn btn--danger btn--sm"
                            onClick={() =>
                              confirmDelete(p.name, () => handleDeleteProduct(p.id))
                            }
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'categories' &&
        (loadingCats ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            Cargando categorías...
          </p>
        ) : categories.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            No hay categorías. ¡Crea la primera!
          </p>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{c.name}</td>
                    <td style={{ color: '#64748b' }}>{c.description ?? '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn--secondary btn--sm"
                          style={{ gap: '4px' }}
                          onClick={() => setCatModal(c)}
                        >
                          <Pencil size={12} /> Editar
                        </button>
                        <button
                          className="btn btn--danger btn--sm"
                          onClick={() =>
                            confirmDelete(c.name, () => handleDeleteCategory(c.id))
                          }
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {catModal !== null && (
        <CategoryModal
          category={catModal === 'new' ? null : catModal}
          onSave={
            catModal === 'new'
              ? handleCreateCategory
              : (data) => handleUpdateCategory(catModal.id, data)
          }
          onClose={() => setCatModal(null)}
        />
      )}

      {prodModal !== null && (
        <ProductModal
          product={prodModal === 'new' ? null : prodModal}
          categories={categories}
          onSave={
            prodModal === 'new'
              ? handleCreateProduct
              : (fd) => handleUpdateProduct(prodModal.id, fd)
          }
          onClose={() => setProdModal(null)}
        />
      )}

      {stockModal !== null && (
        <StockModal
          product={stockModal}
          onSave={handleAddLot}
          onClose={() => setStockModal(null)}
        />
      )}

      <ConfirmDeleteModal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleConfirmDeleteAction}
        itemName={deleteConfirm?.label}
      />
    </div>
  );
}
