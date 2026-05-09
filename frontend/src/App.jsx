import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Signup from './pages/Signup';
import About from './pages/About';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import ProtectedRoute from './components/ProtectedRoute';
import WhatsAppChat from './components/WhatsAppChat';
import NegotiationModal from './components/NegotiationModal';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';
import './i18n';

function AppContent() {
  const [toast, setToast] = useState(null);
  const [negotiationProduct, setNegotiationProduct] = useState(null);
  const { darkMode } = React.useContext(ThemeContext) || { darkMode: true };

  useEffect(() => {
    const handleToast = (e) => {
      setToast(e.detail);
      setTimeout(() => setToast(null), 3000);
    };
    
    const handleNegotiation = (e) => {
      setNegotiationProduct(e.detail.product);
    };
    
    window.addEventListener('showToast', handleToast);
    window.addEventListener('openNegotiation', handleNegotiation);
    
    return () => {
      window.removeEventListener('showToast', handleToast);
      window.removeEventListener('openNegotiation', handleNegotiation);
    };
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-gray-50'}`}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
      </Routes>
      
      <WhatsAppChat />
      
      {negotiationProduct && (
        <NegotiationModal 
          product={negotiationProduct} 
          onClose={() => setNegotiationProduct(null)} 
        />
      )}
      
      {toast && (
        <div className={`fixed bottom-6 right-6 ${darkMode ? 'bg-[#1A1A1A]' : 'bg-white'} border-l-4 border-[#00FF41] rounded-lg p-4 shadow-xl z-50 animate-slide-up`}>
          <p className={darkMode ? 'text-white' : 'text-gray-900'}>{toast.message}</p>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ThemeProvider>
              <AppContent />
            </ThemeProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
