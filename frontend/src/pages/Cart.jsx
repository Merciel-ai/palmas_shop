import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkoutStep, setCheckoutStep] = useState('cart');
  const [paymentMethod, setPaymentMethod] = useState('orange');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const formatCFA = (amount) => {
    return (amount || 0).toLocaleString();
  };

  const handleProceedToPayment = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setCheckoutStep('payment');
  };

  // Initialize Mobile Money Payment
  const initiatePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      alert('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setPaymentStatus('initializing');

    // Create order first
    const orderData = {
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: phoneNumber,
      products: cart.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.priceCFA,
        quantity: item.quantity
      })),
      totalAmount: getTotalPrice(),
      paymentMethod: paymentMethod === 'orange' ? 'Orange Money' : 'MTN Mobile Money',
      status: 'pending',
      paymentStatus: 'pending'
    };

    try {
      // Create order
      const orderResponse = await axios.post(`${apiUrl}/api/orders`, orderData);
      const newOrder = orderResponse.data;
      setOrderPlaced(newOrder);

      // Initiate payment
      const endpoint = paymentMethod === 'orange' 
        ? '/api/payment/orange/initiate'
        : '/api/payment/mtn/initiate';

      const paymentResponse = await axios.post(`${apiUrl}${endpoint}`, {
        amount: getTotalPrice(),
        phoneNumber: phoneNumber,
        orderId: newOrder.orderId
      });

      if (paymentResponse.data.success) {
        setTransactionId(paymentResponse.data.transactionId);
        setPaymentStatus('pending');
        
        // Start polling for payment status
        startPollingStatus(paymentResponse.data.transactionId, newOrder.orderId);
        
        // Show instructions
        alert(`Payment initiated!\n\n${paymentResponse.data.message}\n\n${paymentResponse.data.instructions}`);
      } else {
        setPaymentStatus('failed');
        alert('Payment initiation failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      alert('Payment failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Poll for payment status
  const startPollingStatus = (transactionId, orderId) => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/payment/status/${transactionId}`);
        
        if (response.data.status === 'completed') {
          clearInterval(interval);
          setPaymentStatus('completed');
          setPollingInterval(null);
          
          // Update order status
          await axios.put(`${apiUrl}/api/orders/payment/${orderId}`, { 
            paymentStatus: 'paid',
            transactionId: transactionId
          });
          
          // Clear cart and show success
          clearCart();
          setCheckoutStep('confirmation');
          
          alert(`✅ Payment Successful!\n\nTransaction ID: ${transactionId}\nAmount: ${formatCFA(getTotalPrice())} CFA\n\nYou will receive a confirmation SMS shortly.`);
          
        } else if (response.data.status === 'failed') {
          clearInterval(interval);
          setPaymentStatus('failed');
          setPollingInterval(null);
          alert('Payment failed. Please try again.');
        }
      } catch (error) {
        console.error('Status check error:', error);
      }
    }, 3000);

    setPollingInterval(interval);

    // Stop polling after 5 minutes
    setTimeout(() => {
      if (interval) {
        clearInterval(interval);
        if (paymentStatus === 'pending') {
          setPaymentStatus('timeout');
          alert('Payment timeout. Please try again.');
        }
      }
    }, 300000);
  };

  // Simulate payment for testing (only in development)
  const simulatePayment = async () => {
    if (!transactionId) return;
    try {
      await axios.post(`${apiUrl}/api/payment/simulate/${transactionId}`);
      setPaymentStatus('completed');
      clearCart();
      setCheckoutStep('confirmation');
    } catch (error) {
      console.error('Simulation error:', error);
    }
  };

  if (cart.length === 0 && checkoutStep === 'cart') {
    return (
      <div className="min-h-screen bg-[#0B0B0B] pt-32">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-6">Looks like you haven't added anything yet</p>
          <Link to="/profile" className="bg-[#FF5C00] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#FF5C00]/90 transition">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Checkout Steps */}
        <div className="flex items-center justify-center mb-8 gap-4">
          <div className={`flex items-center gap-2 ${checkoutStep === 'cart' ? 'text-[#FF5C00]' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep === 'cart' ? 'bg-[#FF5C00] text-black' : 'bg-gray-700 text-white'}`}>1</div>
            <span>Cart</span>
          </div>
          <div className="w-12 h-px bg-gray-700"></div>
          <div className={`flex items-center gap-2 ${checkoutStep === 'payment' ? 'text-[#FF5C00]' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep === 'payment' ? 'bg-[#FF5C00] text-black' : 'bg-gray-700 text-white'}`}>2</div>
            <span>Payment</span>
          </div>
          <div className="w-12 h-px bg-gray-700"></div>
          <div className={`flex items-center gap-2 ${checkoutStep === 'confirmation' ? 'text-[#FF5C00]' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep === 'confirmation' ? 'bg-[#FF5C00] text-black' : 'bg-gray-700 text-white'}`}>3</div>
            <span>Confirmation</span>
          </div>
        </div>

        {/* Cart Content */}
        {checkoutStep === 'cart' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <h1 className="text-2xl font-bold text-white mb-4">Shopping Cart ({cart.length})</h1>
              {cart.map((item) => (
                <div key={item._id} className="bg-[#1A1A1A] rounded-xl p-4 flex gap-4">
                  <img src={item.images?.[0]} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{item.name}</h3>
                    <p className="text-[#FF5C00] font-bold text-lg">{formatCFA(item.priceCFA)} CFA</p>
                    {item.originalPriceCFA && item.originalPriceCFA > item.priceCFA && (
                      <p className="text-xs text-gray-500 line-through">{formatCFA(item.originalPriceCFA)} CFA</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <label className="text-gray-400 text-sm">Quantity:</label>
                      <select 
                        value={item.quantity} 
                        onChange={(e) => updateQuantity(item._id, parseInt(e.target.value))}
                        className="bg-[#0B0B0B] border border-gray-700 rounded-lg px-3 py-1 text-white"
                      >
                        {[1,2,3,4,5].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                      <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-400 text-sm">
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-lg">{formatCFA(item.priceCFA * item.quantity)} CFA</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-[#1A1A1A] rounded-xl p-6 sticky top-32">
                <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>{formatCFA(getTotalPrice())} CFA</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t border-gray-800 pt-3">
                    <div className="flex justify-between text-white font-bold text-lg">
                      <span>Total</span>
                      <span className="text-[#FF5C00]">{formatCFA(getTotalPrice())} CFA</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleProceedToPayment}
                  className="w-full bg-[#FF5C00] text-black py-3 rounded-lg font-bold hover:bg-[#FF5C00]/90 transition"
                >
                  Proceed to Payment
                </button>
                <Link to="/profile" className="block text-center text-sm text-gray-500 mt-4 hover:text-white transition">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Payment Step with Real Mobile Money Integration */}
        {checkoutStep === 'payment' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#1A1A1A] rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Mobile Money Payment</h2>
              
              <div className="mb-6">
                <p className="text-gray-400 mb-3">Total Amount: <span className="text-[#FF5C00] font-bold text-2xl">{formatCFA(getTotalPrice())} CFA</span></p>
              </div>

              {paymentStatus === null ? (
                <div className="space-y-4">
                  {/* Payment Method Selection */}
                  <div>
                    <label className="block text-gray-400 mb-2">Select Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setPaymentMethod('orange')}
                        className={`p-4 rounded-xl border-2 transition ${
                          paymentMethod === 'orange' 
                            ? 'border-[#FF5C00] bg-[#FF5C00]/10' 
                            : 'border-gray-700 hover:border-gray-500'
                        }`}
                      >
                        <div className="text-3xl mb-2">📱</div>
                        <p className="font-bold text-white">Orange Money</p>
                        <p className="text-xs text-gray-500">Pay with Orange Money</p>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('mtn')}
                        className={`p-4 rounded-xl border-2 transition ${
                          paymentMethod === 'mtn' 
                            ? 'border-[#FF5C00] bg-[#FF5C00]/10' 
                            : 'border-gray-700 hover:border-gray-500'
                        }`}
                      >
                        <div className="text-3xl mb-2">📱</div>
                        <p className="font-bold text-white">MTN Mobile Money</p>
                        <p className="text-xs text-gray-500">Pay with MTN Mobile Money</p>
                      </button>
                    </div>
                  </div>

                  {/* Phone Number Input */}
                  <div>
                    <label className="block text-gray-400 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="6XXXXXXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-[#0B0B0B] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF5C00] text-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter the phone number linked to your {paymentMethod === 'orange' ? 'Orange Money' : 'MTN Mobile Money'} account</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setCheckoutStep('cart')}
                      className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition"
                    >
                      Back to Cart
                    </button>
                    <button
                      onClick={initiatePayment}
                      disabled={loading}
                      className="flex-1 bg-[#FF5C00] text-black py-3 rounded-lg font-bold hover:bg-[#FF5C00]/90 transition disabled:opacity-50 text-lg"
                    >
                      {loading ? 'Processing...' : `Pay ${formatCFA(getTotalPrice())} CFA`}
                    </button>
                  </div>

                  <div className="bg-[#0B0B0B] rounded-lg p-4 mt-4">
                    <p className="text-xs text-gray-500 text-center">
                      🔒 Secure payment via {paymentMethod === 'orange' ? 'Orange Money' : 'MTN Mobile Money'}<br />
                      You'll receive a payment request on your phone. Enter your PIN to complete the transaction.<br />
                      Funds will be transferred directly to our merchant account.
                    </p>
                  </div>

                  {/* Test Mode Indicator */}
                  {import.meta.env.DEV && (
                    <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-3 mt-4">
                      <p className="text-xs text-yellow-500 text-center">
                        ⚡ TEST MODE: Use test phone numbers: 0612345678, 0623456789<br />
                        Test PIN: 1234
                      </p>
                    </div>
                  )}
                </div>
              ) : paymentStatus === 'pending' && (
                <div className="text-center py-8">
                  <div className="animate-spin text-6xl mb-4">⏳</div>
                  <h4 className="text-white font-bold text-xl mb-2">Payment Pending</h4>
                  <p className="text-gray-400 mb-4">
                    Please check your phone and enter your PIN to complete the payment.
                  </p>
                  <div className="bg-[#0B0B0B] rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-400">Transaction ID: <span className="text-[#FF5C00] font-mono">{transactionId}</span></p>
                    <p className="text-xs text-gray-500 mt-2">Waiting for confirmation from {paymentMethod === 'orange' ? 'Orange Money' : 'MTN Mobile Money'}...</p>
                  </div>
                  
                  {import.meta.env.DEV && (
                    <button
                      onClick={simulatePayment}
                      className="mt-4 text-xs text-gray-500 hover:text-[#FF5C00] transition"
                    >
                      Simulate Payment (Test Only)
                    </button>
                  )}
                </div>
              )}

              {paymentStatus === 'failed' && (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">❌</div>
                  <h4 className="text-white font-bold text-xl mb-2">Payment Failed</h4>
                  <p className="text-gray-400 mb-4">Please try again or contact support.</p>
                  <button
                    onClick={() => {
                      setPaymentStatus(null);
                      setTransactionId(null);
                    }}
                    className="bg-[#FF5C00] text-black px-6 py-2 rounded-lg font-bold"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {paymentStatus === 'timeout' && (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">⏰</div>
                  <h4 className="text-white font-bold text-xl mb-2">Payment Timeout</h4>
                  <p className="text-gray-400 mb-4">The payment request has expired.</p>
                  <button
                    onClick={() => {
                      setPaymentStatus(null);
                      setTransactionId(null);
                    }}
                    className="bg-[#FF5C00] text-black px-6 py-2 rounded-lg font-bold"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Confirmation Step */}
        {checkoutStep === 'confirmation' && orderPlaced && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-[#1A1A1A] rounded-xl p-8">
              <div className="text-7xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
              <p className="text-gray-400 mb-6">Thank you for your purchase</p>
              
              <div className="bg-[#0B0B0B] rounded-lg p-5 mb-6 text-left">
                <p className="text-sm text-gray-400 mb-2">Order ID: <span className="text-[#FF5C00] font-bold">{orderPlaced.orderId}</span></p>
                <p className="text-sm text-gray-400 mb-2">Amount: <span className="text-[#FF5C00] font-bold">{formatCFA(orderPlaced.totalAmount)} CFA</span></p>
                <p className="text-sm text-gray-400 mb-2">Payment Method: {orderPlaced.paymentMethod}</p>
                <p className="text-sm text-gray-400">Status: <span className="text-green-500">✓ PAID</span></p>
                <p className="text-xs text-gray-500 mt-3">You will receive a confirmation SMS shortly.</p>
              </div>

              <div className="flex gap-3">
                <Link to="/profile?tab=orders" className="flex-1 bg-[#FF5C00] text-black py-3 rounded-lg font-bold hover:bg-[#FF5C00]/90 transition">
                  View My Orders
                </Link>
                <Link to="/profile" className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;