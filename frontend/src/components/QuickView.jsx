import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const QuickView = ({ product, onClose }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const convertToCFA = (usd) => {
    const rate = 600;
    return (usd * rate).toLocaleString();
  };

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      alert('Please select a size');
      return;
    }
    addToCart(product, quantity);
    onClose();
    navigate('/profile?tab=shop');
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white text-2xl hover:text-afro-orange z-10">&times;</button>
          
          <div className="grid md:grid-cols-2 gap-6 p-6">
            {/* Image */}
            <div>
              <img src={product.images?.[0]} alt={product.name} className="w-full rounded-xl" />
            </div>

            {/* Details */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{product.name}</h2>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-afro-gold">{convertToCFA(product.price)} CFA</span>
                {product.originalPrice && (
                  <span className="text-gray-500 line-through">{convertToCFA(product.originalPrice)} CFA</span>
                )}
              </div>

              <p className="text-gray-400 mb-6 text-sm">{product.description}</p>

              {/* Size Selection */}
              {product.sizes?.length > 0 && product.sizes[0] !== 'One Size' && (
                <div className="mb-6">
                  <label className="block text-afro-gold text-sm mb-2">Select Size</label>
                  <div className="flex gap-2">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 rounded-lg font-bold transition ${
                          selectedSize === size
                            ? 'bg-afro-orange text-black'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
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
                <label className="block text-afro-gold text-sm mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-gray-800 rounded-full text-white hover:bg-gray-700"
                  >
                    -
                  </button>
                  <span className="text-white text-xl w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.piecesLeft, quantity + 1))}
                    className="w-10 h-10 bg-gray-800 rounded-full text-white hover:bg-gray-700"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 border-2 border-afro-orange text-afro-orange py-3 rounded-lg font-bold hover:bg-afro-orange hover:text-black transition"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-afro-orange text-black py-3 rounded-lg font-bold hover:bg-afro-gold transition"
                >
                  Buy Now
                </button>
              </div>

              {/* Stock Info */}
              <div className="mt-4 text-center text-sm text-gray-500">
                {product.piecesLeft} pieces available
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickView;