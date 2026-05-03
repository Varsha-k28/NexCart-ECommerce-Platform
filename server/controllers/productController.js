const Product = require('../models/Product')

const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 20 } = req.query

    const query = {}

    if (search) {
      query.$or = [
        { name:     { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ]
    }

    if (category && category !== 'All') {
      query.category = category
    }

    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }

    let sortOption = {}
    switch (sort) {
      case 'price-asc':  sortOption = { price: 1 };    break
      case 'price-desc': sortOption = { price: -1 };   break
      case 'rating':     sortOption = { rating: -1 };  break
      case 'discount':   sortOption = { discount: -1 }; break
      default:           sortOption = { createdAt: -1 }
    }

    const skip = (Number(page) - 1) * Number(limit)
    const total = await Product.countDocuments(query)
    const products = await Product.find(query).sort(sortOption).skip(skip).limit(Number(limit))

    res.json({
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json({ product })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body)
    res.status(201).json({ message: 'Product created', product })
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message)
      return res.status(400).json({ message: messages[0] })
    }
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json({ message: 'Product updated', product })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json({ message: 'Product deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category')
    res.json({ categories })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getCategories }
