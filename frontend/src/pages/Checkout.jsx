import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('orange');
  const [loading, setLoading] = useState(false);

  const handleSubmitOrder = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    // Create order
    const orderData = {
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      customerAddress: formData.address,
      products: cart.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      totalAmount: getTotalPrice(),
      paymentMethod: paymentMethod === 'orange' ? 'Orange Money' : 'MTN Mobile Money'
    };

    try {
      // Save order to backend
      await axios.post(`${import.meta.env.VITE_API_URL}/api/orders`, orderData);
      
      // Here you would integrate with actual payment API
      alert(`Order placed successfully! Total: $${getTotalPrice()}\nPayment method: ${paymentMethod === 'orange' ? 'Orange Money' : 'MTN Mobile Money'}\nWe'll contact you on ${formData.phone} for payment.`);
      
      clearCart();
      navigate('/');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-32 pb-20">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Cart Summary */}
        <div>
          <h2 className="text-2xl font-playfair text-white mb-6">Order Summary</h2>
          {cart.map(item => (
            <div key={item._id} className="border-b border-gray-800 py-4 flex justify-between text-white">
              <div>
                <p className="font-bold">{item.name}</p>
                <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                {item.price < item.originalPrice && (
                  <p className="text-xs text-green-500">Negotiated price</p>
                )}
              </div>
              <p className="text-palmas-brown">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <div className="pt-4 text-right">
            <p className="text-white text-xl">Total: <span className="text-palmas-brown">${getTotalPrice().toFixed(2)}</span></p>
          </div>
        </div>
        
        {/* Checkout Form */}
        <div>
          <h2 className="text-2xl font-playfair text-white mb-6">Checkout Information</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full Name *"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-gray-900 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-palmas-brown"
              required
            />
            <input
              type="email"
              placeholder="Email *"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-gray-900 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-palmas-brown"
              required
            />
            <input
              type="tel"
              placeholder="Phone Number (for payment) *"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-gray-900 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-palmas-brown"
              required
            />
            <input
              type="text"
              placeholder="Shipping Address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full bg-gray-900 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-palmas-brown"
            />
            
            <div className="bg-gray-900 p-4 rounded">
              <p className="text-white mb-3">Payment Method</p>
              <div className="space-y-2">
                <label className="flex items-center text-white cursor-pointer">
                  <input
                    type="radio"
                    value="orange"
                    checked={paymentMethod === 'orange'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span>Orange Money</span>
                </label>
                <label className="flex items-center text-white cursor-pointer">
                  <input
                    type="radio"
                    value="mtn"
                    checked={paymentMethod === 'mtn'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span>MTN Mobile Money</span>
                </label>
              </div>
            </div>
            
            <button
              onClick={handleSubmitOrder}
              disabled={loading}
              className="w-full bg-palmas-brown text-white py-4 rounded text-lg font-bold hover:bg-palmas-brown/80 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Place Order - $${getTotalPrice().toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;