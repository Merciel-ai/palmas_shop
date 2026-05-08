import React, { useState } from 'react';

const WhatsAppChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const whatsappNumber = '237698179499';

  const handleWhatsAppClick = () => {
    const whatsappMessage = message || "Hello! I'm interested in your products at PALMAS.";
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank');
    setIsOpen(false);
    setMessage('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all transform hover:scale-110"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.588 2.014.963 3.149.965h.002c3.18 0 5.767-2.587 5.768-5.766.001-3.18-2.585-5.767-5.766-5.767zm-2.148 8.061c-.585-.352-1.234-.807-1.234-1.458 0-.651.416-.958.791-1.128.257-.116.562-.145.81-.145.217 0 .421.015.613.045.385.059.771.258 1.044.574.334.389.524.902.524 1.451 0 .745-.384 1.374-1.055 1.774-.312.186-.657.268-.998.268-.371 0-.744-.088-1.078-.263zm3.637 1.355c-.74.443-1.602.676-2.485.676-1.138 0-2.206-.397-3.07-1.138-.791-.677-1.297-1.561-1.472-2.559-.191-1.087.005-2.185.543-3.087.497-.834 1.264-1.464 2.165-1.791.91-.331 1.902-.288 2.791.122.889.411 1.58 1.09 1.98 1.98.4.89.442 1.875.119 2.79-.296.842-.853 1.574-1.571 2.007z"/>
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 bg-[#1A1A1A] rounded-xl shadow-2xl border border-[#FF5C00]/20 overflow-hidden">
          <div className="bg-[#FF5C00] p-4">
            <h3 className="text-black font-bold">Chat with PALMAS</h3>
            <p className="text-black/80 text-sm">Typically replies within minutes</p>
          </div>
          <div className="p-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full bg-[#0B0B0B] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF5C00] resize-none"
              rows="3"
            />
            <button
              onClick={handleWhatsAppClick}
              className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition"
            >
              Send on WhatsApp
            </button>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Direct chat with PALMAS team via WhatsApp
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppChat;