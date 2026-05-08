import React, { useState } from 'react';
import axios from 'axios';

const MobileMoneyPayment = ({ amount, orderId, onSuccess, onCancel }) => {
  const [paymentMethod, setPaymentMethod] = useState('orange');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const formatCFA = (amount) => {
    return (amount || 0).toLocaleString();
  };

  const initiatePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      alert('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setPaymentStatus('initializing');

    try {
      const endpoint = paymentMethod === 'orange' 
        ? '/api/payment/orange/initiate'
        : '/api/payment/mtn/initiate';

      const response = await axios.post(`${apiUrl}${endpoint}`, {
        amount,
        phoneNumber,
        orderId
      });

      if (response.data.success) {
        setTransactionId(response.data.transactionId);
        setPaymentStatus('pending');
        
        // Start polling for payment status
        startPollingStatus(response.data.transactionId);
        
        // Show instructions
        alert(`Payment initiated!\n\n${response.data.message}\n\n${response.data.instructions}`);
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

  const startPollingStatus = (transactionId) => {
    setCheckingStatus(true);
    
    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/payment/status/${transactionId}`);
        
        if (response.data.status === 'completed') {
          clearInterval(pollInterval);
          setPaymentStatus('completed');
          setCheckingStatus(false);
          onSuccess(transactionId);
        } else if (response.data.status === 'failed') {
          clearInterval(pollInterval);
          setPaymentStatus('failed');
          setCheckingStatus(false);
        }
      } catch (error) {
        console.error('Status check error:', error);
      }
    }, 3000); // Check every 3 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (paymentStatus === 'pending') {
        setPaymentStatus('timeout');
        setCheckingStatus(false);
      }
    }, 300000);
  };

  const simulatePayment = async () => {
    if (!transactionId) return;
    
    try {
      await axios.post(`${apiUrl}/api/payment/simulate/${transactionId}`);
      setPaymentStatus('completed');
      onSuccess(transactionId);
    } catch (error) {
      console.error('Simulation error:', error);
    }
  };

  return (
    <div className="bg-[#1A1A1A] rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Mobile Money Payment</h3>
      <p className="text-[#FF5C00] text-2xl font-bold mb-6">{formatCFA(amount)} CFA</p>

      {paymentStatus === null ? (
        <>
          {/* Payment Method Selection */}
          <div className="mb-6">
            <label className="block text-gray-400 mb-3">Select Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('orange')}
                className={`p-4 rounded-xl border-2 transition ${
                  paymentMethod === 'orange'
                    ? 'border-[#FF5C00] bg-[#FF5C00]/10'
                    : 'border-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="text-2xl mb-1">📱</div>
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
                <div className="text-2xl mb-1">📱</div>
                <p className="font-bold text-white">MTN Mobile Money</p>
                <p className="text-xs text-gray-500">Pay with MTN Mobile Money</p>
              </button>
            </div>
          </div>

          {/* Phone Number Input */}
          <div className="mb-6">
            <label className="block text-gray-400 mb-2">Phone Number</label>
            <input
              type="tel"
              placeholder="6XXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-[#0B0B0B] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF5C00]"
            />
            <p className="text-xs text-gray-500 mt-1">Enter the phone number linked to your {paymentMethod === 'orange' ? 'Orange Money' : 'MTN Mobile Money'} account</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={initiatePayment}
              disabled={loading}
              className="flex-1 bg-[#FF5C00] text-black py-3 rounded-lg font-bold hover:bg-[#FF5C00]/90 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Pay ${formatCFA(amount)} CFA`}
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>

          <div className="mt-4 p-3 bg-[#0B0B0B] rounded-lg">
            <p className="text-xs text-gray-500 text-center">
              🔒 Secure payment via {paymentMethod === 'orange' ? 'Orange Money' : 'MTN Mobile Money'}<br />
              You'll receive a payment request on your phone. Enter your PIN to complete.
            </p>
          </div>
        </>
      ) : paymentStatus === 'pending' && (
        <div className="text-center py-8">
          <div className="animate-spin text-5xl mb-4">⏳</div>
          <h4 className="text-white font-bold mb-2">Payment Pending</h4>
          <p className="text-gray-400 text-sm mb-4">
            Please check your phone and enter your PIN to complete the payment.
          </p>
          <p className="text-xs text-gray-500">Transaction ID: {transactionId}</p>
          {checkingStatus && (
            <p className="text-xs text-[#FF5C00] mt-2">Waiting for confirmation...</p>
          )}
          
          {/* Simulate payment button (for testing only) */}
          {import.meta.env.DEV && (
            <button
              onClick={simulatePayment}
              className="mt-4 text-xs text-gray-500 hover:text-[#FF5C00] transition"
            >
              Simulate Payment (Test)
            </button>
          )}
        </div>
      )}

      {paymentStatus === 'completed' && (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">✅</div>
          <h4 className="text-white font-bold mb-2">Payment Successful!</h4>
          <p className="text-gray-400 text-sm">Your payment has been confirmed.</p>
          <p className="text-xs text-gray-500 mt-2">Transaction ID: {transactionId}</p>
        </div>
      )}

      {paymentStatus === 'failed' && (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">❌</div>
          <h4 className="text-white font-bold mb-2">Payment Failed</h4>
          <p className="text-gray-400 text-sm">Please try again or contact support.</p>
          <button
            onClick={() => setPaymentStatus(null)}
            className="mt-4 bg-[#FF5C00] text-black px-6 py-2 rounded-lg font-bold"
          >
            Try Again
          </button>
        </div>
      )}

      {paymentStatus === 'timeout' && (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">⏰</div>
          <h4 className="text-white font-bold mb-2">Payment Timeout</h4>
          <p className="text-gray-400 text-sm">The payment request has expired.</p>
          <button
            onClick={() => setPaymentStatus(null)}
            className="mt-4 bg-[#FF5C00] text-black px-6 py-2 rounded-lg font-bold"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default MobileMoneyPayment;