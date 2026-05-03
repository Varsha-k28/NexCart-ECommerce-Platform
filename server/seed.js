const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Product = require('./models/Product')

dotenv.config()

const sampleProducts = [
  {
    name: 'Classic White Sneakers',
    category: 'Footwear',
    price: 2499,
    originalPrice: 3499,
    discount: 29,
    rating: 4.5,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    label: 'New',
    description: 'Premium quality white sneakers with cushioned sole and breathable mesh upper. Perfect for everyday casual wear.',
    inStock: true,
    stock: 50,
  },
  {
    name: 'Slim Fit Denim Jacket',
    category: 'Clothing',
    price: 1899,
    originalPrice: 2999,
    discount: 37,
    rating: 4.3,
    reviews: 95,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80',
    label: '-37%',
    description: 'Stylish slim-fit denim jacket with classic button closure. Versatile piece for any wardrobe.',
    inStock: true,
    stock: 30,
  },
  {
    name: 'Leather Crossbody Bag',
    category: 'Accessories',
    price: 3299,
    originalPrice: 4500,
    discount: 27,
    rating: 4.7,
    reviews: 214,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
    label: 'Hot',
    description: 'Genuine leather crossbody bag with adjustable strap and multiple compartments.',
    inStock: true,
    stock: 20,
  },
  {
    name: 'Oversized Graphic Tee',
    category: 'Clothing',
    price: 799,
    originalPrice: 1199,
    discount: 33,
    rating: 4.1,
    reviews: 67,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
    label: 'New',
    description: 'Comfortable oversized tee with unique graphic print. Made from 100% organic cotton.',
    inStock: true,
    stock: 80,
  },
  {
    name: 'Minimalist Watch',
    category: 'Accessories',
    price: 4999,
    originalPrice: 7999,
    discount: 38,
    rating: 4.8,
    reviews: 302,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
    label: '-38%',
    description: 'Elegant minimalist watch with stainless steel case and genuine leather strap. Water resistant up to 30m.',
    inStock: true,
    stock: 15,
  },
  {
    name: 'Running Shorts',
    category: 'Sportswear',
    price: 699,
    originalPrice: 999,
    discount: 30,
    rating: 4.2,
    reviews: 88,
    image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80',
    label: 'Sale',
    description: 'Lightweight running shorts with moisture-wicking fabric and built-in liner.',
    inStock: true,
    stock: 60,
  },
  {
    name: 'Polarized Sunglasses',
    category: 'Accessories',
    price: 1299,
    originalPrice: 1999,
    discount: 35,
    rating: 4.4,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80',
    label: 'New',
    description: 'UV400 polarized sunglasses with lightweight frame. Protects eyes while keeping you stylish.',
    inStock: false,
    stock: 0,
  },
  {
    name: 'Hoodie Sweatshirt',
    category: 'Clothing',
    price: 1599,
    originalPrice: 2299,
    discount: 30,
    rating: 4.6,
    reviews: 189,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=80',
    label: '-30%',
    description: 'Cozy pullover hoodie with kangaroo pocket and adjustable drawstring.',
    inStock: true,
    stock: 45,
  },
]

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB connected')

    await Product.deleteMany()
    console.log('🗑️  Existing products cleared')

    const inserted = await Product.insertMany(sampleProducts)
    console.log(`✅ ${inserted.length} products seeded successfully`)

    mongoose.disconnect()
    console.log('🔌 MongoDB disconnected')
    process.exit(0)
  } catch (err) {
    console.error('❌ Seed failed:', err.message)
    process.exit(1)
  }
}

seedDB()
