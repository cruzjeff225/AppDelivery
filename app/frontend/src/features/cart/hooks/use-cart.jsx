import { useState, useEffect, createContext, useContext } from 'react';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'app_delivery_cart';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error al cargar carrito de localStorage:', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Error al guardar carrito en localStorage:', e);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const cleanPrice = Number(product.price) || 0;
      const cleanQty = Number(quantity) || 1;
      const existingIndex = prevItems.findIndex((item) => item.id === product.id);

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          price: cleanPrice,
          quantity: (Number(updated[existingIndex].quantity) || 0) + cleanQty
        };
        return updated;
      }
      return [...prevItems, { ...product, price: cleanPrice, quantity: cleanQty }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    const newQty = Number(quantity) || 0;
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: newQty } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const itemCount = cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);

  const subtotal = cartItems.reduce((acc, item) => {
    const priceNum = Number(item.price) || 0;
    const qtyNum = Number(item.quantity) || 0;
    return acc + priceNum * qtyNum;
  }, 0);

  const shippingFee = cartItems.length > 0 ? 2.5 : 0;
  const total = subtotal > 0 ? subtotal + shippingFee : 0;

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
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
}
