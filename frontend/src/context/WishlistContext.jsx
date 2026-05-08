import React, { createContext, useState, useContext, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('palmas_wishlist');
    if (saved) {
      setWishlist(JSON.parse(saved));
    }
  }, []);

  const addToWishlist = (product) => {
    if (!wishlist.find(item => item._id === product._id)) {
      const newWishlist = [...wishlist, product];
      setWishlist(newWishlist);
      localStorage.setItem('palmas_wishlist', JSON.stringify(newWishlist));
      return true;
    }
    return false;
  };

  const removeFromWishlist = (productId) => {
    const newWishlist = wishlist.filter(item => item._id !== productId);
    setWishlist(newWishlist);
    localStorage.setItem('palmas_wishlist', JSON.stringify(newWishlist));
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item._id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};