const Order = require('../models/Order')

const placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, subtotal, shipping, tax, totalPrice } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' })
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      shipping,
      tax,
      totalPrice,
    })

    res.status(201).json({ message: 'Order placed successfully', order })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name image price')
      .sort({ createdAt: -1 })
    res.json({ orders })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name image price')

    if (!order) return res.status(404).json({ message: 'Order not found' })

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' })
    }

    res.json({ order })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 })
    res.json({ orders, total: orders.length })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'Order not found' })

    if (orderStatus)   order.orderStatus   = orderStatus
    if (paymentStatus) order.paymentStatus = paymentStatus

    await order.save()
    res.json({ message: 'Order updated', order })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { placeOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus }
