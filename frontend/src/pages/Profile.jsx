import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';

const Profile = () => {
  const { user } = useAuth();
  const { wishlist, removeFromWishlist, addToWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('shop');
  const [searchTerm, setSearchTerm] = useState('');
  const [email, setEmail] = useState('');
  const [showNotification, setShowNotification] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [nextDropEnabled, setNextDropEnabled] = useState(false);
  const [nextDropName, setNextDropName] = useState('');
  const [nextDropDate, setNextDropDate] = useState(null);
  const [dropTimeLeft, setDropTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  
  // Pagination state - shows 9 products initially, loads 9 more each time
  const [visibleCount, setVisibleCount] = useState(9);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'https://palmas-api-jhip.onrender.com';

  // Helper function to fix image URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://placehold.co/600x800/1A1A1A/00FF41?text=No+Image';
    
    if (imagePath.includes('localhost:5000')) {
      return imagePath.replace('http://localhost:5000', apiUrl);
    }
    
    if (imagePath.startsWith('https://')) return imagePath;
    
    if (imagePath.startsWith('/uploads/')) {
      return `${apiUrl}${imagePath}`;
    }
    
    return imagePath;
  };

  // Fetch drop settings function
  const fetchDropSettings = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/drop`);
      setNextDropEnabled(response.data.nextDropEnabled);
      setNextDropName(response.data.nextDropName);
      setNextDropDate(response.data.nextDropDate);
    } catch (error) {
      console.error('Error fetching drop settings:', error);
    }
  };

  // Fetch products function
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/products`);
      console.log('Products loaded:', response.data.length);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Fetch user orders function
  const fetchUserOrders = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/orders/${user?.email}`);
      setUserOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Load more products
  const loadMoreProducts = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 9);
      setIsLoadingMore(false);
    }, 500);
  };

  useEffect(() => {
    fetchProducts();
    fetchUserOrders();
    fetchDropSettings();
    
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
    
    const timer = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (nextDropEnabled && nextDropDate) {
      const timer = setInterval(() => {
        const now = new Date();
        const dropDate = new Date(nextDropDate);
        const difference = dropDate - now;
        
        if (difference <= 0) {
          clearInterval(timer);
          setDropTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        } else {
          setDropTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference % (86400000)) / (3600000)),
            mins: Math.floor((difference % (3600000)) / (60000)),
            secs: Math.floor((difference % (60000)) / 1000)
          });
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [nextDropEnabled, nextDropDate]);

  const formatCFA = (amount) => {
    return (amount || 0).toLocaleString();
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    showToast('Added to cart! 🔥', 'success');
  };

  const handleNegotiate = (product) => {
    window.dispatchEvent(new CustomEvent('openNegotiation', { detail: { product } }));
  };

  const handleWishlist = (product) => {
    const isInWishlist = wishlist.some(item => item._id === product._id);
    if (isInWishlist) {
      removeFromWishlist(product._id);
      showToast('Removed from wishlist', 'info');
    } else {
      addToWishlist(product);
      showToast('Added to wishlist ❤️', 'success');
    }
  };

  const showToast = (message, type = 'success') => {
    setShowNotification({ message, type });
    setTimeout(() => setShowNotification(null), 3000);
  };

  const handleSubscribe = () => {
    if (email) {
      showToast('Subscribed to drops! 🔥', 'success');
      setEmail('');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Show ALL filtered products with pagination (not just 4)
  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const hasMoreProducts = visibleCount < filteredProducts.length;
  const totalProductsCount = filteredProducts.length;

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-8 border-b border-gray-800 overflow-x-auto">
          {[
            { id: 'shop', label: '🛍️ SHOP' },
            { id: 'orders', label: '📦 ORDERS' },
            { id: 'wishlist', label: '❤️ WISHLIST' },
            { id: 'profile', label: '👤 PROFILE' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 sm:px-6 py-3 font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'text-[#00FF41] border-b-2 border-[#00FF41]' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Welcome Banner */}
        {showWelcome && activeTab === 'shop' && (
          <div className="mb-8 animate-fade-in">
            <div className="bg-gradient-to-r from-[#00FF41]/10 to-transparent border-l-4 border-[#00FF41] p-4 rounded-r-lg">
              <p className="text-sm text-gray-300">
                Welcome , <span className="text-[#00FF41] font-semibold">{user?.name}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">Ready for the next exclusive drop?</p>
            </div>
          </div>
        )}

        {/* SHOP TAB - UPDATED with ALL products */}
        {activeTab === 'shop' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Products Grid - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
                  <h2 className="text-xl font-semibold text-white">All Products</h2>
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 bg-[#00FF41]/10 text-[#00FF41] rounded">
                      {totalProductsCount} item{totalProductsCount !== 1 ? 's' : ''}
                    </span>
                    {searchTerm && (
                      <span className="text-xs px-2 py-1 bg-white/10 text-gray-400 rounded">
                        Showing: {filteredProducts.length} of {products.length}
                      </span>
                    )}
                  </div>
                </div>
                
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12 bg-[#1A1A1A] rounded-xl">
                    <p className="text-4xl mb-3">🔍</p>
                    <p className="text-gray-400">No products found</p>
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="mt-3 text-[#00FF41] text-sm hover:underline"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {displayedProducts.map((product) => (
                        <Link to={`/product/${product._id}`} key={product._id}>
                          <div className="group bg-[#1A1A1A] rounded-xl overflow-hidden hover:shadow-xl hover:shadow-[#00FF41]/20 transition-all duration-300 h-full flex flex-col">
                            <div className="relative overflow-hidden h-64 bg-[#111]">
                              <img 
                                src={getImageUrl(product.images?.[0])} 
                                alt={product.name}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://placehold.co/600x800/1A1A1A/00FF41?text=No+Image';
                                }}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                              <div className="absolute top-3 left-3 flex gap-2">
                                {product.piecesLeft <= 10 && product.piecesLeft > 0 && (
                                  <span className="text-xs bg-[#00FF41] text-black px-2 py-1 rounded font-bold animate-pulse">LAST {product.piecesLeft}</span>
                                )}
                                {product.isNegotiable && (
                                  <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded">NEGOTIABLE</span>
                                )}
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleWishlist(product);
                                }}
                                className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-[#00FF41] transition"
                              >
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                              </button>
                              {product.piecesLeft === 0 && (
                                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10 backdrop-blur-sm">
                                  <span className="text-white text-lg sm:text-xl font-bold">SOLD OUT</span>
                                </div>
                              )}
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                              <h3 className="font-bold text-white mb-1 line-clamp-1">{product.name}</h3>
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-xl font-bold text-[#00FF41]">{formatCFA(product.priceCFA)} CFA</span>
                                {product.originalPriceCFA && product.originalPriceCFA > product.priceCFA && (
                                  <span className="text-xs text-gray-500 line-through">{formatCFA(product.originalPriceCFA)} CFA</span>
                                )}
                              </div>
                              <div className="flex gap-2 mt-auto">
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleAddToCart(product);
                                  }}
                                  className="flex-1 bg-[#00FF41] text-black text-sm py-2 rounded-lg font-medium hover:bg-[#39FF14] transition"
                                >
                                  ADD TO CART
                                </button>
                                {product.isNegotiable && (
                                  <button 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleNegotiate(product);
                                    }}
                                    className="px-3 py-2 border border-[#00FF41] text-[#00FF41] text-sm rounded-lg hover:bg-[#00FF41] hover:text-black transition"
                                    title="Negotiate price"
                                  >
                                    💬
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    
                    {/* Load More Button */}
                    {hasMoreProducts && (
                      <div className="flex justify-center mt-8">
                        <button
                          onClick={loadMoreProducts}
                          disabled={isLoadingMore}
                          className="px-8 py-3 border-2 border-[#00FF41] text-[#00FF41] rounded-lg font-bold hover:bg-[#00FF41] hover:text-black transition disabled:opacity-50"
                        >
                          {isLoadingMore ? (
                            <span className="flex items-center gap-2">
                              <span className="animate-spin">✦</span> Loading...
                            </span>
                          ) : (
                            `Load More (${filteredProducts.length - visibleCount} remaining)`
                          )}
                        </button>
                      </div>
                    )}
                    
                    {/* All products loaded message */}
                    {!hasMoreProducts && filteredProducts.length > 9 && (
                      <p className="text-center text-gray-500 text-sm mt-6">
                        ✦ All {filteredProducts.length} products loaded ✦
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Sidebar - Search and Filters */}
            <div className="space-y-6">
              {/* Search Box */}
              <div className="bg-[#1A1A1A] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Search</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search exclusive pieces..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00FF41] transition"
                  />
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="text-xs text-gray-500 mt-2 hover:text-[#00FF41] transition"
                  >
                    Clear search ✕
                  </button>
                )}
              </div>

              {/* Category Quick Filters */}
              <div className="bg-[#1A1A1A] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {['ALL', 'HOODIES', 'TEES', 'ACCESSORIES', 'JACKETS', 'PANTS', 'SHORTS', 'SHOES', 'HATS', 'BAGS', 'JEWELRY'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        if (cat === 'ALL') {
                          setSearchTerm('');
                        } else {
                          setSearchTerm(cat.toLowerCase());
                        }
                      }}
                      className="text-xs px-3 py-1.5 rounded-full border border-[#00FF41]/30 hover:border-[#00FF41] text-gray-300 hover:text-[#00FF41] transition"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Next Drop Countdown */}
              {nextDropEnabled && dropTimeLeft && (
                <div className="bg-gradient-to-br from-[#00FF41]/10 to-transparent border border-[#00FF41]/20 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-2">{nextDropName || 'Next Drop'}</h3>
                  <div className="grid grid-cols-4 gap-2 text-center mb-4">
                    <div><div className="text-2xl font-bold text-white">{dropTimeLeft.days}</div><div className="text-xs text-gray-500">DAYS</div></div>
                    <div><div className="text-2xl font-bold text-white">{dropTimeLeft.hours}</div><div className="text-xs text-gray-500">HOURS</div></div>
                    <div><div className="text-2xl font-bold text-white">{dropTimeLeft.mins}</div><div className="text-xs text-gray-500">MINS</div></div>
                    <div><div className="text-2xl font-bold text-white">{dropTimeLeft.secs}</div><div className="text-xs text-gray-500">SECS</div></div>
                  </div>
                  <button className="w-full bg-[#00FF41] text-black text-sm font-medium py-2 rounded-lg hover:bg-[#39FF14] transition">NOTIFY ME</button>
                </div>
              )}

              {/* Subscribe Section */}
              <div className="bg-[#1A1A1A] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-2">Don't miss out</h3>
                <p className="text-xs text-gray-500 mb-3">Subscribe for exclusive access</p>
                <div className="flex gap-2">
                  <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00FF41]" />
                  <button onClick={handleSubscribe} className="bg-[#00FF41] text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#39FF14] transition">SUBSCRIBE</button>
                </div>
              </div>

              {/* Wishlist Preview */}
              <div className="bg-[#1A1A1A] rounded-xl p-5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-white">Wishlist</h3>
                  <button onClick={() => setActiveTab('wishlist')} className="text-xs text-[#00FF41] hover:underline">View all</button>
                </div>
                <div className="space-y-2">
                  {wishlist.slice(0, 3).map((item) => (
                    <div key={item._id} className="flex items-center gap-3">
                      <img 
                        src={getImageUrl(item.images?.[0])} 
                        alt={item.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/100x100/1A1A1A/00FF41?text=No+Image';
                        }}
                        className="w-10 h-10 rounded object-cover" 
                      />
                      <div className="flex-1">
                        <p className="text-xs text-white line-clamp-1">{item.name}</p>
                        <p className="text-xs text-[#00FF41]">{formatCFA(item.priceCFA)} CFA</p>
                      </div>
                    </div>
                  ))}
                  {wishlist.length === 0 && <p className="text-xs text-gray-500 text-center py-4">Your wishlist is empty</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">My Orders</h2>
            {userOrders.length === 0 ? (
              <div className="text-center py-12 bg-[#1A1A1A] rounded-xl">
                <p className="text-4xl mb-3">📦</p>
                <p className="text-gray-400">No orders yet</p>
                <button onClick={() => setActiveTab('shop')} className="text-[#00FF41] text-sm mt-2 inline-block hover:underline">
                  Start Shopping →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {userOrders.map((order) => (
                  <div key={order._id} className="bg-[#1A1A1A] rounded-xl p-5 border border-gray-800">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-white">{order.orderId}</p>
                        <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#00FF41] font-bold text-lg">{formatCFA(order.totalAmount)} CFA</p>
                        <p className={`text-xs px-2 py-1 rounded-full inline-block ${
                          order.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                          order.status === 'shipped' ? 'bg-blue-500/20 text-blue-500' :
                          order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {order.status?.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="border-t border-gray-800 pt-3">
                      <p className="text-sm text-gray-400">Status: {order.status === 'pending' ? 'Awaiting confirmation' : 'Order confirmed'}</p>
                      {order.trackingNumber && (
                        <p className="text-sm text-gray-400 mt-1">Tracking: {order.trackingNumber}</p>
                      )}
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Items:</p>
                        {order.products?.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm py-1">
                            <span className="text-gray-400">{item.name} x{item.quantity}</span>
                            <span className="text-[#00FF41]">{formatCFA(item.price * item.quantity)} CFA</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* WISHLIST TAB */}
        {activeTab === 'wishlist' && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">My Wishlist ({wishlist.length})</h2>
            {wishlist.length === 0 ? (
              <div className="text-center py-12 bg-[#1A1A1A] rounded-xl">
                <p className="text-4xl mb-3">❤️</p>
                <p className="text-gray-400">Your wishlist is empty</p>
                <button onClick={() => setActiveTab('shop')} className="text-[#00FF41] text-sm mt-2 inline-block hover:underline">
                  Browse Products →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((product) => (
                  <div key={product._id} className="bg-[#1A1A1A] rounded-xl overflow-hidden group hover:shadow-xl hover:shadow-[#00FF41]/20 transition-all duration-300">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={getImageUrl(product.images?.[0])} 
                        alt={product.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/400x400/1A1A1A/00FF41?text=No+Image';
                        }}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                      <button 
                        onClick={() => handleWishlist(product)}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-red-500 transition"
                      >
                        <svg className="w-4 h-4 text-red-500 fill-current" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-white line-clamp-1">{product.name}</h3>
                      <p className="text-[#00FF41] font-bold mt-1">{formatCFA(product.priceCFA)} CFA</p>
                      <button onClick={() => handleAddToCart(product)} className="w-full mt-3 bg-[#00FF41] text-black py-2 rounded-lg font-medium text-sm hover:bg-[#39FF14] transition">
                        ADD TO CART
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#1A1A1A] rounded-xl p-8 border border-[#00FF41]/20">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-[#00FF41] to-[#39FF14] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-black">{user?.name?.charAt(0)}</span>
                </div>
                <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                <p className="text-gray-400">{user?.email}</p>
                <p className="text-[#00FF41] text-sm mt-2">✦ MEMBER SINCE {new Date(user?.createdAt).getFullYear()} ✦</p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-800">
                  <span className="text-gray-400">Member Type</span>
                  <span className="text-[#00FF41] font-bold">✦ EXCLUSIVE ✦</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-800">
                  <span className="text-gray-400">Total Orders</span>
                  <span className="text-white font-bold">{userOrders.length}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-800">
                  <span className="text-gray-400">Wishlist Items</span>
                  <span className="text-white font-bold">{wishlist.length}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-800">
                  <span className="text-gray-400">Total Spent</span>
                  <span className="text-[#00FF41] font-bold">{formatCFA(userOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0))} CFA</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div>
              <h4 className="text-xs font-semibold text-white mb-3">PALMAS</h4>
              <p className="text-xs text-gray-500">Not for everyone.<br/>Made for the few.</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white mb-3">Support</h4>
              <p className="text-xs text-gray-500">FAQ<br/>Shipping<br/>Returns</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white mb-3">Legal</h4>
              <p className="text-xs text-gray-500">Terms<br/>Privacy<br/>Cookies</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white mb-3">Social</h4>
              <p className="text-xs text-gray-500">Instagram<br/>Twitter<br/>TikTok</p>
            </div>
          </div>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <p className="text-xs text-gray-600">© 2026 PALMAS. All rights reserved.</p>
            <div className="flex gap-4">
              <span className="text-xs text-gray-500">✦ SECURE PAYMENT</span>
              <span className="text-xs text-gray-500">✦ WORLDWIDE SHIPPING</span>
              <span className="text-xs text-gray-500">✦ PREMIUM QUALITY</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 bg-[#1A1A1A] border-l-4 border-[#00FF41] rounded-lg p-4 shadow-xl z-50 animate-slide-up">
          <p className="text-sm text-white">{showNotification.message}</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
