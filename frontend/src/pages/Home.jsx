import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth(); // Get authenticated user
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [siteSettings, setSiteSettings] = useState({});
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [currentSlide, setCurrentSlide] = useState(0);

  const apiUrl = import.meta.env.VITE_API_URL || 'https://palmas-api-jhip.onrender.com';

  // Helper function to fix image URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    
    if (imagePath.includes('localhost:5000')) {
      return imagePath.replace('http://localhost:5000', apiUrl);
    }
    
    if (imagePath.startsWith('https://')) return imagePath;
    
    if (imagePath.startsWith('/uploads/')) {
      return `${apiUrl}${imagePath}`;
    }
    
    return imagePath;
  };

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920",
      title: "PALMAS",
      subtitle: "MADE BY SOCIETY",
      message: "Not for everyone. Made for the few."
    },
    {
      image: "https://i.imgur.com/MCjZLJG.jpeg",
      title: "STREET CULTURE",
      subtitle: "African Roots",
      message: "Where fashion meets heritage"
    },
    {
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920",
      title: "EXCLUSIVE DROPS",
      subtitle: "Limited Edition",
      message: "Never restocked. Ever."
    }
  ];

  useEffect(() => {
    fetchProducts();
    fetchSettings();
    addScrollReveal();
  }, []);

  useEffect(() => {
    if (siteSettings.dropEndsAt) {
      const timer = setInterval(() => {
        const difference = new Date(siteSettings.dropEndsAt) - new Date();
        if (difference <= 0) {
          clearInterval(timer);
        } else {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference % (86400000)) / (3600000)),
            mins: Math.floor((difference % (3600000)) / (60000)),
            secs: Math.floor((difference % (60000)) / 1000)
          });
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [siteSettings.dropEndsAt]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/products`);
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/settings`);
      setSiteSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const addScrollReveal = () => {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(reveal => observer.observe(reveal));
  };

  const convertToCFA = (amount) => {
    const rate = 600;
    return (amount * rate).toLocaleString();
  };

  const filteredProducts = filter === 'ALL' ? products : products.filter(p => p.category === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-[#00FF41] text-sm font-mono tracking-wide">LOADING EXPERIENCE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black">
      {/* Cinematic Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentSlide === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover scale-110"
              style={{ filter: 'brightness(0.4)' }}
            />
          </div>
        ))}
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black"></div>
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <div className="animate-zoom-in">
            <p className="text-[#00FF41] text-xs sm:text-sm tracking-[0.3em] mb-4 animate-pulse font-mono">✦ EXCLUSIVE ACCESS ✦</p>
            <h1 className="text-7xl sm:text-8xl md:text-9xl font-onyx tracking-tighter text-white animate-glow-green">
              PALMAS
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-[#00FF41] mt-4 font-light tracking-wider">
              MADE<span className="text-white"> BY </span>SOCIETY
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="bg-[#00FF41] text-black px-6 sm:px-8 py-3 rounded-full font-bold tracking-wide hover:bg-[#39FF14] transition transform hover:scale-105 shadow-lg shadow-[#00FF41]/30 text-sm sm:text-base">
                JOIN THE MOVEMENT
              </Link>
              <Link to="/login" className="border-2 border-[#00FF41] text-[#00FF41] px-6 sm:px-8 py-3 rounded-full font-bold hover:bg-[#00FF41] hover:text-black transition text-sm sm:text-base">
                SIGN IN
              </Link>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-[#00FF41] rounded-full flex justify-center">
            <div className="w-1 h-3 bg-[#00FF41] rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Drop Info Section */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-b from-black to-[#0A0A0A]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center reveal">
            <span className="text-[#00FF41] text-xs sm:text-sm tracking-wider font-mono">✦ LIMITED EDITION ✦</span>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-onyx mt-2 text-white">{siteSettings.dropName || 'DROP 01'}</h2>
            <p className="text-gray-400 text-sm sm:text-base mt-4">{siteSettings.dropDescription || 'LIMITED TO 50 PIECES | NEVER RESTOCKED'}</p>
          </div>
          
          {/* Countdown Timer */}
          <div className="max-w-3xl mx-auto text-center mt-12 sm:mt-16 reveal">
            <p className="text-[#00FF41] mb-6 text-xs sm:text-sm tracking-wider font-mono">DROP ENDS IN</p>
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="bg-white/5 backdrop-blur-sm p-3 sm:p-6 rounded-2xl border border-[#00FF41]/30">
                  <div className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#00FF41]">{value}</div>
                  <div className="text-[10px] sm:text-sm text-gray-400 mt-1 sm:mt-2 uppercase font-mono">{unit}</div>
                </div>
              ))}
            </div>
          </div>

          {/* PRODUCTS SECTION - ONLY VISIBLE TO LOGGED-IN USERS */}
          {user ? (
            <>
              {/* Filter Buttons - Only visible when logged in */}
              <div className="flex justify-center gap-1 sm:gap-2 md:gap-4 mb-8 sm:mb-12 flex-wrap">
                {['ALL', 'HOODIES', 'TEES', 'ACCESSORIES', 'JACKETS', 'PANTS', 'SHORTS', 'SHOES', 'HATS', 'BAGS', 'JEWELRY'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-3 sm:px-6 md:px-8 py-1.5 sm:py-2 md:py-3 rounded-full transition-all duration-300 text-[10px] sm:text-xs md:text-sm tracking-wide font-mono ${
                      filter === cat 
                        ? 'bg-[#00FF41] text-black shadow-lg shadow-[#00FF41]/50' 
                        : 'border border-[#00FF41]/30 hover:border-[#00FF41] text-gray-300'
                    }`}
                  >
                    {cat === 'ALL' ? 'ALL' : cat}
                  </button>
                ))}
              </div>

              {/* Products Grid - Only visible when logged in */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-400">No products available. Check back soon!</p>
                  </div>
                ) : (
                  filteredProducts.map((product, index) => (
                    <Link to={`/product/${product._id}`} key={product._id}>
                      <div className="group relative overflow-hidden bg-[#111111] rounded-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-[#00FF41]/20 reveal" style={{ transitionDelay: `${index * 100}ms` }}>
                        <div className="relative overflow-hidden h-80 sm:h-96 lg:h-[500px]">
                          <img 
                            src={getImageUrl(product.images?.[0])} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-image.jpg'; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          
                          {product.piecesLeft <= 10 && product.piecesLeft > 0 && (
                            <div className="absolute top-4 right-4 bg-[#00FF41] text-black px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold rounded-full z-10 animate-pulse">
                              LAST {product.piecesLeft}
                            </div>
                          )}
                          {product.piecesLeft === 0 && (
                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10 backdrop-blur-sm">
                              <span className="text-white text-lg sm:text-xl font-bold">SOLD OUT</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4 sm:p-6">
                          <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 group-hover:text-[#00FF41] transition-colors line-clamp-1">{product.name}</h3>
                          <div className="flex items-baseline gap-2 sm:gap-3">
                            <span className="text-lg sm:text-xl md:text-2xl font-bold text-[#00FF41]">{convertToCFA(product.price)} CFA</span>
                            {product.originalPrice && (
                              <span className="text-gray-500 line-through text-xs sm:text-sm">{convertToCFA(product.originalPrice)} CFA</span>
                            )}
                          </div>
                          <div className="mt-3 sm:mt-4 flex items-center justify-between">
                            <span className="text-[10px] sm:text-xs text-[#00FF41] font-mono">{product.category}</span>
                            <span className="text-[10px] sm:text-xs text-gray-500">✦ LIMITED ✦</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </>
          ) : (
            /* Login Prompt - Shown when user is NOT logged in */
            <div className="text-center py-16 sm:py-24 reveal">
              <div className="bg-gradient-to-br from-[#00FF41]/10 to-transparent border border-[#00FF41]/20 rounded-2xl p-8 sm:p-12 max-w-2xl mx-auto">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">Exclusive Access Only</h3>
                <p className="text-gray-400 mb-6">Sign in or create an account to view our exclusive collection.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/login" className="border-2 border-[#00FF41] text-[#00FF41] px-6 py-3 rounded-lg font-bold hover:bg-[#00FF41] hover:text-black transition">
                    SIGN IN
                  </Link>
                  <Link to="/signup" className="bg-[#00FF41] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#39FF14] transition">
                    JOIN THE MOVEMENT
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Cultural Section */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-t from-black to-[#0A0A0A]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="reveal">
              <span className="text-[#00FF41] text-xs sm:text-sm tracking-wider font-mono">✦ OUR CULTURE ✦</span>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-onyx mt-2 text-white">More Than<br/>Streetwear</h2>
              <p className="text-gray-400 text-sm sm:text-base mt-6 leading-relaxed">
                Palmas represents the fusion of African heritage and urban street culture. 
                Every piece tells a story of resilience, creativity, and the unbreakable spirit of the youth.
              </p>
              <Link to="/about" className="inline-flex items-center gap-2 mt-6 sm:mt-8 text-[#00FF41] hover:text-[#39FF14] transition group text-sm sm:text-base">
                Discover Our Story 
                <span className="group-hover:translate-x-2 transition">→</span>
              </Link>
            </div>
            <div className="relative reveal">
              <div className="absolute -inset-4 bg-[#00FF41]/20 rounded-2xl blur-xl animate-pulse"></div>
              <img src="https://i.imgur.com/4I3Tl7j.jpeg?w=800" alt="African Culture" className="relative rounded-2xl shadow-2xl w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 bg-black/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            {[
              { icon: "⚡", title: "NEVER RESTOCKED", desc: "Once it's gone, it's gone" },
              { icon: "✨", title: "PREMIUM QUALITY", desc: "Built to last forever" },
              { icon: "💬", title: "NEGOTIATE", desc: "Direct chat with admin" },
              { icon: "🌍", title: "AFRICAN ROOTS", desc: "Proudly African" }
            ].map((feature, idx) => (
              <div key={idx} className="reveal">
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{feature.icon}</div>
                <p className="font-bold text-[#00FF41] text-[10px] sm:text-xs md:text-sm">{feature.title}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 sm:py-16 border-t border-[#00FF41]/20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-3xl sm:text-4xl font-onyx text-[#00FF41] mb-4">PALMAS</h3>
          <p className="text-gray-400 text-xs sm:text-sm tracking-wider mb-6">NOT FOR EVERYONE • MADE FOR THE FEW</p>
          <div className="flex justify-center gap-6 sm:gap-8 mb-8">
            <a href="#" className="text-gray-400 hover:text-[#00FF41] transition text-xs sm:text-sm">INSTAGRAM</a>
            <a href="#" className="text-gray-400 hover:text-[#00FF41] transition text-xs sm:text-sm">TWITTER</a>
            <a href="#" className="text-gray-400 hover:text-[#00FF41] transition text-xs sm:text-sm">TIKTOK</a>
          </div>
          <p className="text-gray-600 text-[10px] sm:text-xs">© 2024 PALMAS. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
