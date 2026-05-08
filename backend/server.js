const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const mongoose = require('mongoose');

// ✅ CORRECTED MongoDB Connection String (remove < > brackets)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://palmas_admin:Merciel2808@palmas1.se190ub.mongodb.net/palmas1';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ========== MONGODB SCHEMAS ==========
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  priceCFA: { type: Number, required: true },
  originalPriceCFA: Number,
  images: [String],
  piecesLeft: { type: Number, required: true },
  totalPieces: { type: Number, required: true },
  description: String,
  sizes: [String],
  isActive: { type: Boolean, default: true },
  isNegotiable: { type: Boolean, default: true },
  salesCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  isBlocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  products: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number
  }],
  totalAmount: Number,
  status: { type: String, default: 'pending' },
  trackingNumber: String,
  createdAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  orderId: String,
  sender: { type: String, enum: ['customer', 'admin'] },
  message: String,
  proposedPrice: Number,
  isPriceNegotiation: { type: Boolean, default: false },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const discountSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountPercent: { type: Number, required: true },
  expiresAt: Date,
  isActive: { type: Boolean, default: true }
});

const Product = mongoose.model('Product', productSchema);
const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);
const Message = mongoose.model('Message', messageSchema);
const Discount = mongoose.model('Discount', discountSchema);

