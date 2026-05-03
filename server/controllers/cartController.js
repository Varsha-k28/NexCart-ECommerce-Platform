const Cart = require('../models/Cart')

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId })
  if (!cart) cart = await Cart.create({ user: userId, items: [] })
  return cart
}

const formatCart = (cart) => ({
  items:      cart.items,
  totalItems: cart.items.reduce((s, i) => s + i.quantity, 0),
  totalPrice: cart.items.reduce((s, i) => s + i.price * i.quantity, 0),
})

const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id)
    res.json(formatCart(cart))
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const addToCart = async (req, res) => {
  try {
    const { productId, name, price, originalPrice, discount, image, category, quantity = 1 } = req.body

    if (!productId || !name || !price)
      return res.status(400).json({ message: 'productId, name and price are required' })

    const cart = await getOrCreateCart(req.user._id)
    const existing = cart.items.find(i => i.productId === String(productId))

    if (existing) {
      existing.quantity += quantity
    } else {
      cart.items.push({
        productId: String(productId),
        name, price, originalPrice, discount, image, category, quantity,
      })
    }

    await cart.save()
    res.json({ message: 'Added to cart', ...formatCart(cart) })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body

    if (!productId || quantity < 1)
      return res.status(400).json({ message: 'productId and quantity >= 1 required' })

    const cart = await getOrCreateCart(req.user._id)
    const item = cart.items.find(i => i.productId === String(productId))

    if (!item)
      return res.status(404).json({ message: 'Item not in cart' })

    item.quantity = quantity
    await cart.save()
    res.json({ message: 'Cart updated', ...formatCart(cart) })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params
    const cart = await getOrCreateCart(req.user._id)
    cart.items = cart.items.filter(i => i.productId !== String(productId))
    await cart.save()
    res.json({ message: 'Item removed', ...formatCart(cart) })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id)
    cart.items = []
    await cart.save()
    res.json({ message: 'Cart cleared', items: [], totalItems: 0, totalPrice: 0 })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart }
