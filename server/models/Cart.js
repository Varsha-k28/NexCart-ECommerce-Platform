const mongoose = require('mongoose')

const cartItemSchema = new mongoose.Schema({
  productId:    { type: String,  required: true },
  name:         { type: String,  required: true },
  price:        { type: Number,  required: true },
  originalPrice:{ type: Number,  default: 0 },
  discount:     { type: Number,  default: 0 },
  image:        { type: String,  default: '' },
  category:     { type: String,  default: '' },
  quantity:     { type: Number,  required: true, min: 1, default: 1 },
}, { _id: false })

const cartSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      unique:   true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
)

cartSchema.virtual('totalPrice').get(function () {
  return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
})

cartSchema.virtual('totalItems').get(function () {
  return this.items.reduce((sum, i) => sum + i.quantity, 0)
})

module.exports = mongoose.model('Cart', cartSchema)
