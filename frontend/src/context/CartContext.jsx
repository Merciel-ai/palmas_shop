import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('palmas_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('palmas_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1, negotiatedPrice = null) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      const priceToUse = negotiatedPrice || product.priceCFA;
      
      if (existing) {
        const updated = prev.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity, priceCFA: priceToUse }
            : item
        );
        return updated;
      }
      return [...prev, { ...product, quantity, priceCFA: priceToUse, originalPriceCFA: product.originalPriceCFA }];
    });
    
    // Show success notification
    const event = new CustomEvent('showToast', { detail: { message: 'Added to cart!', type: 'success' } });
    window.dispatchEvent(event);
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item._id !== productId));
    window.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'Removed from cart', type: 'info' } }));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item =>
      item._id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('palmas_cart');
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.priceCFA * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      cartCount: getCartCount()
    }}>
      {children}
    </CartContext.Provider>
  );
};