// Helper function for image URLs
const getImageUrl = (filename) => {
  const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/${filename}`;
};

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'https://palmas-shop.vercel.app', 'https://palmas-api.onrender.com'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) return cb(null, true);
  cb(new Error('Only image files are allowed'));
};

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });

// ========== SITE SETTINGS ==========
let siteSettings = {
  dropEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  whatsappNumber: process.env.WHATSAPP_NUMBER || "698179499",
  currency: "CFA",
  exchangeRate: 600,
  lowStockAlert: 5,
  brandName: "PALMAS",
  tagline: "MADEBYSOCIETY",
  supportEmail: process.env.SUPPORT_EMAIL || "mbsmgmnt@gmail.com",
  companyPhone: process.env.COMPANY_PHONE || "698926139",
  companyAddress: process.env.COMPANY_ADDRESS || "Bonapriso 2382 carrefour armée de l'air, Douala, Cameroon",
  instagram: process.env.INSTAGRAM_HANDLE || "she.lovesanyass",
  locationLat: 4.0511,
  locationLng: 9.7679,
  nextDropName: "SUMMER 2026 COLLECTION",
  nextDropDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  nextDropEnabled: false
};

// ========== ADMIN CREDENTIALS ==========
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "SHELOVESANYASS";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "PalmasMBS95";

// Initialize admin user in database
const initializeAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const admin = new User({
        name: "Administrator",
        email: process.env.SUPPORT_EMAIL || "admin@palmas.com",
        password: ADMIN_PASSWORD,
        role: "admin"
      });
      await admin.save();
      console.log('✅ Admin user created in database');
    }
  } catch (error) {
    console.error('Error creating admin:', error);
  }
};
initializeAdmin();

// ========== AUTHENTICATION ROUTES (USING DATABASE) ==========
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    const newUser = new User({ email, password, name });
    await newUser.save();
    const { password: _, ...userWithoutPassword } = newUser.toObject();
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Signup failed' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    if (user.isBlocked) return res.status(403).json({ error: 'Compte bloqué' });
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// ========== PRODUCT ROUTES (USING DATABASE) ==========
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    product ? res.json(product) : res.status(404).json({ error: 'Produit non trouvé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ADMIN PRODUCT ROUTES (USING DATABASE) ==========
app.get('/api/admin/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/products', upload.array('images', 5), async (req, res) => {
  try {
    console.log('📦 Received product data:', req.body);
    
    // Extract values from form data
    const name = req.body.name;
    const category = req.body.category;
    const priceCFA = req.body.priceCFA;
    const originalPriceCFA = req.body.originalPriceCFA;
    const totalPieces = req.body.totalPieces;
    const piecesLeft = req.body.piecesLeft;
    const description = req.body.description || '';
    const sizes = req.body.sizes;
    const isNegotiable = req.body.isNegotiable;
    
    // VALIDATION: Check for missing or invalid values
    if (!name) {
      return res.status(400).json({ error: 'Le nom du produit est requis' });
    }
    if (!category) {
      return res.status(400).json({ error: 'La catégorie est requise' });
    }
    
    // Parse numbers safely
    const parsedPriceCFA = parseInt(priceCFA);
    const parsedOriginalPriceCFA = originalPriceCFA ? parseInt(originalPriceCFA) : null;
    const parsedTotalPieces = parseInt(totalPieces);
    const parsedPiecesLeft = piecesLeft !== undefined && piecesLeft !== '' ? parseInt(piecesLeft) : parsedTotalPieces;
    
    // Validate numbers
    if (isNaN(parsedPriceCFA) || parsedPriceCFA <= 0) {
      return res.status(400).json({ error: 'Le prix doit être un nombre valide supérieur à 0' });
    }
    if (isNaN(parsedTotalPieces) || parsedTotalPieces <= 0) {
      return res.status(400).json({ error: 'Le nombre total de pièces doit être un nombre valide supérieur à 0' });
    }
    if (isNaN(parsedPiecesLeft) || parsedPiecesLeft < 0) {
      return res.status(400).json({ error: 'Le nombre de pièces restantes doit être un nombre valide' });
    }
    if (parsedPiecesLeft > parsedTotalPieces) {
      return res.status(400).json({ error: 'Les pièces restantes ne peuvent pas dépasser le total' });
    }
    
    // Handle images
    const imageUrls = req.files && req.files.length > 0 
      ? req.files.map(file => getImageUrl(file.filename))
      : [];
    
    // Parse sizes
    const sizesArray = sizes ? sizes.split(',').map(s => s.trim()) : ['S', 'M', 'L', 'XL'];
    
    // Create product
    const newProduct = new Product({
      name: name,
      category: category,
      priceCFA: parsedPriceCFA,
      originalPriceCFA: parsedOriginalPriceCFA,
      images: imageUrls,
      piecesLeft: parsedPiecesLeft,
      totalPieces: parsedTotalPieces,
      description: description,
      sizes: sizesArray,
      isNegotiable: isNegotiable === 'true' || isNegotiable === true,
      isActive: true,
      salesCount: 0
    });
    
    await newProduct.save();
    console.log('✅ Product saved successfully:', newProduct.name);
    res.json(newProduct);
    
  } catch (error) {
    console.error('❌ Error saving product:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/products/:id', upload.array('images', 5), async (req, res) => {
  try {
    const productId = req.params.id;
    const existingProduct = await Product.findById(productId);
    
    if (!existingProduct) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    // Build updates object
    const updates = {};
    
    if (req.body.name) updates.name = req.body.name;
    if (req.body.category) updates.category = req.body.category;
    if (req.body.description) updates.description = req.body.description;
    if (req.body.sizes) updates.sizes = req.body.sizes.split(',').map(s => s.trim());
    if (req.body.isNegotiable !== undefined) updates.isNegotiable = req.body.isNegotiable === 'true';
    
    // Parse numeric values
    if (req.body.priceCFA) {
      const price = parseInt(req.body.priceCFA);
      if (!isNaN(price)) updates.priceCFA = price;
    }
    if (req.body.originalPriceCFA) {
      const originalPrice = parseInt(req.body.originalPriceCFA);
      if (!isNaN(originalPrice)) updates.originalPriceCFA = originalPrice;
    }
    if (req.body.totalPieces) {
      const total = parseInt(req.body.totalPieces);
      if (!isNaN(total)) updates.totalPieces = total;
    }
    if (req.body.piecesLeft) {
      const left = parseInt(req.body.piecesLeft);
      if (!isNaN(left)) updates.piecesLeft = left;
    }
    
    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => getImageUrl(file.filename));
      updates.images = [...(existingProduct.images || []), ...newImages];
    }
    
    const product = await Product.findByIdAndUpdate(productId, updates, { new: true });
    res.json(product);
    
  } catch (error) {
    console.error('❌ Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== MESSAGES & NEGOTIATIONS (USING DATABASE) ==========
app.get('/api/messages/:orderId', async (req, res) => {
  try {
    const messages = await Message.find({ orderId: req.params.orderId }).sort('createdAt');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ORDER ROUTES (USING DATABASE) ==========
app.post('/api/orders', async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
      orderId: `PALMAS_${Date.now()}`
    });
    await order.save();
    
    if (order.products) {
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { piecesLeft: -item.quantity, salesCount: item.quantity }
        });
      }
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders/:email', async (req, res) => {
  try {
    const orders = await Order.find({ customerEmail: req.params.email });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== DISCOUNT CODES (USING DATABASE) ==========
app.get('/api/admin/discounts', async (req, res) => {
  try {
    const discounts = await Discount.find();
    res.json(discounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/discounts', async (req, res) => {
  try {
    const { code, discountPercent, expiresAt } = req.body;
    const newDiscount = new Discount({
      code: code.toUpperCase(),
      discountPercent: parseInt(discountPercent),
      expiresAt: new Date(expiresAt)
    });
    await newDiscount.save();
    res.json(newDiscount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/discounts/:id', async (req, res) => {
  try {
    await Discount.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ALERTS (USING DATABASE) ==========
app.get('/api/admin/alerts', async (req, res) => {
  try {
    const lowStock = await Product.find({ piecesLeft: { $lte: siteSettings.lowStockAlert, $gt: 0 } });
    const soldOut = await Product.find({ piecesLeft: 0 });
    res.json({ lowStock, soldOut });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== DROP MANAGEMENT ROUTES ==========
app.get('/api/admin/drop', (req, res) => {
  res.json({
    nextDropName: siteSettings.nextDropName,
    nextDropDate: siteSettings.nextDropDate,
    nextDropEnabled: siteSettings.nextDropEnabled
  });
});

app.post('/api/admin/drop', (req, res) => {
  const { nextDropName, nextDropDate, nextDropEnabled } = req.body;
  if (nextDropName !== undefined) siteSettings.nextDropName = nextDropName;
  if (nextDropDate !== undefined) siteSettings.nextDropDate = new Date(nextDropDate);
  if (nextDropEnabled !== undefined) siteSettings.nextDropEnabled = nextDropEnabled;
  res.json({ success: true, siteSettings });
});

// ========== ADMIN LOGIN ==========
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Identifiants invalides' });
  }
});

// ========== ADMIN NEGOTIATIONS ROUTES ==========
app.get('/api/admin/negotiations', async (req, res) => {
  try {
    const messages = await Message.find().sort('createdAt');
    const threads = {};
    messages.forEach(msg => {
      if (!threads[msg.orderId]) threads[msg.orderId] = [];
      threads[msg.orderId].push(msg);
    });
    const formatted = Object.keys(threads).map(orderId => ({
      orderId,
      messages: threads[orderId],
      lastMessage: threads[orderId][threads[orderId].length - 1],
      unreadCount: threads[orderId].filter(m => m.sender === 'customer' && !m.read).length,
      createdAt: threads[orderId][0]?.createdAt,
      customerName: threads[orderId][0]?.customerName || 'Client'
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/negotiation/:orderId', async (req, res) => {
  try {
    const messages = await Message.find({ orderId: req.params.orderId }).sort('createdAt');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/messages/reply', async (req, res) => {
  try {
    const reply = new Message({ ...req.body, sender: 'admin', read: true });
    await reply.save();
    res.json(reply);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/messages/read', async (req, res) => {
  try {
    await Message.updateMany({ orderId: req.body.orderId, sender: 'customer' }, { read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ADMIN ORDERS ROUTES ==========
app.get('/api/admin/orders', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/orders/:id/status', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ADMIN USERS ROUTES ==========
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/users/:id/block', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isBlocked: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/users/:id/unblock', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isBlocked: false });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ADMIN STATS & ANALYTICS ==========
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [totalProducts, activeProducts, totalMessages, totalUsers, totalOrders, pendingNegotiations, lowStockProducts, soldOutProducts, pendingOrders] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Message.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(),
      Message.countDocuments({ isPriceNegotiation: true, sender: 'customer', read: false }),
      Product.countDocuments({ piecesLeft: { $lte: siteSettings.lowStockAlert, $gt: 0 } }),
      Product.countDocuments({ piecesLeft: 0 }),
      Order.countDocuments({ status: 'pending' })
    ]);
    
    res.json({
      totalProducts, activeProducts, totalMessages, totalUsers, totalOrders,
      pendingNegotiations, lowStockProducts, soldOutProducts, pendingOrders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/analytics', async (req, res) => {
  try {
    const orders = await Order.find();
    const products = await Product.find();
    
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalSold = products.reduce((sum, p) => sum + (p.salesCount || 0), 0);
    const popularProducts = [...products].sort((a, b) => b.salesCount - a.salesCount).slice(0, 5);
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    
    const monthlySales = {};
    orders.forEach(order => {
      if (order.createdAt) {
        const month = new Date(order.createdAt).toLocaleString('default', { month: 'long' });
        monthlySales[month] = (monthlySales[month] || 0) + (order.totalAmount || 0);
      }
    });
    
    const categories = ['HOODIES', 'TEES', 'ACCESSORIES', 'JACKETS', 'PANTS', 'SHORTS', 'SHOES', 'HATS', 'BAGS', 'JEWELRY'];
    const salesByCategory = {};
    categories.forEach(cat => {
      salesByCategory[cat] = products.filter(p => p.category === cat).reduce((sum, p) => sum + (p.salesCount || 0), 0);
    });
    
    res.json({
      totalRevenue, totalSold, totalOrders: orders.length, averageOrderValue,
      popularProducts, monthlySales, salesByCategory,
      conversionRate: users.length > 0 ? (orders.length / users.length) * 100 : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== SETTINGS & UTILITIES ==========
app.get('/api/settings', (req, res) => res.json(siteSettings));

app.put('/api/admin/settings', (req, res) => {
  siteSettings = { ...siteSettings, ...req.body };
  res.json(siteSettings);
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (req.file) {
    res.json({ imageUrl: getImageUrl(req.file.filename) });
  } else {
    res.status(400).json({ error: 'Aucun fichier téléchargé' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n✅ PALMAS SERVER RUNNING');
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🔑 ADMIN: ${ADMIN_USERNAME}`);
  console.log(`📁 Uploads: ${uploadDir}`);
  console.log(`🗄️ MongoDB: Connected to ${MONGODB_URI}`);
  console.log(`🎯 Drop management: ENABLED`);
  console.log('💬 Negotiation mode only\n');
});