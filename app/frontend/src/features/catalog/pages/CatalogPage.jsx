import { useCatalog } from '../hooks/use-catalog';
import { useCart } from '../../cart/hooks/use-cart';
import { useSileoNotification } from '../../../context/SileoNotificationContext';
import CategoryFilter from '../components/CategoryFilter';
import ProductGrid from '../components/ProductGrid';
import { Link } from 'react-router-dom';
import './CatalogPage.css';

export default function CatalogPage() {
  const {
    categories,
    products,
    activeCatId,
    setActiveCatId,
    loadingProds,
    error,
  } = useCatalog();

  const { addToCart, itemCount, total } = useCart();
  const { showSuccess } = useSileoNotification();

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    showSuccess(`¡${product.name} agregado al carrito!`, 'Producto Añadido 🛒');
  };

  return (
    <div className="catalog-page">
      <header className="catalog-page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="catalog-page__title">Nuestro Catálogo 📦</h1>
          <p className="catalog-page__subtitle">
            Encuentra tus productos favoritos al mejor precio
          </p>
        </div>

        <Link
          to="/checkout"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            backgroundColor: '#10b981',
            color: '#fff',
            borderRadius: '10px',
            fontWeight: '700',
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
          }}
        >
          🛒 Carrito ({itemCount}) — ${total.toFixed(2)}
        </Link>
      </header>

      {error && <p className="catalog-page__error">⚠️ {error}</p>}

      <CategoryFilter
        categories={categories}
        activeCatId={activeCatId}
        onChange={setActiveCatId}
      />

      <ProductGrid
        products={products}
        loading={loadingProds}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
