import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const NegotiationModal = ({ product, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isWaitingForReply, setIsWaitingForReply] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Load or create orderId from localStorage
  useEffect(() => {
    const savedOrderId = localStorage.getItem(`negotiation_${product._id}`);
    if (savedOrderId) {
      setOrderId(savedOrderId);
    } else {
      const newOrderId = `NEG_${product._id}_${Date.now()}`;
      setOrderId(newOrderId);
      localStorage.setItem(`negotiation_${product._id}`, newOrderId);
    }
  }, [product._id]);

  // Load messages and setup polling
  useEffect(() => {
    if (orderId) {
      loadMessages();
      // Poll for new messages every 3 seconds
      pollingRef.current = setInterval(loadMessages, 3000);
      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    }
  }, [orderId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    if (!orderId) return;
    try {
      const response = await axios.get(`${apiUrl}/api/messages/${orderId}`);
      const newMessages = response.data || [];
      setMessages(newMessages);
      
      // Check if waiting for admin reply
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage && lastMessage.sender === 'customer') {
        setIsWaitingForReply(true);
      } else if (lastMessage && lastMessage.sender === 'admin') {
        setIsWaitingForReply(false);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !orderId) return;
    try {
      const messageData = {
        orderId,
        sender: 'customer',
        message: newMessage,
        isPriceNegotiation: false,
        createdAt: new Date(),
        customerName: localStorage.getItem('palmas_user') ? JSON.parse(localStorage.getItem('palmas_user')).name : 'Customer'
      };
      await axios.post(`${apiUrl}/api/messages`, messageData);
      setNewMessage('');
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const proposePrice = async () => {
    if (!proposedPrice || proposedPrice <= 0 || !orderId) return;
    setLoading(true);
    try {
      const messageData = {
        orderId,
        sender: 'customer',
        message: `I would like to propose ${parseInt(proposedPrice).toLocaleString()} CFA for "${product?.name || 'this product'}". Original price is ${(product?.priceCFA || 0).toLocaleString()} CFA.`,
        proposedPrice: parseInt(proposedPrice),
        isPriceNegotiation: true,
        createdAt: new Date(),
        customerName: localStorage.getItem('palmas_user') ? JSON.parse(localStorage.getItem('palmas_user')).name : 'Customer'
      };
      await axios.post(`${apiUrl}/api/messages`, messageData);
      setProposedPrice('');
      loadMessages();
    } catch (error) {
      console.error('Error proposing price:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = () => {
    const lastOffer = messages.filter(m => m.isPriceNegotiation && m.proposedPrice).pop();
    if (lastOffer && lastOffer.proposedPrice) {
      // Add to cart with negotiated price
      const event = new CustomEvent('addToCartWithPrice', { 
        detail: { 
          product: product, 
          price: lastOffer.proposedPrice 
        } 
      });
      window.dispatchEvent(event);
      onClose();
    }
  };

  const formatCFA = (amount) => {
    if (!amount && amount !== 0) return '0';
    return amount.toLocaleString();
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1A1A1A] rounded-xl w-full max-w-2xl h-[650px] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold text-lg">💬 Price Negotiation</h3>
            <p className="text-sm text-gray-400 mt-1">{product.name}</p>
            <p className="text-xs text-[#FF5C00] mt-1">Current price: {formatCFA(product.priceCFA)} CFA</p>
            {orderId && (
              <p className="text-xs text-gray-500 mt-1">Negotiation ID: {orderId.slice(-12)}</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl transition">&times;</button>
        </div>

        {/* Waiting Indicator */}
        {isWaitingForReply && (
          <div className="bg-[#FF5C00]/10 border-b border-[#FF5C00]/20 p-2 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-[#FF5C00] rounded-full animate-pulse"></div>
              <p className="text-xs text-[#FF5C00]">Waiting for admin response...</p>
              <div className="w-2 h-2 bg-[#FF5C00] rounded-full animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              <div className="text-5xl mb-3">💬</div>
              <p className="font-medium">Start negotiating with the admin!</p>
              <p className="text-sm mt-2">Propose a price or ask questions about the product.</p>
              <p className="text-xs text-gray-600 mt-4">Your negotiation will be saved. Come back anytime to continue.</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-3 rounded-xl ${
                msg.sender === 'customer' 
                  ? 'bg-[#FF5C00] text-white' 
                  : 'bg-[#0B0B0B] border border-white/10 text-gray-300'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold">
                    {msg.sender === 'customer' ? 'You' : 'Admin'}
                  </span>
                  <span className="text-xs opacity-70">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                {msg.isPriceNegotiation && msg.proposedPrice && (
                  <div className="mb-2 text-sm font-bold bg-black/20 p-2 rounded-lg">
                    💰 Price Proposal: {formatCFA(msg.proposedPrice)} CFA
                  </div>
                )}
                <p className="text-sm break-words">{msg.message}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-[#0B0B0B]/30">
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              placeholder="Propose your price (CFA)"
              value={proposedPrice}
              onChange={(e) => setProposedPrice(e.target.value)}
              className="flex-1 bg-[#0B0B0B] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF5C00] transition"
            />
            <button
              onClick={proposePrice}
              disabled={loading}
              className="bg-[#FF5C00] text-black px-5 py-3 rounded-lg font-bold hover:bg-[#FF5C00]/90 disabled:opacity-50 transition"
            >
              {loading ? 'Sending...' : 'Propose'}
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 bg-[#0B0B0B] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF5C00] transition"
            />
            <button 
              onClick={sendMessage} 
              className="bg-gray-700 text-white px-5 py-3 rounded-lg font-medium hover:bg-gray-600 transition"
            >
              Send
            </button>
          </div>
          
          {/* Accepted offer button */}
          {messages.some(m => m.isPriceNegotiation && m.proposedPrice) && (
            <button 
              onClick={handleAcceptOffer}
              className="w-full mt-3 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition text-sm"
            >
              ✓ Accept Last Offer & Add to Cart
            </button>
          )}
          
          <p className="text-xs text-gray-500 text-center mt-3">
            Your conversation is saved. Come back anytime to continue negotiating.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NegotiationModal;