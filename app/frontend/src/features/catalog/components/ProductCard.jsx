import { UPLOADS_URL } from '../../../config/api';
import { Package } from 'lucide-react';
import './ProductCard.css';

export default function ProductCard({ product, onAddToCart }) {
  const imageUrl = product.image_path
    ? `${UPLOADS_URL}/${product.image_path}`
    : null;

  return (
    <article className="product-card">
      <div className="product-card__image-wrap">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} className="product-card__image" />
        ) : (
          <div className="product-card__no-image">
            <Package size={40} />
          </div>
        )}
        {!product.is_available && (
          <span className="product-card__badge product-card__badge--unavailable">
            No disponible
          </span>
        )}
      </div>

      <div className="product-card__body">
        <span className="product-card__category">{product.category_name}</span>
        <h3 className="product-card__name">{product.name}</h3>
        {product.description && (
          <p className="product-card__desc">{product.description}</p>
        )}
        <div className="product-card__footer">
          <span className="product-card__price">
            ${Number(product.price).toFixed(2)}
          </span>
          <span className="product-card__stock">
            Stock: {product.total_stock ?? 0}
          </span>
        </div>
        {onAddToCart && product.is_available && Number(product.total_stock) > 0 && (
          <button
            className="product-card__btn"
            onClick={() => onAddToCart(product)}
          >
            Agregar al carrito
          </button>
        )}
      </div>
    </article>
  );
}
