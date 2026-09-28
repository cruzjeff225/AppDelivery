import { cartAmounts, sanitizeCart } from '../cart-math';
import { useState, useEffect, createContext, useContext, useMemo } from 'react';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'app_delivery_cart';

const normalizeQuantity = (value, fallback = 1) => {
  const quantity = Math.trunc(Number(value));
  return Number.isFinite(quantity) && quantity > 0 ? quantity : fallback;
};

const getAvailableStock = (product) => {
  const stock = Math.trunc(Number(product.total_stock));
  return Number.isFinite(stock) && stock >= 0
    ? stock
    : 0;
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      const parsedCart = saved ? JSON.parse(saved) : [];

      return sanitizeCart(parsedCart);
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cartItems)
      );
    } catch (error) {
      console.error('Error al guardar el carrito:', error);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    if (!product?.id) return;

    setCartItems((previousItems) => {
      const price = Number(product.price);
      const requestedQuantity = Math.min(normalizeQuantity(quantity), 10000);
      const availableStock = Math.min(getAvailableStock(product), 10000);

      const existingIndex = previousItems.findIndex(
        (item) => String(item.id) === String(product.id)
      );

      if (
        !Number.isFinite(price) ||
        price <= 0 ||
        product.is_available === false ||
        availableStock === 0
      ) {
        return previousItems;
      }

      if (existingIndex >= 0) {
        const updatedItems = [...previousItems];

        const currentQuantity = normalizeQuantity(
          updatedItems[existingIndex].quantity
        );

        const nextQuantity = Math.min(
          currentQuantity + requestedQuantity,
          availableStock
        );

        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          ...product,
          price,
          quantity: nextQuantity
        };

        return updatedItems;
      }

      return [
        ...previousItems,
        {
          ...product,
          price,
          quantity: Math.min(
            requestedQuantity,
            availableStock
          )
        }
      ];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((previousItems) =>
      previousItems.filter(
        (item) => String(item.id) !== String(productId)
      )
    );
  };

  const updateQuantity = (productId, quantity) => {
    const requestedQuantity = Math.trunc(Number(quantity));

    if (
      !Number.isFinite(requestedQuantity) ||
      requestedQuantity <= 0
    ) {
      removeFromCart(productId);
      return;
    }

    setCartItems((previousItems) =>
      previousItems.map((item) => {
        if (String(item.id) !== String(productId)) {
          return item;
        }

        const availableStock = Math.min(getAvailableStock(item), 10000);

        return {
          ...item,
          quantity: Math.min(
            requestedQuantity,
            availableStock
          )
        };
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const { itemCount, subtotal, tax, shippingFee, total } = useMemo(() => cartAmounts(cartItems), [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        tax,
        shippingFee,
        total
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart debe utilizarse dentro de CartProvider'
    );
  }

  return context;
}
