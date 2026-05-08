import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import Switcher from './Switcher';

const Navbar = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => setShowLogoutConfirm(true);
  const confirmLogout = () => { logout(); navigate('/'); setShowLogoutConfirm(false); };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 ${darkMode ? 'bg-black/95' : 'bg-white/95'} backdrop-blur-md border-b ${darkMode ? 'border-[#00FF41]/20' : 'border-gray-200'} z-40`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to={user ? "/profile" : "/"} className="flex items-center gap-2">
  <img 
    src="/Logo.png" 
    alt="PALMAS" 
    className="h-8 w-auto object-contain"
  />
</Link>

            <div className="hidden md:flex items-center gap-8">
              <Link to={user ? "/profile" : "/"} className={`text-sm ${darkMode ? 'text-gray-400 hover:text-[#00FF41]' : 'text-gray-600 hover:text-black'} transition uppercase tracking-wide font-mono`}>
                {user ? t('dashboard') : t('home')}
              </Link>
              <Link to="/about" className={`text-sm ${darkMode ? 'text-gray-400 hover:text-[#00FF41]' : 'text-gray-600 hover:text-black'} transition uppercase tracking-wide font-mono`}>
                {t('about')}
              </Link>
              <Link to={user ? "/profile?tab=shop" : "/#products"} className={`text-sm ${darkMode ? 'text-gray-400 hover:text-[#00FF41]' : 'text-gray-600 hover:text-black'} transition uppercase tracking-wide font-mono`}>
                {t('shop')}
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {/* Language & Theme Switcher */}
              <Switcher />

              {/* Cart Icon */}
              <Link to="/cart" className="relative">
                <svg className={`w-6 h-6 ${darkMode ? 'text-white hover:text-[#00FF41]' : 'text-gray-800 hover:text-[#00FF41]'} transition`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 21v-6" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#00FF41] text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="flex items-center gap-3">
                  <span className={`text-sm ${darkMode ? 'text-[#00FF41]' : 'text-[#00FF41]'} uppercase tracking-wide font-mono`}>✦ {user.name?.split(' ')[0]}</span>
                  <button onClick={handleLogout} className={`text-sm ${darkMode ? 'text-gray-400 hover:text-red-500' : 'text-gray-600 hover:text-red-500'} transition uppercase tracking-wide font-mono`}>
                    {t('logout')}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className={`text-sm ${darkMode ? 'text-gray-400 hover:text-[#00FF41]' : 'text-gray-600 hover:text-black'} transition uppercase tracking-wide font-mono`}>
                    {t('login')}
                  </Link>
                  <Link to="/signup" className="bg-[#00FF41] text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#39FF14] transition uppercase tracking-wide font-mono">
                    {t('join')}
                  </Link>
                </div>
              )}
            </div>

            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <svg className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-800'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-[#00FF41]/20 space-y-3">
              <Link to={user ? "/profile" : "/"} className="block py-2">{user ? t('dashboard') : t('home')}</Link>
              <Link to="/about" className="block py-2">{t('about')}</Link>
              <Link to={user ? "/profile?tab=shop" : "/#products"} className="block py-2">{t('shop')}</Link>
              {user ? (
                <>
                  <span className="block text-[#00FF41] py-2">✦ {user.name}</span>
                  <button onClick={handleLogout} className="block py-2">{t('logout')}</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block py-2">{t('login')}</Link>
                  <Link to="/signup" className="block bg-[#00FF41] text-black px-4 py-2 rounded-lg text-center">{t('join')}</Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className={`${darkMode ? 'bg-[#111111]' : 'bg-white'} rounded-xl p-6 max-w-sm w-full mx-4 border border-[#00FF41]/30`}>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>{t('confirm')}</h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button onClick={confirmLogout} className="flex-1 bg-[#00FF41] text-black py-2 rounded-lg font-bold">Yes, Logout</button>
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 bg-gray-700 py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;