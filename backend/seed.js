const mongoose = require('mongoose');
require('dotenv').config();

// Define Product Schema directly in seed file
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['HOODIES', 'TEES', 'ACCESSORIES'], required: true },
  price: { type: Number, required: true },
  originalPrice: Number,
  images: [String],
  piecesLeft: { type: Number, required: true },
  totalPieces: { type: Number, required: true },
  description: String,
  sizes: [String],
  isActive: { type: Boolean, default: true },
  dropEndsAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', ProductSchema);

// Sample products data
const sampleProducts = [
  {
    name: 'PALMAS CHROME HOODIE',
    category: 'HOODIES',
    price: 120,
    originalPrice: 150,
    images: ['https://placehold.co/600x800/1a1a1a/8B5A2B?text=Chrome+Hoodie'],
    piecesLeft: 12,
    totalPieces: 50,
    description: 'Premium chrome hoodie with embroidered details. 300GSM cotton. Made for the rare few.',
    sizes: ['S', 'M', 'L', 'XL'],
    isActive: true
  },
  {
    name: 'PALMAS CROSS TEE',
    category: 'TEES',
    price: 45,
    originalPrice: 65,
    images: ['https://placehold.co/600x800/1a1a1a/8B5A2B?text=Cross+Tee'],
    piecesLeft: 8,
    totalPieces: 50,
    description: 'Limited edition cross tee. 100% premium cotton. Never restocked.',
    sizes: ['S', 'M', 'L', 'XL'],
    isActive: true
  },
  {
    name: 'PALMAS ZIP HOODIE',
    category: 'HOODIES',
    price: 140,
    originalPrice: 180,
    images: ['https://placehold.co/600x800/1a1a1a/8B5A2B?text=Zip+Hoodie'],
    piecesLeft: 0,
    totalPieces: 50,
    description: 'Full zip hoodie with custom hardware. Premium quality.',
    sizes: ['S', 'M', 'L', 'XL'],
    isActive: true
  },
  {
    name: 'PALMAS LEGACY CAP',
    category: 'ACCESSORIES',
    price: 35,
    originalPrice: 50,
    images: ['https://placehold.co/600x800/1a1a1a/8B5A2B?text=Legacy+Cap'],
    piecesLeft: 25,
    totalPieces: 50,
    description: 'Embroidered cap with Palmas logo. Adjustable fit.',
    sizes: ['One Size'],
    isActive: true
  }
];

// Function to add products
const addSampleProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/palmas');
    console.log('✅ Connected to MongoDB');
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');
    
    // Add new products
    let addedCount = 0;
    for (let product of sampleProducts) {
      const newProduct = new Product(product);
      await newProduct.save();
      console.log(`✅ Added: ${product.name} - $${product.price} (${product.piecesLeft} pieces left)`);
      addedCount++;
    }
    
    console.log(`\n🎉 Successfully added ${addedCount} products!`);
    console.log('\n📋 Products in database:');
    const allProducts = await Product.find({});
    allProducts.forEach(p => {
      console.log(`   - ${p.name}: $${p.price} (${p.piecesLeft}/${p.totalPieces} left)`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Run the function
addSampleProducts();