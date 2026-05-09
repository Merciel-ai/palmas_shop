import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [products, setProducts] = useState([]);
  const [negotiations, setNegotiations] = useState([]);
  const [selectedNegotiation, setSelectedNegotiation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [alerts, setAlerts] = useState({ lowStock: [], soldOut: [] });
  const [stats, setStats] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [newDiscount, setNewDiscount] = useState({ code: '', discountPercent: 0, expiresAt: '' });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [nextDropEnabled, setNextDropEnabled] = useState(false);
  const [nextDropName, setNextDropName] = useState('SUMMER 2026 COLLECTION');
  const [nextDropDate, setNextDropDate] = useState('');
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const messagesEndRef = useRef(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'https://palmas-api-jhip.onrender.com';

  // Helper function to fix image URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://placehold.co/100x100/111/00FF41?text=No+Image';
    
    if (imagePath.includes('localhost:5000')) {
      return imagePath.replace('http://localhost:5000', apiUrl);
    }
    
    if (imagePath.startsWith('https://')) return imagePath;
    
    if (imagePath.startsWith('/uploads/')) {
      return `${apiUrl}${imagePath}`;
    }
    
    return imagePath;
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (isAuthenticated) {
      window.history.pushState(null, null, window.location.href);
      const handlePopState = () => {
        window.history.pushState(null, null, window.location.href);
        alert("Please use the logout button to exit the admin panel.");
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
      const interval = setInterval(fetchAllData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedNegotiation) {
      fetchMessages(selectedNegotiation.orderId);
    }
  }, [selectedNegotiation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchProducts(), fetchNegotiations(), fetchUsers(), fetchOrders(),
      fetchDiscounts(), fetchAlerts(), fetchStats(), fetchAnalytics(), fetchSettings()
    ]);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/api/admin/login`, { username, password });
      if (response.data.success) {
        setIsAuthenticated(true);
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => setShowLogoutConfirm(true);
  const confirmLogout = () => { setIsAuthenticated(false); setShowLogoutConfirm(false); };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/products`);
      setProducts(response.data || []);
    } catch (error) { setProducts([]); }
  };

  const fetchNegotiations = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/negotiations`);
      setNegotiations(response.data || []);
    } catch (error) { setNegotiations([]); }
  };

  const fetchMessages = async (orderId) => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/negotiation/${orderId}`);
      setMessages(response.data || []);
      await axios.post(`${apiUrl}/api/admin/messages/read`, { orderId });
    } catch (error) { setMessages([]); }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/users`);
      setUsers(response.data || []);
    } catch (error) { setUsers([]); }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/orders`);
      setOrders(response.data || []);
    } catch (error) { setOrders([]); }
  };

  const fetchDiscounts = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/discounts`);
      setDiscounts(response.data || []);
    } catch (error) { setDiscounts([]); }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/alerts`);
      setAlerts(response.data || { lowStock: [], soldOut: [] });
    } catch (error) { setAlerts({ lowStock: [], soldOut: [] }); }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/stats`);
      setStats(response.data || {});
    } catch (error) { setStats({}); }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/analytics`);
      setAnalytics(response.data || {});
    } catch (error) { setAnalytics({}); }
  };

  const fetchDropSettings = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/drop`);
      setNextDropEnabled(response.data.nextDropEnabled);
      setNextDropName(response.data.nextDropName);
      const date = new Date(response.data.nextDropDate);
      setNextDropDate(date.toISOString().slice(0, 16));
    } catch (error) {
      console.error('Error fetching drop settings:', error);
    }
  };

  const updateDropSettings = async () => {
    try {
      await axios.post(`${apiUrl}/api/admin/drop`, {
        nextDropName,
        nextDropDate,
        nextDropEnabled
      });
      alert('Drop settings saved successfully!');
    } catch (error) {
      console.error('Error saving drop settings:', error);
      alert('Error saving drop settings');
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/settings`);
      setSettings(response.data || {});
    } catch (error) { setSettings({}); }
  };

  const sendReply = async (acceptOffer = false) => {
    if (!replyText.trim() && !offerPrice) return;
    try {
      await axios.post(`${apiUrl}/api/admin/messages/reply`, {
        orderId: selectedNegotiation.orderId,
        message: replyText,
        proposedPrice: offerPrice ? parseFloat(offerPrice) : null,
        acceptOffer
      });
      setReplyText('');
      setOfferPrice('');
      fetchMessages(selectedNegotiation.orderId);
      fetchNegotiations();
    } catch (error) { alert('Error sending reply'); }
  };

  const blockUser = async (userId) => {
    try { await axios.put(`${apiUrl}/api/admin/users/${userId}/block`); fetchUsers(); } catch (error) {}
  };

  const unblockUser = async (userId) => {
    try { await axios.put(`${apiUrl}/api/admin/users/${userId}/unblock`); fetchUsers(); } catch (error) {}
  };

  const updateOrderStatus = async (orderId, status, trackingNumber = null) => {
    try {
      await axios.put(`${apiUrl}/api/admin/orders/${orderId}/status`, { status, trackingNumber });
      fetchOrders();
    } catch (error) {}
  };

  const createDiscount = async () => {
    if (!newDiscount.code || !newDiscount.discountPercent || !newDiscount.expiresAt) {
      alert('Please fill all fields');
      return;
    }
    try {
      await axios.post(`${apiUrl}/api/admin/discounts`, newDiscount);
      setShowDiscountModal(false);
      setNewDiscount({ code: '', discountPercent: 0, expiresAt: '' });
      fetchDiscounts();
    } catch (error) { alert('Error creating discount'); }
  };

  const deleteDiscount = async (id) => {
    if (confirm('Delete this discount code?')) {
      try { await axios.delete(`${apiUrl}/api/admin/discounts/${id}`); fetchDiscounts(); } catch (error) {}
    }
  };

  const deleteProduct = async (id) => {
    if (confirm('Delete this product?')) {
      try { await axios.delete(`${apiUrl}/api/admin/products/${id}`); fetchProducts(); } catch (error) {}
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(prev => [...prev, ...files]);
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', e.target.name.value);
    formData.append('priceCFA', e.target.priceCFA.value);
    if (e.target.originalPriceCFA?.value) formData.append('originalPriceCFA', e.target.originalPriceCFA.value);
    formData.append('totalPieces', e.target.totalPieces.value);
    formData.append('piecesLeft', e.target.piecesLeft.value);
    formData.append('category', e.target.category.value);
    formData.append('description', e.target.description.value);
    formData.append('sizes', e.target.sizes.value);
    formData.append('isNegotiable', e.target.isNegotiable?.checked || false);
    
    if (selectedImages.length > 0) {
      for (let i = 0; i < selectedImages.length; i++) {
        formData.append('images', selectedImages[i]);
      }
    }
    
    setUploadingImages(true);
    try {
      if (editingProduct._id) {
        await axios.put(`${apiUrl}/api/admin/products/${editingProduct._id}`, formData);
      } else {
        await axios.post(`${apiUrl}/api/admin/products`, formData);
      }
      setSelectedImages([]);
      setImagePreviewUrls([]);
      setEditingProduct(null);
      fetchProducts();
      alert('Product saved successfully!');
    } catch (error) {
      alert('Error saving product: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploadingImages(false);
    }
  };

  const updateSetting = async (key, value) => {
    try { await axios.put(`${apiUrl}/api/admin/settings`, { [key]: value }); fetchSettings(); } catch (error) {}
  };

  const formatCFA = (amount) => {
    if (!amount && amount !== 0) return '0';
    return amount.toLocaleString();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="bg-[#111] p-6 sm:p-8 rounded-xl w-full max-w-md border border-[#00FF41]/30">
          <h2 className="text-white text-2xl font-bold mb-6 text-center">Admin Access</h2>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-black border border-gray-700 text-white px-4 py-3 rounded-lg mb-4 focus:outline-none focus:border-[#00FF41]" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full bg-black border border-gray-700 text-white px-4 py-3 rounded-lg mb-6 focus:outline-none focus:border-[#00FF41]" />
          <button onClick={handleLogin} disabled={loading}
            className="w-full bg-[#00FF41] text-black py-3 rounded-lg font-bold hover:bg-[#39FF14] transition disabled:opacity-50">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] rounded-xl p-6 max-w-sm w-full mx-4 border border-[#00FF41]/30">
            <h3 className="text-xl font-bold text-white mb-3">Confirm Logout</h3>
            <p className="text-gray-400 mb-6">Are you sure you want to logout from admin panel?</p>
            <div className="flex gap-3">
              <button onClick={confirmLogout} className="flex-1 bg-[#00FF41] text-black py-2 rounded-lg font-bold">Yes, Logout</button>
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 bg-gray-700 py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-[#0A0A0A] border-r border-[#00FF41]/20 p-3 overflow-y-auto transition-all duration-300 relative flex-shrink-0`}>
          <button onClick={toggleSidebar}
            className="absolute -right-3 top-20 bg-[#00FF41] text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold z-10 hover:bg-[#39FF14] transition">
            {sidebarOpen ? '◀' : '▶'}
          </button>
          
          <div className="mb-6 text-center">
            {sidebarOpen ? (
              <>
                <h2 className="text-2xl font-bold text-[#00FF41]">PALMAS</h2>
                <p className="text-xs text-gray-500 mt-1">Admin Dashboard</p>
              </>
            ) : (
              <div className="text-2xl font-bold text-[#00FF41] mt-2">P</div>
            )}
          </div>
          
          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'negotiations', label: 'Negotiations', icon: '💬', count: stats.pendingNegotiations },
              { id: 'products', label: 'Products', icon: '📦', count: products.length },
              { id: 'orders', label: 'Orders', icon: '📋', count: stats.pendingOrders },
              { id: 'customers', label: 'Customers', icon: '👥', count: users.length },
              { id: 'discounts', label: 'Discounts', icon: '🏷️', count: discounts.length },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
              { id: 'drop', label: 'Next Drop', icon: '🎯' },
              { id: 'settings', label: 'Settings', icon: '⚙️' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition flex items-center gap-2 ${activeTab === tab.id ? 'bg-[#00FF41]/10 border-l-2 border-[#00FF41] text-[#00FF41]' : 'hover:bg-white/5'}`}>
                <span className="text-base sm:text-lg">{tab.icon}</span>
                {sidebarOpen && <span className="flex-1 text-xs sm:text-sm">{tab.label}</span>}
                {tab.count > 0 && sidebarOpen && (
                  <span className="bg-[#00FF41] text-black text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full">{tab.count}</span>
                )}
              </button>
            ))}
          </nav>
          
          <div className={`mt-6 pt-6 border-t border-gray-800 ${!sidebarOpen && 'text-center'}`}>
            <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-red-500/20 text-red-500 transition flex items-center gap-2">
              <span>🚪</span>
              {sidebarOpen && <span className="text-xs sm:text-sm">Logout</span>}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#00FF41] mb-6">Dashboard Overview</h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
                <div className="bg-[#111] p-3 sm:p-4 rounded-xl border border-[#00FF41]/20">
                  <p className="text-gray-400 text-[10px] sm:text-xs">Total Revenue</p>
                  <p className="text-base sm:text-xl font-bold text-[#00FF41]">{formatCFA(analytics.totalRevenue || 0)} CFA</p>
                </div>
                <div className="bg-[#111] p-3 sm:p-4 rounded-xl border border-[#00FF41]/20">
                  <p className="text-gray-400 text-[10px] sm:text-xs">Total Orders</p>
                  <p className="text-base sm:text-xl font-bold text-[#00FF41]">{stats.totalOrders || 0}</p>
                </div>
                <div className="bg-[#111] p-3 sm:p-4 rounded-xl border border-[#00FF41]/20">
                  <p className="text-gray-400 text-[10px] sm:text-xs">Total Customers</p>
                  <p className="text-base sm:text-xl font-bold text-[#00FF41]">{users.length || 0}</p>
                </div>
                <div className="bg-[#111] p-3 sm:p-4 rounded-xl border border-[#00FF41]/20">
                  <p className="text-gray-400 text-[10px] sm:text-xs">Total Products</p>
                  <p className="text-base sm:text-xl font-bold text-[#00FF41]">{products.length || 0}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#111] p-4 sm:p-6 rounded-xl border border-[#00FF41]/20">
                  <h3 className="font-bold text-base sm:text-lg mb-4 text-white">Popular Products</h3>
                  {(analytics.popularProducts || []).length > 0 ? (
                    analytics.popularProducts.map(product => (
                      <div key={product._id} className="flex justify-between py-3 border-b border-gray-800 text-xs sm:text-sm">
                        <span className="text-gray-300">{product.name}</span>
                        <span className="text-[#00FF41] font-bold">{product.salesCount || 0} sold</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8 text-sm">No sales data yet</p>
                  )}
                </div>
                <div className="bg-[#111] p-4 sm:p-6 rounded-xl border border-[#00FF41]/20">
                  <h3 className="font-bold text-base sm:text-lg mb-4 text-white">Sales by Category</h3>
                  {Object.entries(analytics.salesByCategory || {}).length > 0 ? (
                    Object.entries(analytics.salesByCategory).map(([cat, count]) => (
                      <div key={cat} className="flex justify-between py-3 border-b border-gray-800 text-xs sm:text-sm">
                        <span className="text-gray-300">{cat}</span>
                        <span className="text-[#00FF41] font-bold">{count} units</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8 text-sm">No sales data yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Products Tab - With fixed images */}
          {activeTab === 'products' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#00FF41]">Products Management</h2>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">Manage your store inventory</p>
                </div>
                <button onClick={() => { setEditingProduct({}); setSelectedImages([]); setImagePreviewUrls([]); }} 
                  className="w-full sm:w-auto bg-[#00FF41] text-black px-4 sm:px-6 py-2 rounded-lg font-bold text-sm sm:text-base hover:bg-[#39FF14] transition">
                  + Add Product
                </button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="bg-[#111] p-3 rounded-xl border border-[#00FF41]/20">
                  <p className="text-gray-400 text-[10px] sm:text-xs">Total Products</p>
                  <p className="text-base sm:text-xl font-bold text-[#00FF41]">{products.length}</p>
                </div>
                <div className="bg-[#111] p-3 rounded-xl border border-[#00FF41]/20">
                  <p className="text-gray-400 text-[10px] sm:text-xs">Active</p>
                  <p className="text-base sm:text-xl font-bold text-[#00FF41]">{products.filter(p => p.isActive).length}</p>
                </div>
                <div className="bg-[#111] p-3 rounded-xl border border-[#00FF41]/20">
                  <p className="text-gray-400 text-[10px] sm:text-xs">Low Stock</p>
                  <p className="text-base sm:text-xl font-bold text-yellow-500">{products.filter(p => p.piecesLeft <= 5 && p.piecesLeft > 0).length}</p>
                </div>
                <div className="bg-[#111] p-3 rounded-xl border border-[#00FF41]/20">
                  <p className="text-gray-400 text-[10px] sm:text-xs">Sold Out</p>
                  <p className="text-base sm:text-xl font-bold text-red-500">{products.filter(p => p.piecesLeft === 0).length}</p>
                </div>
              </div>
              
              {products.length === 0 ? (
                <div className="text-center py-16 bg-[#111] rounded-xl border border-dashed border-[#00FF41]/30">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-gray-400 text-base mb-2">No products yet</p>
                  <p className="text-sm text-gray-500 mb-6">Get started by adding your first product</p>
                  <button onClick={() => { setEditingProduct({}); setSelectedImages([]); setImagePreviewUrls([]); }} 
                    className="bg-[#00FF41] text-black px-6 py-2 rounded-lg font-bold">+ Add Your First Product</button>
                </div>
              ) : (
                <>
                  <div className="grid gap-3 mb-6">
                    {products.map(product => (
                      <div key={product._id} className="bg-[#111] p-3 sm:p-4 rounded-xl border border-[#00FF41]/20 hover:border-[#00FF41]/50 transition">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="flex gap-3">
                            <img 
                              src={getImageUrl(product.images?.[0])} 
                              alt={product.name} 
                              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg" 
                              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/111/00FF41?text=No+Image'; }} 
                            />
                            <div>
                              <h3 className="font-bold text-white text-sm sm:text-base">{product.name}</h3>
                              <p className="text-[#00FF41] font-bold text-sm sm:text-base">{formatCFA(product.priceCFA)} CFA</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full ${product.piecesLeft <= 5 ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                                  Stock: {product.piecesLeft}/{product.totalPieces}
                                </span>
                                <span className="text-[10px] sm:text-xs bg-[#00FF41]/20 text-[#00FF41] px-1.5 py-0.5 rounded-full">{product.category}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <button onClick={() => { setEditingProduct(product); setSelectedImages([]); setImagePreviewUrls([]); }} 
                              className="flex-1 sm:flex-none border border-[#00FF41] px-3 py-1.5 rounded-lg text-xs sm:text-sm hover:bg-[#00FF41]/20 transition">Edit</button>
                            <button onClick={() => deleteProduct(product._id)} 
                              className="flex-1 sm:flex-none border border-red-500 px-3 py-1.5 rounded-lg text-xs sm:text-sm hover:bg-red-500/20 transition">Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-800">
                    <button onClick={() => { setEditingProduct({}); setSelectedImages([]); setImagePreviewUrls([]); }} 
                      className="w-full bg-gradient-to-r from-[#00FF41] to-[#39FF14] text-black py-3 sm:py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-base sm:text-lg">
                      <span className="text-xl">+</span> Add New Product
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Negotiations Tab - Keep as is */}
          {activeTab === 'negotiations' && (
            <div className="flex flex-col lg:flex-row h-full min-h-[500px] gap-4">
              <div className="w-full lg:w-80 border-r border-[#00FF41]/20 pr-0 lg:pr-4 overflow-y-auto">
                <h3 className="font-bold text-[#00FF41] mb-4 text-base sm:text-lg">Negotiations ({negotiations.length})</h3>
                {negotiations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No negotiations yet</p>
                ) : (
                  negotiations.map(neg => (
                    <button key={neg.orderId} onClick={() => setSelectedNegotiation(neg)}
                      className={`w-full p-3 rounded-lg text-left mb-2 transition text-sm ${selectedNegotiation?.orderId === neg.orderId ? 'bg-[#00FF41]/20 border border-[#00FF41]' : 'bg-[#111] hover:bg-[#00FF41]/10'}`}>
                      <p className="font-bold truncate text-xs sm:text-sm">{neg.orderId}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{neg.createdAt ? new Date(neg.createdAt).toLocaleString() : 'Unknown'}</p>
                      {neg.unreadCount > 0 && <span className="inline-block mt-1 bg-[#00FF41] text-black text-[10px] px-1.5 py-0.5 rounded-full">{neg.unreadCount} new</span>}
                    </button>
                  ))
                )}
              </div>
              <div className="flex-1">
                {selectedNegotiation ? (
                  <>
                    <div className="bg-[#111] p-3 sm:p-4 rounded-xl mb-4">
                      <h3 className="font-bold text-[#00FF41] text-sm sm:text-base">Negotiation: {selectedNegotiation.orderId}</h3>
                    </div>
                    <div className="h-64 sm:h-96 overflow-y-auto mb-4 space-y-3">
                      {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-2 sm:p-3 rounded-xl text-xs sm:text-sm ${msg.sender === 'admin' ? 'bg-[#00FF41]/20 border border-[#00FF41]/30' : 'bg-[#111] border border-gray-800'}`}>
                            <p>{msg.message}</p>
                            {msg.proposedPrice && <p className="text-[10px] sm:text-xs text-[#00FF41] mt-1">💰 {formatCFA(msg.proposedPrice)} CFA</p>}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="border-t border-gray-800 pt-4">
                      <input type="number" placeholder="Counter offer (CFA)" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)}
                        className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm mb-2" />
                      <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type your reply..."
                        className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm mb-2 resize-none" rows="2" />
                      <div className="flex gap-3">
                        <button onClick={() => sendReply(false)} className="flex-1 bg-[#00FF41] text-black py-2 rounded-lg font-bold text-sm">Send Reply</button>
                        <button onClick={() => sendReply(true)} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-sm">Accept Offer</button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center"><p className="text-4xl mb-2">💬</p><p className="text-sm">Select a negotiation to reply</p></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Other Tabs - Placeholder */}
          {(activeTab === 'orders' || activeTab === 'customers' || activeTab === 'discounts' || activeTab === 'analytics' || activeTab === 'drop' || activeTab === 'settings') && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#00FF41] mb-6 capitalize">{activeTab}</h2>
              <div className="bg-[#111] p-6 rounded-xl border border-[#00FF41]/20 text-center text-gray-400">
                <p className="text-sm sm:text-base">Content for {activeTab} section loads here. Please add data to see details.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Edit Modal - With fixed image preview */}
      {editingProduct !== null && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => { imagePreviewUrls.forEach(url => URL.revokeObjectURL(url)); setEditingProduct(null); }}>
          <div className="bg-[#111] p-4 sm:p-6 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[#00FF41]/20" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg sm:text-xl font-bold text-[#00FF41] mb-4">{editingProduct._id ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleProductSubmit} className="space-y-3">
              <input name="name" defaultValue={editingProduct.name || ''} placeholder="Product Name" className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm" required />
              <div className="grid grid-cols-2 gap-3">
                <input name="priceCFA" type="number" defaultValue={editingProduct.priceCFA || ''} placeholder="Price (CFA)" className="bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm" required />
                <input name="originalPriceCFA" type="number" defaultValue={editingProduct.originalPriceCFA || ''} placeholder="Original Price (CFA)" className="bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input name="totalPieces" type="number" defaultValue={editingProduct.totalPieces || ''} placeholder="Total Pieces" className="bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm" required />
                <input name="piecesLeft" type="number" defaultValue={editingProduct.piecesLeft || editingProduct.totalPieces || ''} placeholder="Pieces Left" className="bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select name="category" defaultValue={editingProduct.category || 'HOODIES'} className="bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm">
                  <option value="HOODIES">Hoodies</option><option value="TEES">T-Shirts</option><option value="ACCESSORIES">Accessories</option>
                  <option value="JACKETS">Jackets</option><option value="PANTS">Pants</option><option value="SHORTS">Shorts</option>
                  <option value="SHOES">Shoes</option><option value="HATS">Hats</option><option value="BAGS">Bags</option><option value="JEWELRY">Jewelry</option>
                </select>
                <div></div>
              </div>
              <textarea name="description" defaultValue={editingProduct.description || ''} placeholder="Description" className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm" rows="3" />
              <input name="sizes" defaultValue={editingProduct.sizes ? editingProduct.sizes.join(',') : 'S,M,L,XL'} placeholder="Sizes (comma separated)" className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm" />
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">Product Images</label>
                <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm" />
                {imagePreviewUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img src={url} className="w-12 h-12 object-cover rounded-lg border border-gray-700" />
                        <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isNegotiable" defaultChecked={editingProduct.isNegotiable !== false} className="w-4 h-4 accent-[#00FF41]" />
                <span className="text-sm text-gray-400">Allow price negotiation</span>
              </label>
              
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={uploadingImages} className="flex-1 bg-[#00FF41] text-black py-2 rounded-lg font-bold text-sm">{uploadingImages ? 'Uploading...' : 'Save Product'}</button>
                <button type="button" onClick={() => { imagePreviewUrls.forEach(url => URL.revokeObjectURL(url)); setEditingProduct(null); }} className="flex-1 bg-gray-700 py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDiscountModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setShowDiscountModal(false)}>
          <div className="bg-[#111] p-6 rounded-xl w-full max-w-md border border-[#00FF41]/20" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-[#00FF41] mb-4">Create Discount Code</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Discount Code" value={newDiscount.code} onChange={(e) => setNewDiscount({...newDiscount, code: e.target.value.toUpperCase()})} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2" />
              <input type="number" placeholder="Discount Percentage" value={newDiscount.discountPercent} onChange={(e) => setNewDiscount({...newDiscount, discountPercent: parseInt(e.target.value)})} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2" />
              <input type="datetime-local" value={newDiscount.expiresAt} onChange={(e) => setNewDiscount({...newDiscount, expiresAt: e.target.value})} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2" />
              <div className="flex gap-3">
                <button onClick={createDiscount} className="flex-1 bg-[#00FF41] text-black py-2 rounded-lg font-bold">Create</button>
                <button onClick={() => setShowDiscountModal(false)} className="flex-1 bg-gray-700 py-2 rounded-lg">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
