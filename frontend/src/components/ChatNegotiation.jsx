import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatNegotiation = ({ orderId, product, onClose, onAccept }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const messagesEndRef = useRef();

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/${orderId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const messageData = {
      orderId,
      sender: 'customer',
      message: newMessage,
      isPriceNegotiation: false,
      createdAt: new Date()
    };
    
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/messages`, messageData);
      setNewMessage('');
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const proposeNewPrice = async () => {
    if (!proposedPrice || proposedPrice <= 0) return;
    
    const messageData = {
      orderId,
      sender: 'customer',
      message: `I would like to propose $${proposedPrice} for "${product.name}". Original price is $${product.price}.`,
      proposedPrice: parseFloat(proposedPrice),
      isPriceNegotiation: true,
      createdAt: new Date()
    };
    
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/messages`, messageData);
      setProposedPrice('');
      loadMessages();
    } catch (error) {
      console.error('Error proposing price:', error);
    }
  };

  const handleAccept = () => {
    const lastNegotiation = messages.filter(m => m.isPriceNegotiation && m.proposedPrice).pop();
    if (lastNegotiation && lastNegotiation.proposedPrice) {
      onAccept(lastNegotiation.proposedPrice);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-palmas-brown p-4 rounded-t-lg flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold">Price Negotiation</h3>
            <p className="text-sm text-white/80">Product: {product.name}</p>
          </div>
          <button onClick={onClose} className="text-white text-2xl hover:text-gray-300">&times;</button>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <p>Start negotiating with the admin!</p>
              <p className="text-sm mt-2">Propose a price or ask questions about the product.</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-3 rounded-lg ${msg.sender === 'customer' ? 'bg-palmas-brown text-white' : 'bg-gray-800 text-gray-200'}`}>
                {msg.isPriceNegotiation && msg.proposedPrice && (
                  <div className="mb-1 text-sm font-bold">
                    💰 Price Proposal: ${msg.proposedPrice}
                  </div>
                )}
                <p>{msg.message}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Proposal Input */}
        <div className="border-t border-gray-800 p-4">
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              placeholder="Propose new price (USD)"
              value={proposedPrice}
              onChange={(e) => setProposedPrice(e.target.value)}
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-palmas-brown"
            />
            <button
              onClick={proposeNewPrice}
              className="bg-palmas-brown px-6 py-2 rounded hover:bg-palmas-brown/80"
            >
              Propose
            </button>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-palmas-brown"
            />
            <button
              onClick={sendMessage}
              className="bg-gray-700 px-6 py-2 rounded hover:bg-gray-600"
            >
              Send
            </button>
          </div>
          
          <div className="mt-3 text-center">
            <button
              onClick={handleAccept}
              className="text-green-500 text-sm hover:text-green-400"
            >
              Accept last proposed price and add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatNegotiation;