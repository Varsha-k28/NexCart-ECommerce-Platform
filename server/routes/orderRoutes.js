const express = require('express')
const router = express.Router()
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController')
const { protect, adminOnly } = require('../middleware/authMiddleware')

router.post('/',          protect, placeOrder)
router.get('/my',         protect, getMyOrders)
router.get('/:id',        protect, getOrderById)

router.get('/',           protect, adminOnly, getAllOrders)
router.put('/:id/status', protect, adminOnly, updateOrderStatus)

module.exports = router
