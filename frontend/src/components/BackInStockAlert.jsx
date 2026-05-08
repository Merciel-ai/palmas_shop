import React, { useState } from 'react';
import axios from 'axios';

const BackInStockAlert = ({ product, onClose }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In real app, save to backend
      await axios.post(`${import.meta.env.VITE_API_URL}/api/alerts/stock`, {
        email,
        productId: product._id,
        productName: product.name
      });
      setSubmitted(true);
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      alert('Error subscribing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="text-center">
          <div className="text-5xl mb-4">🔔</div>
          <h3 className="text-xl font-bold text-white mb-2">Get notified when back in stock</h3>
          <p className="text-gray-400 text-sm mb-6">{product.name}</p>
          
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white mb-4 focus:outline-none focus:border-afro-orange"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-afro-orange text-black py-3 rounded-lg font-bold hover:bg-afro-gold transition"
              >
                {loading ? 'Subscribing...' : 'Notify Me When Available'}
              </button>
            </form>
          ) : (
            <div className="text-green-500">
              <p>✓ You'll be notified when this item is back in stock!</p>
            </div>
          )}
          
          <button onClick={onClose} className="mt-4 text-gray-500 text-sm hover:text-white">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackInStockAlert;