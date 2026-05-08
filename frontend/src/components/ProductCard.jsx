import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [showNotification, setShowNotification] = useState(null);

  const showToast = (message, type = 'success') => {
    setShowNotification({ message, type });
    setTimeout(() => setShowNotification(null), 2000);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      showToast('Removed from wishlist', 'info');
    } else {
      addToWishlist(product);
      showToast('Added to wishlist', 'success');
    }
  };

  const handleNegotiate = (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('openNegotiation', { detail: { product } }));
  };

  const formatCFA = (amount) => {
    return amount.toLocaleString();
  };

  return (
    <>
      <div className="group bg-[#1A1A1A] rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
        <Link to={`/product/${product._id}`}>
          <div className="relative overflow-hidden h-64">
            <img 
              src={product.images?.[0]} 
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute top-3 left-3 flex gap-2">
              {product.piecesLeft <= 10 && product.piecesLeft > 0 && (
                <span className="text-xs bg-[#00FF41] text-black px-2 py-1 rounded">LIMITED</span>
              )}
              {product.isNegotiable && (
                <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded">NEGOTIABLE</span>
              )}
            </div>
            
            <button
              onClick={handleWishlist}
              className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-[#00FF41] transition"
            >
              <svg className={`w-4 h-4 ${isInWishlist(product._id) ? 'text-red-500 fill-current' : 'text-white'}`} fill={isInWishlist(product._id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </Link>
        
        <div className="p-4">
          <Link to={`/product/${product._id}`}>
            <h3 className="font-semibold text-white mb-1 hover:text-[#00FF41] transition">{product.name}</h3>
          </Link>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-xl font-bold text-[#00FF41]">{formatCFA(product.priceCFA)} CFA</span>
            {product.originalPriceCFA && product.originalPriceCFA > product.priceCFA && (
              <span className="text-sm text-gray-500 line-through">{formatCFA(product.originalPriceCFA)} CFA</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-[#00FF41] text-black text-sm py-2 rounded-lg font-medium hover:bg-[#39FF14] transition"
            >
              ADD TO CART
            </button>
            {product.isNegotiable && (
              <button
                onClick={handleNegotiate}
                className="px-3 py-2 border border-[#00FF41] text-[#00FF41] text-sm rounded-lg hover:bg-[#00FF41] hover:text-black transition"
              >
                NEGOTIATE
              </button>
            )}
          </div>
        </div>
      </div>

      {showNotification && (
        <div className="fixed bottom-6 right-6 bg-[#1A1A1A] border-l-4 border-[#00FF41] rounded-lg p-3 shadow-xl z-50 animate-slide-up">
          <p className="text-sm text-white">{showNotification.message}</p>
        </div>
      )}
    </>
  );
};

export default ProductCard;