import { useCatalog }      from '../hooks/use-catalog';
import CategoryFilter       from '../components/CategoryFilter';
import ProductGrid          from '../components/ProductGrid';
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

  return (
    <div className="catalog-page">
      <header className="catalog-page__header">
        <h1 className="catalog-page__title">Nuestro Catálogo</h1>
        <p className="catalog-page__subtitle">
          Encuentra tus productos favoritos
        </p>
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
      />
    </div>
  );
}
