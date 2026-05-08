import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PremiumSidebar = ({ isOpen, onClose, activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Welcome message disappears after 5 seconds
    const timer = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose();
  };

  const menuItems = [
    { id: 'shop', icon: '🛍️', label: 'Shop', path: '/profile?tab=shop' },
    { id: 'wishlist', icon: '❤️', label: 'Wishlist', path: '/profile?tab=wishlist' },
    { id: 'orders', icon: '📦', label: 'Orders', path: '/profile?tab=orders' },
    { id: 'profile', icon: '👤', label: 'Profile', path: '/profile?tab=profile' },
    { id: 'rewards', icon: '⭐', label: 'Rewards', path: '/profile?tab=rewards' },
  ];

  const categories = [
    { name: 'T-Shirts', count: 12 },
    { name: 'Hoodies', count: 8 },
    { name: 'Pants', count: 6 },
    { name: 'Jackets', count: 4 },
    { name: 'Accessories', count: 15 },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-[#0B0B0B] border-r border-white/10 z-50 transform transition-transform duration-300 ease-out overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* User Section */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF5C00] to-[#FF8C00] flex items-center justify-center">
              <span className="text-xl font-bold">{user?.name?.charAt(0) || 'U'}</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">{user?.name}</h3>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          
          {/* Welcome Message - Disappears after 5 seconds */}
          {showWelcome && (
            <div className="bg-[#FF5C00]/10 border border-[#FF5C00]/20 rounded-lg p-3 mb-4 animate-fade-in">
              <p className="text-xs text-[#FF5C00]">
                ✦ Welcome back, {user?.name?.split(' ')[0]}! ✦
              </p>
              <p className="text-xs text-gray-400 mt-1">Ready for the next drop?</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="text-center">
              <div className="text-xl font-bold text-white">12</div>
              <div className="text-xs text-gray-500">Orders</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">8</div>
              <div className="text-xs text-gray-500">Wishlist</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-[#FF5C00]">320</div>
              <div className="text-xs text-gray-500">Points</div>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Menu</p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                navigate(item.path);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-[#FF5C00]/10 text-[#FF5C00] border-l-2 border-[#FF5C00]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Categories */}
        <div className="p-4 border-t border-white/10">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Categories</p>
          <div className="space-y-1">
            {categories.map((cat) => (
              <button
                key={cat.name}
                className="w-full flex justify-between items-center px-3 py-2 rounded-lg hover:bg-white/5 transition"
              >
                <span className="text-sm text-gray-400">{cat.name}</span>
                <span className="text-xs text-gray-600">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-white/10 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-500 hover:bg-red-500/10 transition"
          >
            <span className="text-lg">🚪</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default PremiumSidebar;