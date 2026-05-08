import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showNotification, setShowNotification] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/products/${id}`);
      setProduct(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  };

  const formatCFA = (amount) => {
    return (amount || 0).toLocaleString();
  };

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && product.sizes[0] !== 'One Size' && !selectedSize) {
      showToast('Please select a size', 'error');
      return;
    }
    addToCart(product, quantity);
    showToast('Added to cart! 🔥', 'success');
  };

  const handleBuyNow = () => {
    if (product.sizes && product.sizes.length > 0 && product.sizes[0] !== 'One Size' && !selectedSize) {
      showToast('Please select a size', 'error');
      return;
    }
    addToCart(product, quantity);
    navigate('/cart');
  };

  const handleNegotiate = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    window.dispatchEvent(new CustomEvent('openNegotiation', { detail: { product } }));
  };

  const handleWishlist = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      showToast('Removed from wishlist', 'info');
    } else {
      addToWishlist(product);
      showToast('Added to wishlist ❤️', 'success');
    }
  };

  const showToast = (message, type = 'success') => {
    setShowNotification({ message, type });
    setTimeout(() => setShowNotification(null), 3000);
  };

  const nextImage = () => {
    if (product.images && currentImageIndex < product.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B] pt-20">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">✦</div>
          <p className="text-[#FF5C00]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B] pt-20">
        <div className="text-center">
          <p className="text-4xl mb-4">❌</p>
          <p className="text-gray-400">Product not found</p>
          <button onClick={() => navigate('/')} className="mt-4 bg-[#FF5C00] text-black px-6 py-2 rounded-lg">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-500">
          <button onClick={() => navigate('/')} className="hover:text-[#FF5C00] transition">Home</button>
          <span className="mx-2">/</span>
          <button onClick={() => navigate('/profile?tab=shop')} className="hover:text-[#FF5C00] transition">Shop</button>
          <span className="mx-2">/</span>
          <span className="text-[#FF5C00]">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="relative bg-[#1A1A1A] rounded-xl overflow-hidden">
              <img 
                src={product.images?.[currentImageIndex] || 'https://placehold.co/600x800/1A1A1A/FF5C00?text=No+Image'} 
                alt={product.name}
                className="w-full h-[500px] object-cover"
              />
              
              {/* Navigation Arrows */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    disabled={currentImageIndex === 0}
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center hover:bg-[#FF5C00] transition ${currentImageIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    ❮
                  </button>
                  <button
                    onClick={nextImage}
                    disabled={currentImageIndex === product.images.length - 1}
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center hover:bg-[#FF5C00] transition ${currentImageIndex === product.images.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    ❯
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                      currentImageIndex === idx ? 'border-[#FF5C00]' : 'border-transparent hover:border-[#FF5C00]/50'
                    }`}
                  >
                    <img src={img} alt={`${product.name} - ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{product.name}</h1>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-[#FF5C00]">{formatCFA(product.priceCFA)} CFA</span>
              {product.originalPriceCFA && product.originalPriceCFA > product.priceCFA && (
                <span className="text-lg text-gray-500 line-through">{formatCFA(product.originalPriceCFA)} CFA</span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              <p className={`text-sm ${product.piecesLeft <= 5 ? 'text-red-500' : 'text-green-500'}`}>
                {product.piecesLeft > 0 ? `${product.piecesLeft} pieces available` : 'Sold Out'}
              </p>
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && product.sizes[0] !== 'One Size' && (
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Select Size</label>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-14 h-14 rounded-xl font-bold transition ${
                        selectedSize === size
                          ? 'bg-[#FF5C00] text-black'
                          : 'bg-[#1A1A1A] text-gray-400 hover:bg-[#FF5C00]/20'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-gray-400 mb-2">Quantity</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full bg-[#1A1A1A] text-white hover:bg-[#FF5C00] transition"
                >
                  -
                </button>
                <span className="text-xl font-bold text-white w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.piecesLeft, quantity + 1))}
                  className="w-10 h-10 rounded-full bg-[#1A1A1A] text-white hover:bg-[#FF5C00] transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={product.piecesLeft === 0}
                className="w-full bg-[#FF5C00] text-black py-3 rounded-xl font-bold text-lg hover:bg-[#FF5C00]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ADD TO CART
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.piecesLeft === 0}
                className="w-full border-2 border-[#FF5C00] text-[#FF5C00] py-3 rounded-xl font-bold text-lg hover:bg-[#FF5C00] hover:text-black transition disabled:opacity-50"
              >
                BUY NOW
              </button>
              <div className="flex gap-3">
                <button
                  onClick={handleNegotiate}
                  disabled={product.piecesLeft === 0}
                  className="flex-1 border border-purple-500 text-purple-500 py-2 rounded-xl font-medium hover:bg-purple-500 hover:text-white transition"
                >
                  💬 NEGOTIATE
                </button>
                <button
                  onClick={handleWishlist}
                  className="flex-1 border border-gray-600 text-gray-400 py-2 rounded-xl font-medium hover:border-[#FF5C00] hover:text-[#FF5C00] transition"
                >
                  {isInWishlist(product._id) ? '❤️ IN WISHLIST' : '🤍 ADD TO WISHLIST'}
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-lg font-bold text-white mb-3">DESCRIPTION</h3>
              <p className="text-gray-400 leading-relaxed">{product.description || 'No description available.'}</p>
            </div>

            {/* Additional Info */}
            <div className="border-t border-gray-800 pt-6 mt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Category:</span>
                  <span className="text-white ml-2">{product.category}</span>
                </div>
                <div>
                  <span className="text-gray-500">Condition:</span>
                  <span className="text-white ml-2">New</span>
                </div>
                {product.isNegotiable && (
                  <div>
                    <span className="text-gray-500">Negotiable:</span>
                    <span className="text-green-500 ml-2">Yes</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 bg-[#1A1A1A] border-l-4 border-[#FF5C00] rounded-lg p-4 shadow-xl z-50 animate-slide-up">
          <p className="text-white">{showNotification.message}</p>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;