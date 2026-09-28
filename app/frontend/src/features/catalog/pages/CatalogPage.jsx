import { useCatalog } from '../hooks/use-catalog';
import { useCart } from '../../cart/hooks/use-cart';
import { useAuth } from '../../auth/hooks/use-auth';
import { useSileoNotification } from '../../../context/SileoNotificationContext';
import CategoryFilter from '../components/CategoryFilter';
import ProductGrid from '../components/ProductGrid';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import './CatalogPage.css';

export default function CatalogPage() {
  const { categories, products, activeCatId, setActiveCatId, loadingProds, error } =
    useCatalog();

  const { cartItems, addToCart, itemCount, total } = useCart();
  const { showSuccess, showError } = useSileoNotification();
  // Solo el cliente compra; el personal usa el catálogo como consulta.
  const isCustomer = useAuth().role === 'customer';

  const handleAddToCart = (product) => {
    const stock = Math.max(Math.trunc(Number(product.total_stock) || 0), 0);
    const itemInCart = cartItems.find(
      (item) => String(item.id) === String(product.id)
    );
    const currentQuantity = Number(itemInCart?.quantity) || 0;

    if (currentQuantity >= stock) {
      showError(
        `Solo hay ${stock} unidades disponibles de ${product.name}.`,
        'Stock máximo alcanzado'
      );
      return;
    }

    addToCart(product, 1);
    showSuccess(`¡${product.name} agregado al carrito!`, 'Producto añadido');
  };

  return (
    <div className="catalog-page">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '4px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 className="catalog-page__title">Nuestro Catálogo</h1>
          <p className="catalog-page__subtitle">
            Encuentra tus productos favoritos al mejor precio
          </p>
        </div>

        {isCustomer && (
          <Link
            to="/checkout"
            className="btn btn--primary"
            style={{
              gap: '8px',
            }}
          >
            <ShoppingCart size={16} />
            Carrito ({itemCount}) — ${total.toFixed(2)}
          </Link>
        )}
      </div>

      {error && <p className="catalog-page__error">{error}</p>}

      <CategoryFilter
        categories={categories}
        activeCatId={activeCatId}
        onChange={setActiveCatId}
      />

      <ProductGrid
        products={products}
        loading={loadingProds}
        onAddToCart={isCustomer ? handleAddToCart : undefined}
      />
    </div>
  );
}
