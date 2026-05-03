const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
  product:  { type: String, default: '' },
  name:     { type: String, required: true },
  image:    { type: String, required: true },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
})

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      name:    { type: String, required: true },
      email:   { type: String, required: true },
      phone:   { type: String, required: true },
      address: { type: String, required: true },
      city:    { type: String, required: true },
      state:   { type: String, required: true },
      pincode: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'cod', 'netbanking', 'razorpay'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
    },
    subtotal:   { type: Number, required: true },
    shipping:   { type: Number, default: 0 },
    tax:        { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },

    razorpayOrderId:   { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Order', orderSchema)
