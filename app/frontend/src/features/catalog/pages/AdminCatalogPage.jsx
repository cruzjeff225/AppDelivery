import { useState }         from 'react';
import { useCatalog }       from '../hooks/use-catalog';
import CategoryFilter       from '../components/CategoryFilter';
import ProductGrid          from '../components/ProductGrid';
import CategoryModal        from '../components/CategoryModal';
import ProductModal         from '../components/ProductModal';
import StockModal           from '../components/StockModal';
import ConfirmModal         from '../components/ConfirmModal';
import './AdminCatalogPage.css';

export default function AdminCatalogPage() {
  const {
    categories, products,
    activeCatId, setActiveCatId,
    loadingCats, loadingProds, error,
    handleCreateCategory, handleUpdateCategory, handleDeleteCategory,
    handleCreateProduct,  handleUpdateProduct,  handleDeleteProduct,
    handleAddLot,
  } = useCatalog();

  const [catModal,   setCatModal]   = useState(null); // null | 'new' | {category}
  const [prodModal,  setProdModal]  = useState(null); // null | 'new' | {product}
  const [stockModal, setStockModal] = useState(null); // null | {product}
  const [deleteConfirm, setDeleteConfirm] = useState(null); // null | { label, onConfirm }
  const [tab,        setTab]        = useState('products'); // 'products' | 'categories'

  const confirmDelete = (label, onConfirm) => {
    setDeleteConfirm({ label, onConfirm });
  };

  return (
    <div className="admin-page">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Administración del Catálogo</h1>
          <p className="admin-page__subtitle">Gestiona categorías, productos y stock</p>
        </div>
        <div className="admin-page__header-actions">
          {tab === 'categories' && (
            <button className="admin-btn admin-btn--primary" onClick={() => setCatModal('new')}>
              + Nueva categoría
            </button>
          )}
          {tab === 'products' && (
            <button className="admin-btn admin-btn--primary" onClick={() => setProdModal('new')}>
              + Nuevo producto
            </button>
          )}
        </div>
      </header>

      {error && <p className="admin-page__error">⚠️ {error}</p>}

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <nav className="admin-page__tabs">
        <button
          className={`admin-page__tab${tab === 'products' ? ' admin-page__tab--active' : ''}`}
          onClick={() => setTab('products')}
        >
          🛍️ Productos
        </button>
        <button
          className={`admin-page__tab${tab === 'categories' ? ' admin-page__tab--active' : ''}`}
          onClick={() => setTab('categories')}
        >
          🏷️ Categorías
        </button>
      </nav>

      {/* ── Vista Productos ─────────────────────────────────────────────── */}
      {tab === 'products' && (
        <>
          <CategoryFilter
            categories={categories}
            activeCatId={activeCatId}
            onChange={setActiveCatId}
          />
          {loadingProds ? (
            <p className="admin-page__loading">Cargando productos…</p>
          ) : products.length === 0 ? (
            <p className="admin-page__empty">No hay productos. ¡Crea el primero!</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock total</th>
                    <th>Disponible</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        {p.image_path
                          ? <img src={`http://localhost:4000/uploads/${p.image_path}`} alt={p.name} className="admin-table__thumb" />
                          : <span className="admin-table__no-img">📦</span>}
                      </td>
                      <td className="admin-table__name">{p.name}</td>
                      <td>{p.category_name}</td>
                      <td>${Number(p.price).toFixed(2)}</td>
                      <td>
                        <span className={`admin-table__stock ${Number(p.total_stock) === 0 ? 'admin-table__stock--zero' : ''}`}>
                          {p.total_stock}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-table__badge ${p.is_available ? 'admin-table__badge--yes' : 'admin-table__badge--no'}`}>
                          {p.is_available ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td className="admin-table__actions">
                        <button className="admin-btn admin-btn--sm admin-btn--stock" onClick={() => setStockModal(p)}>
                          📦 Stock
                        </button>
                        <button className="admin-btn admin-btn--sm admin-btn--edit" onClick={() => setProdModal(p)}>
                          ✏️ Editar
                        </button>
                        <button className="admin-btn admin-btn--sm admin-btn--delete" onClick={() => confirmDelete(p.name, () => handleDeleteProduct(p.id))}>
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Vista Categorías ────────────────────────────────────────────── */}
      {tab === 'categories' && (
        loadingCats ? (
          <p className="admin-page__loading">Cargando categorías…</p>
        ) : categories.length === 0 ? (
          <p className="admin-page__empty">No hay categorías. ¡Crea la primera!</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
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
                    <td className="admin-table__name">{c.name}</td>
                    <td className="admin-table__desc">{c.description ?? '—'}</td>
                    <td className="admin-table__actions">
                      <button className="admin-btn admin-btn--sm admin-btn--edit" onClick={() => setCatModal(c)}>
                        ✏️ Editar
                      </button>
                      <button className="admin-btn admin-btn--sm admin-btn--delete" onClick={() => confirmDelete(c.name, () => handleDeleteCategory(c.id))}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ── Modales ─────────────────────────────────────────────────────── */}
      {catModal !== null && (
        <CategoryModal
          category={catModal === 'new' ? null : catModal}
          onSave={catModal === 'new'
            ? handleCreateCategory
            : (data) => handleUpdateCategory(catModal.id, data)}
          onClose={() => setCatModal(null)}
        />
      )}

      {prodModal !== null && (
        <ProductModal
          product={prodModal === 'new' ? null : prodModal}
          categories={categories}
          onSave={prodModal === 'new'
            ? handleCreateProduct
            : (fd) => handleUpdateProduct(prodModal.id, fd)}
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

      {deleteConfirm !== null && (
        <ConfirmModal
          title="¿Eliminar elemento?"
          message={`¿Eliminar "${deleteConfirm.label}"? Esta acción no se puede deshacer.`}
          onConfirm={deleteConfirm.onConfirm}
          onClose={() => setDeleteConfirm(null)}
          confirmText="Eliminar"
          cancelText="Cancelar"
        />
      )}
    </div>
  );
}
