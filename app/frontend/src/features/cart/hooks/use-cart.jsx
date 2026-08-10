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
    : Number.POSITIVE_INFINITY;
};

const roundMoney = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      const parsedCart = saved ? JSON.parse(saved) : [];

      return Array.isArray(parsedCart) ? parsedCart : [];
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
      const requestedQuantity = normalizeQuantity(quantity);
      const availableStock = getAvailableStock(product);

      const existingIndex = previousItems.findIndex(
        (item) => String(item.id) === String(product.id)
      );

      if (
        !Number.isFinite(price) ||
        price < 0 ||
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

        const availableStock = getAvailableStock(item);

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

  const { itemCount, subtotal } = useMemo(() => {
    const summary = cartItems.reduce(
      (result, item) => {
        const price = Number(item.price);
        const quantity = Number(item.quantity);

        if (
          !Number.isFinite(price) ||
          !Number.isFinite(quantity)
        ) {
          return result;
        }

        result.itemCount += quantity;
        result.subtotal += price * quantity;

        return result;
      },
      {
        itemCount: 0,
        subtotal: 0
      }
    );

    return {
      itemCount: summary.itemCount,
      subtotal: roundMoney(summary.subtotal)
    };
  }, [cartItems]);

  const shippingFee = cartItems.length > 0 ? 2.5 : 0;

  const total =
    subtotal > 0
      ? roundMoney(subtotal + shippingFee)
      : 0;

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
