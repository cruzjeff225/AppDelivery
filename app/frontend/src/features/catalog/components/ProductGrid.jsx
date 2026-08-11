import ProductCard from './ProductCard';
import { Package } from 'lucide-react';
import './ProductGrid.css';

export default function ProductGrid({ products, loading, onAddToCart }) {
  if (loading) {
    return (
      <div className="product-grid__loading">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="product-grid__skeleton" />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="product-grid__empty">
        <Package size={48} color="#cbd5e1" />
        <p>No hay productos en esta categoría</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
