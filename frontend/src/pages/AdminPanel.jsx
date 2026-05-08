import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
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

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Prevent back button logout
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

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setIsAuthenticated(false);
    setShowLogoutConfirm(false);
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/products`);
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const fetchNegotiations = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/negotiations`);
      setNegotiations(response.data || []);
    } catch (error) {
      console.error('Error fetching negotiations:', error);
      setNegotiations([]);
    }
  };

  const fetchMessages = async (orderId) => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/negotiation/${orderId}`);
      setMessages(response.data || []);
      await axios.post(`${apiUrl}/api/admin/messages/read`, { orderId });
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/users`);
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/orders`);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  const fetchDiscounts = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/discounts`);
      setDiscounts(response.data || []);
    } catch (error) {
      console.error('Error fetching discounts:', error);
      setDiscounts([]);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/alerts`);
      setAlerts(response.data || { lowStock: [], soldOut: [] });
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setAlerts({ lowStock: [], soldOut: [] });
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/stats`);
      setStats(response.data || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({});
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/analytics`);
      setAnalytics(response.data || {});
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics({});
    }
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
    } catch (error) {
      console.error('Error fetching settings:', error);
      setSettings({});
    }
  };

  const sendReply = async (acceptOffer = false) => {
    if (!replyText.trim() && !offerPrice) return;
    try {
      const replyData = {
        orderId: selectedNegotiation.orderId,
        message: replyText,
        proposedPrice: offerPrice ? parseFloat(offerPrice) : null,
        acceptOffer: acceptOffer
      };
      await axios.post(`${apiUrl}/api/admin/messages/reply`, replyData);
      setReplyText('');
      setOfferPrice('');
      fetchMessages(selectedNegotiation.orderId);
      fetchNegotiations();
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Error sending reply');
    }
  };

  const blockUser = async (userId) => {
    try {
      await axios.put(`${apiUrl}/api/admin/users/${userId}/block`);
      fetchUsers();
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const unblockUser = async (userId) => {
    try {
      await axios.put(`${apiUrl}/api/admin/users/${userId}/unblock`);
      fetchUsers();
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  const updateOrderStatus = async (orderId, status, trackingNumber = null) => {
    try {
      await axios.put(`${apiUrl}/api/admin/orders/${orderId}/status`, { status, trackingNumber });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
    }
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
    } catch (error) {
      console.error('Error creating discount:', error);
      alert('Error creating discount');
    }
  };

  const deleteDiscount = async (id) => {
    if (confirm('Delete this discount code?')) {
      try {
        await axios.delete(`${apiUrl}/api/admin/discounts/${id}`);
        fetchDiscounts();
      } catch (error) {
        console.error('Error deleting discount:', error);
      }
    }
  };

  const deleteProduct = async (id) => {
    if (confirm('Delete this product?')) {
      try {
        await axios.delete(`${apiUrl}/api/admin/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  // Handle image selection from device
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(prev => [...prev, ...files]);
    
    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index) => {
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleProductSubmit = async (e) => {
  e.preventDefault();
  
  // Create FormData object
  const formData = new FormData();
  
  // Get form values
  const name = e.target.name.value;
  const priceCFA = e.target.priceCFA.value;
  const originalPriceCFA = e.target.originalPriceCFA?.value || '';
  const totalPieces = e.target.totalPieces.value;
  const category = e.target.category.value;
  const description = e.target.description.value;
  const sizes = e.target.sizes.value;
  const isNegotiable = e.target.isNegotiable?.checked || false;
  
  // Append all text fields
  formData.append('name', name);
  formData.append('priceCFA', priceCFA);
  if (originalPriceCFA) formData.append('originalPriceCFA', originalPriceCFA);
  formData.append('totalPieces', totalPieces);
  formData.append('category', category);
  formData.append('description', description);
  formData.append('sizes', sizes);
  formData.append('isNegotiable', isNegotiable);
  
  // Append images - make sure they are actual File objects
  if (selectedImages.length > 0) {
    for (let i = 0; i < selectedImages.length; i++) {
      formData.append('images', selectedImages[i]);
    }
  }
  
  setUploadingImages(true);
  
  try {
    let response;
    if (editingProduct._id) {
      response = await axios.put(`${apiUrl}/api/admin/products/${editingProduct._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } else {
      response = await axios.post(`${apiUrl}/api/admin/products`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    
    console.log('Product saved:', response.data);
    
    // Clear image states
    setSelectedImages([]);
    setImagePreviewUrls([]);
    setEditingProduct(null);
    fetchProducts();
    alert('Product saved successfully!');
  } catch (error) {
    console.error('Error saving product:', error);
    alert('Error saving product: ' + (error.response?.data?.error || error.message));
  } finally {
    setUploadingImages(false);
  }
};

  const updateSetting = async (key, value) => {
    try {
      await axios.put(`${apiUrl}/api/admin/settings`, { [key]: value });
      fetchSettings();
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const formatCFA = (amount) => {
    if (!amount && amount !== 0) return '0';
    return amount.toLocaleString();
  };

if (!isAuthenticated) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B]">
      <div className="bg-[#1A1A1A] p-8 rounded-xl w-96 border border-[#FF5C00]/30">
        <h2 className="text-white text-2xl font-bold mb-6 text-center">Admin Access</h2>
        <input 
          type="text" 
          placeholder="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-[#0B0B0B] border border-gray-700 text-white px-4 py-3 rounded-lg mb-4 focus:outline-none focus:border-[#FF5C00]" 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          className="w-full bg-[#0B0B0B] border border-gray-700 text-white px-4 py-3 rounded-lg mb-6 focus:outline-none focus:border-[#FF5C00]" 
        />
        <button 
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#FF5C00] text-black py-3 rounded-lg font-bold hover:bg-[#FF5C00]/90 transition disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {/* REMOVED the default credentials hint line */}
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="bg-[#1A1A1A] rounded-xl p-6 max-w-sm w-full mx-4 border border-[#FF5C00]/30">
            <h3 className="text-xl font-bold text-white mb-3">Confirm Logout</h3>
            <p className="text-gray-400 mb-6">Are you sure you want to logout from admin panel?</p>
            <div className="flex gap-3">
              <button onClick={confirmLogout} className="flex-1 bg-[#FF5C00] text-black py-2 rounded-lg font-bold">Yes, Logout</button>
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 bg-gray-700 py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-[#0A0A0A] border-r border-[#FF5C00]/20 p-4 overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#FF5C00]">PALMAS</h2>
            <p className="text-xs text-gray-500 mt-1">Admin Dashboard</p>
          </div>
          
          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: '📊 Dashboard' },
              { id: 'negotiations', label: '💬 Negotiations', count: stats.pendingNegotiations },
              { id: 'products', label: '📦 Products', count: products.length },
              { id: 'orders', label: '📋 Orders', count: stats.pendingOrders },
              { id: 'customers', label: '👥 Customers', count: users.length },
              { id: 'discounts', label: '🏷️ Discounts', count: discounts.length },
              { id: 'analytics', label: '📈 Analytics' },
              { id: 'drop', label: '🎯 Next Drop', icon: '🎯' },
              { id: 'settings', label: '⚙️ Settings' }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition flex justify-between items-center ${
                  activeTab === tab.id 
                    ? 'bg-[#FF5C00]/10 border-l-2 border-[#FF5C00] text-[#FF5C00]' 
                    : 'hover:bg-white/5'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="bg-[#FF5C00] text-black text-xs px-2 py-1 rounded-full">{tab.count}</span>
                )}
              </button>
            ))}
          </nav>
          
          <div className="mt-8 pt-8 border-t border-gray-800">
            <button 
              onClick={handleLogout} 
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-500/20 text-red-500 transition"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold text-[#FF5C00] mb-6">Dashboard Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#FF5C00]/20">
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-[#FF5C00]">{formatCFA(analytics.totalRevenue || 0)} CFA</p>
                </div>
                <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#FF5C00]/20">
                  <p className="text-gray-400 text-sm">Total Orders</p>
                  <p className="text-2xl font-bold text-[#FF5C00]">{stats.totalOrders || 0}</p>
                </div>
                <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#FF5C00]/20">
                  <p className="text-gray-400 text-sm">Total Customers</p>
                  <p className="text-2xl font-bold text-[#FF5C00]">{users.length || 0}</p>
                </div>
                <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#FF5C00]/20">
                  <p className="text-gray-400 text-sm">Total Products</p>
                  <p className="text-2xl font-bold text-[#FF5C00]">{products.length || 0}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#FF5C00]/20">
                  <h3 className="font-bold text-lg mb-4 text-white">Popular Products</h3>
                  {(analytics.popularProducts || []).length > 0 ? (
                    analytics.popularProducts.map(product => (
                      <div key={product._id} className="flex justify-between py-3 border-b border-gray-800">
                        <span className="text-gray-300">{product.name}</span>
                        <span className="text-[#FF5C00] font-bold">{product.salesCount || 0} sold</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No sales data yet</p>
                  )}
                </div>
                <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#FF5C00]/20">
                  <h3 className="font-bold text-lg mb-4 text-white">Sales by Category</h3>
                  {Object.entries(analytics.salesByCategory || {}).length > 0 ? (
                    Object.entries(analytics.salesByCategory).map(([cat, count]) => (
                      <div key={cat} className="flex justify-between py-3 border-b border-gray-800">
                        <span className="text-gray-300">{cat}</span>
                        <span className="text-[#FF5C00] font-bold">{count} units</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No sales data yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Negotiations Tab */}
          {activeTab === 'negotiations' && (
            <div className="flex h-full min-h-[500px]">
              <div className="w-80 border-r border-[#FF5C00]/20 pr-4 overflow-y-auto">
                <h3 className="font-bold text-[#FF5C00] mb-4">Negotiations ({negotiations.length})</h3>
                {negotiations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No negotiations yet</p>
                ) : (
                  negotiations.map(neg => (
                    <button 
                      key={neg.orderId} 
                      onClick={() => setSelectedNegotiation(neg)}
                      className={`w-full p-3 rounded-lg text-left mb-2 transition ${
                        selectedNegotiation?.orderId === neg.orderId 
                          ? 'bg-[#FF5C00]/20 border border-[#FF5C00]' 
                          : 'bg-[#1A1A1A] hover:bg-[#FF5C00]/10'
                      }`}
                    >
                      <p className="text-sm font-bold truncate">{neg.orderId}</p>
                      <p className="text-xs text-gray-500 mt-1">{neg.createdAt ? new Date(neg.createdAt).toLocaleString() : 'Unknown date'}</p>
                      {neg.unreadCount > 0 && (
                        <span className="inline-block mt-1 bg-[#FF5C00] text-black text-xs px-2 py-0.5 rounded-full">
                          {neg.unreadCount} new
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
              <div className="flex-1 pl-4 flex flex-col">
                {selectedNegotiation ? (
                  <>
                    <div className="bg-[#1A1A1A] p-4 rounded-xl mb-4">
                      <h3 className="font-bold text-[#FF5C00]">Negotiation: {selectedNegotiation.orderId}</h3>
                      <p className="text-xs text-gray-500 mt-1">Started: {selectedNegotiation.createdAt ? new Date(selectedNegotiation.createdAt).toLocaleString() : 'Unknown'}</p>
                    </div>
                    <div className="flex-1 overflow-y-auto mb-4 space-y-3 max-h-[400px]">
                      {messages.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          <p className="text-4xl mb-2">💬</p>
                          <p>No messages yet</p>
                          <p className="text-xs mt-2">Start the conversation with the customer</p>
                        </div>
                      ) : (
                        messages.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-3 rounded-xl ${
                              msg.sender === 'admin' 
                                ? 'bg-[#FF5C00]/20 border border-[#FF5C00]/30' 
                                : 'bg-[#1A1A1A] border border-gray-800'
                            }`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-bold ${msg.sender === 'admin' ? 'text-[#FF5C00]' : 'text-gray-400'}`}>
                                  {msg.sender === 'admin' ? 'Admin' : 'Customer'}
                                </span>
                                <span className="text-xs text-gray-500">{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : ''}</span>
                              </div>
                              <p className="text-sm">{msg.message}</p>
                              {msg.proposedPrice && (
                                <div className="mt-2 text-xs bg-black/30 p-2 rounded">
                                  💰 Proposed: <span className="text-[#FF5C00] font-bold">{formatCFA(msg.proposedPrice)} CFA</span>
                                </div>
                              )}
                              {msg.acceptOffer && (
                                <div className="mt-2 text-xs text-green-500">✓ Offer accepted by admin</div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="border-t border-gray-800 pt-4">
                      <div className="flex gap-2 mb-3">
                        <input
                          type="number"
                          placeholder="Counter offer (CFA)"
                          value={offerPrice}
                          onChange={(e) => setOfferPrice(e.target.value)}
                          className="flex-1 bg-[#1A1A1A] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FF5C00]"
                        />
                      </div>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply..."
                        className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg px-4 py-2 mb-3 resize-none text-white focus:outline-none focus:border-[#FF5C00]"
                        rows="3"
                      />
                      <div className="flex gap-3">
                        <button onClick={() => sendReply(false)} className="flex-1 bg-[#FF5C00] text-black py-2 rounded-lg font-bold hover:bg-[#FF5C00]/90">
                          Send Reply
                        </button>
                        <button onClick={() => sendReply(true)} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700">
                          Accept Last Offer
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <p className="text-6xl mb-4">💬</p>
                      <p>Select a negotiation to start replying</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Products Tab - With Image Upload */}
 {/* Products Tab */}
{/* Products Tab */}
{activeTab === 'products' && (
  <div>
    {/* Header */}
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-[#FF5C00]">Products Management</h2>
      <p className="text-gray-400 text-sm mt-1">Manage your store inventory</p>
    </div>
    
    {/* Stats Cards */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#FF5C00]/20">
        <p className="text-gray-400 text-sm">Total Products</p>
        <p className="text-2xl font-bold text-[#FF5C00]">{products.length}</p>
      </div>
      <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#FF5C00]/20">
        <p className="text-gray-400 text-sm">Active Products</p>
        <p className="text-2xl font-bold text-[#FF5C00]">{products.filter(p => p.isActive).length}</p>
      </div>
      <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#FF5C00]/20">
        <p className="text-gray-400 text-sm">Low Stock</p>
        <p className="text-2xl font-bold text-yellow-500">{products.filter(p => p.piecesLeft <= 5 && p.piecesLeft > 0).length}</p>
      </div>
      <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#FF5C00]/20">
        <p className="text-gray-400 text-sm">Sold Out</p>
        <p className="text-2xl font-bold text-red-500">{products.filter(p => p.piecesLeft === 0).length}</p>
      </div>
    </div>
    
    {/* Products List */}
    {products.length === 0 ? (
      <div className="text-center py-16 bg-[#1A1A1A] rounded-xl border border-dashed border-[#FF5C00]/30">
        <div className="text-6xl mb-4">📦</div>
        <p className="text-gray-400 text-lg mb-2">No products yet</p>
        <p className="text-sm text-gray-500 mb-6">Get started by adding your first product</p>
        <button 
          onClick={() => {
            setEditingProduct({});
            setSelectedImages([]);
            setImagePreviewUrls([]);
          }} 
          className="bg-[#FF5C00] text-black px-8 py-3 rounded-lg font-bold hover:bg-[#FF5C00]/90 transition-all duration-200 shadow-lg inline-flex items-center gap-2"
        >
          <span className="text-xl">+</span> Add Your First Product
        </button>
      </div>
    ) : (
      <>
        {/* Products Grid */}
        <div className="grid gap-4 mb-6">
          {products.map(product => (
            <div key={product._id} className="bg-[#1A1A1A] p-4 rounded-xl border border-[#FF5C00]/20 hover:border-[#FF5C00]/50 transition-all duration-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-4">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/100x100/1A1A1A/FF5C00?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-[#0B0B0B] rounded-lg flex items-center justify-center text-3xl">🖼️</div>
                  )}
                  <div>
                    <h3 className="font-bold text-white text-lg">{product.name}</h3>
                    <p className="text-[#FF5C00] font-bold text-xl">{formatCFA(product.priceCFA)} CFA</p>
                    {product.originalPriceCFA && product.originalPriceCFA > product.priceCFA && (
                      <p className="text-xs text-gray-500 line-through">{formatCFA(product.originalPriceCFA)} CFA</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${product.piecesLeft <= 5 ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                        Stock: {product.piecesLeft}/{product.totalPieces}
                      </span>
                      {product.isNegotiable && (
                        <span className="text-xs bg-purple-500/20 text-purple-500 px-2 py-1 rounded-full">Negotiable</span>
                      )}
                      <span className="text-xs bg-[#FF5C00]/20 text-[#FF5C00] px-2 py-1 rounded-full">{product.category}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => {
                      setEditingProduct(product);
                      setSelectedImages([]);
                      setImagePreviewUrls([]);
                    }} 
                    className="flex-1 sm:flex-none border border-[#FF5C00] px-4 py-2 rounded-lg hover:bg-[#FF5C00]/20 transition font-medium"
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => deleteProduct(product._id)} 
                    className="flex-1 sm:flex-none border border-red-500 px-4 py-2 rounded-lg hover:bg-red-500/20 transition font-medium"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Add Product Button at the BOTTOM */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <button 
            onClick={() => {
              setEditingProduct({});
              setSelectedImages([]);
              setImagePreviewUrls([]);
            }} 
            className="w-full bg-gradient-to-r from-[#FF5C00] to-[#FF8C00] text-black py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-[#FF5C00]/30 transition-all duration-200 flex items-center justify-center gap-3 text-lg"
          >
            <span className="text-2xl">+</span> Add New Product
          </button>
          <p className="text-center text-xs text-gray-500 mt-3">Click to add a new product to your store</p>
        </div>
      </>
    )}
  </div>
)}
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-2xl font-bold text-[#FF5C00] mb-6">Orders ({orders.length})</h2>
              {orders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-4xl mb-2">📋</p>
                  <p>No orders yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order._id} className="bg-[#1A1A1A] p-5 rounded-xl border border-[#FF5C00]/20">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-white">{order.orderId}</p>
                          <p className="text-sm text-gray-400">{order.customerName}</p>
                          <p className="text-xs text-gray-500">{order.customerPhone}</p>
                          <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#FF5C00] font-bold text-xl">{formatCFA(order.totalAmount)} CFA</p>
                          <p className="text-sm text-gray-400">{order.paymentMethod}</p>
                          <select 
                            value={order.status} 
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            className="mt-2 bg-[#0B0B0B] border border-gray-700 rounded-lg px-3 py-1 text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </div>
                      </div>
                      <div className="border-t border-gray-800 pt-3">
                        <p className="text-sm text-gray-400 mb-2">Items:</p>
                        {order.products?.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm py-1">
                            <span>{item.name} x{item.quantity}</span>
                            <span className="text-[#FF5C00]">{formatCFA(item.price * item.quantity)} CFA</span>
                          </div>
                        ))}
                        <div className="mt-2">
                          <input
                            type="text"
                            placeholder="Add tracking number"
                            defaultValue={order.trackingNumber || ''}
                            onBlur={(e) => updateOrderStatus(order._id, order.status, e.target.value)}
                            className="w-full bg-[#0B0B0B] border border-gray-700 rounded-lg px-3 py-2 text-sm mt-2"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <div>
              <h2 className="text-2xl font-bold text-[#FF5C00] mb-6">Customers ({users.length})</h2>
              {users.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-4xl mb-2">👥</p>
                  <p>No customers yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map(user => (
                    <div key={user.id} className="bg-[#1A1A1A] p-4 rounded-xl border border-[#FF5C00]/20 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                        <p className="text-xs text-gray-500">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        {user.isBlocked ? (
                          <button onClick={() => unblockUser(user.id)} className="bg-green-600 px-4 py-1 rounded-lg text-sm">Unblock</button>
                        ) : (
                          <button onClick={() => blockUser(user.id)} className="bg-red-600 px-4 py-1 rounded-lg text-sm">Block</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Discounts Tab */}
          {activeTab === 'discounts' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#FF5C00]">Discount Codes</h2>
                <button onClick={() => setShowDiscountModal(true)} className="bg-[#FF5C00] text-black px-6 py-2 rounded-lg font-bold">
                  + Add Discount
                </button>
              </div>
              {discounts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-4xl mb-2">🏷️</p>
                  <p>No discount codes yet</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {discounts.map(discount => (
                    <div key={discount._id} className="bg-[#1A1A1A] p-4 rounded-xl border border-[#FF5C00]/20 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-[#FF5C00] text-lg">{discount.code}</p>
                        <p className="text-white">{discount.discountPercent}% OFF</p>
                        <p className="text-xs text-gray-500">Expires: {new Date(discount.expiresAt).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => deleteDiscount(discount._id)} className="border border-red-500 px-4 py-1 rounded-lg hover:bg-red-500/20">Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-2xl font-bold text-[#FF5C00] mb-6">Analytics</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#FF5C00]/20">
                  <h3 className="font-bold text-lg mb-4 text-white">Sales Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">Total Revenue</span>
                      <span className="text-[#FF5C00] font-bold text-lg">{formatCFA(analytics.totalRevenue || 0)} CFA</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">Total Items Sold</span>
                      <span className="text-white font-bold">{analytics.totalSold || 0}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">Total Orders</span>
                      <span className="text-white font-bold">{stats.totalOrders || 0}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">Average Order Value</span>
                      <span className="text-white font-bold">{formatCFA(analytics.averageOrderValue || 0)} CFA</span>
                    </div>
                  </div>
                </div>
                <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#FF5C00]/20">
                  <h3 className="font-bold text-lg mb-4 text-white">Category Performance</h3>
                  {Object.entries(analytics.salesByCategory || {}).length > 0 ? (
                    Object.entries(analytics.salesByCategory).map(([cat, count]) => (
                      <div key={cat} className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">{cat}</span>
                          <span className="text-white">{count} units</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div className="bg-[#FF5C00] h-2 rounded-full" style={{ width: `${Math.min(100, (count / Math.max(...Object.values(analytics.salesByCategory), 1)) * 100)}%` }}></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No category data yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Next Drop Management Tab */}
{activeTab === 'drop' && (
  <div>
    <h2 className="text-2xl font-bold text-[#00FF41] mb-6">Next Drop Management</h2>
    <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#00FF41]/20 max-w-2xl">
      <div className="space-y-4">
        <div>
          <label className="block text-gray-400 mb-2">Enable Next Drop Countdown</label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={nextDropEnabled}
              onChange={(e) => {
                setNextDropEnabled(e.target.checked);
                updateDropSettings();
              }}
              className="w-5 h-5 accent-[#00FF41]"
            />
            <span className="text-white">Show countdown on user profiles</span>
          </label>
        </div>
        
        <div>
          <label className="block text-gray-400 mb-2">Drop Name</label>
          <input 
            type="text" 
            value={nextDropName}
            onChange={(e) => setNextDropName(e.target.value)}
            placeholder="e.g., SUMMER 2026 COLLECTION"
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00FF41]"
          />
        </div>
        
        <div>
          <label className="block text-gray-400 mb-2">Drop Date & Time</label>
          <input 
            type="datetime-local" 
            value={nextDropDate}
            onChange={(e) => setNextDropDate(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00FF41]"
          />
        </div>
        
        <div className="pt-4">
          <button 
            onClick={updateDropSettings}
            className="bg-[#00FF41] text-black px-6 py-2 rounded-lg font-bold hover:bg-[#39FF14] transition"
          >
            Save Drop Settings
          </button>
        </div>
        
        {/* Preview Section */}
        {nextDropEnabled && (
          <div className="mt-6 pt-4 border-t border-gray-800">
            <p className="text-gray-400 text-sm mb-3">Preview:</p>
            <div className="bg-gradient-to-br from-[#00FF41]/10 to-transparent border border-[#00FF41]/20 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-2">{nextDropName || 'Next Drop'}</h3>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div><div className="text-2xl font-bold text-white">00</div><div className="text-xs text-gray-500">DAYS</div></div>
                <div><div className="text-2xl font-bold text-white">00</div><div className="text-xs text-gray-500">HOURS</div></div>
                <div><div className="text-2xl font-bold text-white">00</div><div className="text-xs text-gray-500">MINS</div></div>
                <div><div className="text-2xl font-bold text-white">00</div><div className="text-xs text-gray-500">SECS</div></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold text-[#FF5C00] mb-6">Settings</h2>
              <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#FF5C00]/20 max-w-2xl space-y-4">
                <div>
                  <label className="block text-gray-400 mb-2">WhatsApp Number</label>
                  <input 
                    type="text" 
                    value={settings.whatsappNumber || ''} 
                    onChange={(e) => updateSetting('whatsappNumber', e.target.value)}
                    className="w-full bg-[#0B0B0B] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FF5C00]" 
                  />
                  <p className="text-xs text-gray-500 mt-1">Include country code without + (e.g., 237612345678)</p>
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Low Stock Alert Threshold</label>
                  <input 
                    type="number" 
                    value={settings.lowStockAlert || 5} 
                    onChange={(e) => updateSetting('lowStockAlert', parseInt(e.target.value))}
                    className="w-full bg-[#0B0B0B] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FF5C00]" 
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={settings.emailNotifications || false} 
                    onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                    className="w-4 h-4 accent-[#FF5C00]"
                  />
                  <label className="text-gray-400">Enable Email Notifications</label>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={settings.autoRespondNegotiations || false} 
                    onChange={(e) => updateSetting('autoRespondNegotiations', e.target.checked)}
                    className="w-4 h-4 accent-[#FF5C00]"
                  />
                  <label className="text-gray-400">Auto-respond to Negotiations</label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Edit Modal with Image Upload */}
      {editingProduct !== null && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => {
          // Clean up preview URLs when closing
          imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
          setEditingProduct(null);
        }}>
          <div className="bg-[#1A1A1A] p-6 rounded-xl w-full max-w-lg border border-[#FF5C00]/20" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-[#FF5C00] mb-4">{editingProduct._id ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleProductSubmit}>
              <input 
                name="name" 
                defaultValue={editingProduct.name || ''} 
                placeholder="Product Name" 
                className="w-full bg-[#0B0B0B] border border-gray-700 rounded-lg px-4 py-2 mb-3 text-white focus:outline-none focus:border-[#FF5C00]" 
                required 
              />
              
              <div className="grid grid-cols-2 gap-3">
                <input 
                  name="priceCFA" 
                  type="number" 
                  defaultValue={editingProduct.priceCFA || ''} 
                  placeholder="Price (CFA)" 
                  className="bg-[#0B0B0B] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FF5C00]" 
                  required 
                />
                <input 
                  name="originalPriceCFA" 
                  type="number" 
                  defaultValue={editingProduct.originalPriceCFA || ''} 
                  placeholder="Original Price (CFA)" 
                  className="bg-[#0B0B0B] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FF5C00]" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-3">
  <input 
    name="totalPieces" 
    type="number" 
    defaultValue={editingProduct.totalPieces || ''} 
    placeholder="Total Pieces" 
    className="bg-[#0B0B0B] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FF5C00]" 
    required 
    step="1"
    min="1"
  />
  <input 
    name="piecesLeft" 
    type="number" 
    defaultValue={editingProduct.piecesLeft || editingProduct.totalPieces || ''} 
    placeholder="Pieces Left" 
    className="bg-[#0B0B0B] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FF5C00]" 
    required 
    step="1"
    min="0"
  />
</div>

<div className="grid grid-cols-2 gap-3 mt-3">
  <select 
    name="category" 
    defaultValue={editingProduct.category || 'HOODIES'} 
    className="bg-[#0B0B0B] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FF5C00]"
  >
    <option value="HOODIES">Hoodies / Sweatshirts</option>
    <option value="TEES">T-Shirts</option>
    <option value="ACCESSORIES">Accessories</option>
    <option value="JACKETS">Jackets / Coats</option>
    <option value="PANTS">Pants / Trousers</option>
    <option value="SHORTS">Shorts</option>
    <option value="SHOES">Shoes / Sneakers</option>
    <option value="HATS">Hats / Caps</option>
    <option value="BAGS">Bags / Backpacks</option>
    <option value="JEWELRY">Jewelry / Accessories</option>
  </select>
  
  {/* Empty div to maintain grid layout, or you can add something else here */}
  <div></div>
</div>
              
              <textarea 
                name="description" 
                defaultValue={editingProduct.description || ''} 
                placeholder="Product Description" 
                className="w-full bg-[#0B0B0B] border border-gray-700 rounded-lg px-4 py-2 mt-3 text-white focus:outline-none focus:border-[#FF5C00]" 
                rows="3"
              />
              
              <input 
                name="sizes" 
                defaultValue={editingProduct.sizes ? editingProduct.sizes.join(',') : 'S,M,L,XL'} 
                placeholder="Sizes (comma separated: S,M,L,XL)" 
                className="w-full bg-[#0B0B0B] border border-gray-700 rounded-lg px-4 py-2 mt-3 text-white focus:outline-none focus:border-[#FF5C00]" 
              />
              
              {/* Image Upload Section */}
              <div className="mt-3">
                <label className="block text-gray-400 mb-2">Product Images</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleImageSelect}
                  className="w-full bg-[#0B0B0B] border border-gray-700 rounded-lg px-4 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FF5C00] file:text-black hover:file:bg-[#FF5C00]/90"
                />
                <p className="text-xs text-gray-500 mt-1">You can select multiple images. First image will be the main product image.</p>
                
                {/* Image Preview */}
                {imagePreviewUrls.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-400 mb-2">Selected Images ({imagePreviewUrls.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {imagePreviewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img src={url} alt={`Preview ${index + 1}`} className="w-16 h-16 object-cover rounded-lg border border-gray-700" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Show existing product images when editing */}
                {editingProduct._id && editingProduct.images && editingProduct.images.length > 0 && imagePreviewUrls.length === 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-400 mb-2">Current Images</p>
                    <div className="flex flex-wrap gap-2">
                      {editingProduct.images.map((img, index) => (
                        <img key={index} src={img} alt={`Product ${index + 1}`} className="w-16 h-16 object-cover rounded-lg border border-gray-700" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Upload new images to add more or replace existing ones.</p>
                  </div>
                )}
              </div>
              
              <div className="mt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="isNegotiable" 
                    defaultChecked={editingProduct.isNegotiable !== false} 
                    className="w-4 h-4 accent-[#FF5C00]"
                  />
                  <span className="text-sm text-gray-400">Allow price negotiation</span>
                </label>
              </div>
              
              <div className="flex gap-3 mt-4">
                <button 
                  type="submit" 
                  disabled={uploadingImages}
                  className="flex-1 bg-[#FF5C00] text-black py-2 rounded-lg font-bold hover:bg-[#FF5C00]/90 disabled:opacity-50"
                >
                  {uploadingImages ? 'Uploading Images...' : 'Save Product'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
                    setEditingProduct(null);
                  }} 
                  className="flex-1 bg-gray-700 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setShowDiscountModal(false)}>
          <div className="bg-[#1A1A1A] p-6 rounded-xl w-full max-w-md border border-[#FF5C00]/20" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-[#FF5C00] mb-4">Create Discount Code</h3>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Discount Code (e.g., SUMMER20)" 
                value={newDiscount.code}
                onChange={(e) => setNewDiscount({...newDiscount, code: e.target.value.toUpperCase()})}
                className="w-full bg-[#0B0B0B] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FF5C00]"
              />
              <input 
                type="number" 
                placeholder="Discount Percentage (e.g., 20)" 
                value={newDiscount.discountPercent}
                onChange={(e) => setNewDiscount({...newDiscount, discountPercent: parseInt(e.target.value)})}
                className="w-full bg-[#0B0B0B] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FF5C00]"
              />
              <input 
                type="datetime-local" 
                value={newDiscount.expiresAt}
                onChange={(e) => setNewDiscount({...newDiscount, expiresAt: e.target.value})}
                className="w-full bg-[#0B0B0B] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FF5C00]"
              />
              <div className="flex gap-3 pt-2">
                <button onClick={createDiscount} className="flex-1 bg-[#FF5C00] text-black py-2 rounded-lg font-bold">Create</button>
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