const Razorpay = require('razorpay')
const crypto   = require('crypto')
const Order    = require('../models/Order')

const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' })
    }

    const keyId     = process.env.RAZORPAY_KEY_ID     || ''
    const keySecret = process.env.RAZORPAY_KEY_SECRET || ''

    if (!keyId || !keySecret) {
      return res.status(500).json({
        message: 'Razorpay keys missing in .env file',
        fix: 'Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to server/.env'
      })
    }

    if (!keyId.startsWith('rzp_test_') && !keyId.startsWith('rzp_live_')) {
      return res.status(500).json({
        message: 'Invalid Razorpay Key ID format',
        received: keyId.substring(0, 12) + '...',
        fix: 'Key must start with rzp_test_ — get it from dashboard.razorpay.com → Settings → API Keys'
      })
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })

    const options = {
      amount:   Math.round(amount * 100),
      currency: 'INR',
      receipt:  `rcpt_${Date.now()}`,
    }

    console.log(`[Razorpay] Creating order: ₹${amount} (${options.amount} paise)`)
    const order = await razorpay.orders.create(options)
    console.log(`[Razorpay] Order created: ${order.id}`)

    res.json({
      success:  true,
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId,
    })

  } catch (err) {
    console.error('[Razorpay] Create order failed:')
    console.error('  message:', err.message)
    console.error('  statusCode:', err.statusCode)
    console.error('  error:', JSON.stringify(err.error || {}))

    const razorpayError = err.error?.description || err.error?.reason || err.message
    res.status(500).json({
      message: 'Payment initiation failed',
      reason:  razorpayError,
      hint:    getHint(err)
    })
  }
}

const getHint = (err) => {
  const msg = (err.message || '').toLowerCase()
  const desc = JSON.stringify(err.error || '').toLowerCase()
  if (msg.includes('unauthorized') || desc.includes('unauthorized'))
    return 'Your Razorpay API keys are wrong or expired. Regenerate them at dashboard.razorpay.com → Settings → API Keys'
  if (msg.includes('network') || msg.includes('econnrefused'))
    return 'Cannot reach Razorpay servers. Check your internet connection.'
  if (msg.includes('key_id'))
    return 'key_id is missing or invalid in .env'
  return 'Restart the server after updating .env, then try again'
}

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
    } = req.body

    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expected !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' })
    }

    const { items, shippingAddress, subtotal, shipping, tax, totalPrice } = orderData

    const order = await Order.create({
      user:              req.user._id,
      items,
      shippingAddress,
      paymentMethod:     'razorpay',
      paymentStatus:     'paid',
      orderStatus:       'confirmed',
      subtotal,
      shipping,
      tax,
      totalPrice,
      razorpayOrderId:   razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    })

    console.log(`[Order] Saved: ${order._id}`)
    res.json({ success: true, orderId: order._id, paymentId: razorpay_payment_id })

  } catch (err) {
    console.error('[Verify] Error:', err.message)
    res.status(500).json({ message: 'Order saving failed', error: err.message })
  }
}

const handleWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!secret) return res.status(200).json({ received: true })

    const sig      = req.headers['x-razorpay-signature']
    const expected = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body)).digest('hex')
    if (sig !== expected) return res.status(400).json({ message: 'Invalid signature' })

    const { event, payload } = req.body
    const paymentId = payload?.payment?.entity?.id

    if (event === 'payment.captured')
      await Order.findOneAndUpdate({ razorpayPaymentId: paymentId }, { paymentStatus: 'paid', orderStatus: 'confirmed' })
    if (event === 'payment.failed')
      await Order.findOneAndUpdate({ razorpayPaymentId: paymentId }, { paymentStatus: 'failed' })

    res.status(200).json({ received: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { createRazorpayOrder, verifyPayment, handleWebhook }
