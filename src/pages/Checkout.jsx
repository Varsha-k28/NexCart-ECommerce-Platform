import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { createRazorpayOrder, verifyRazorpayPayment, placeOrder } from '../services/api'
import UPIModal from '../components/UPIModal/UPIModal'
import './Checkout.css'

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true)
    const script = document.createElement('script')
    script.id      = 'razorpay-script'
    script.src     = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload  = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart()
  const { user }   = useAuth()
  const navigate   = useNavigate()

  const [step,          setStep]          = useState(1)
  const [form,          setForm]          = useState({
    name: user?.name || '', email: user?.email || '',
    phone: '', address: '', city: '', pincode: '', state: '',
  })
  const [errors,        setErrors]        = useState({})
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [loading,       setLoading]       = useState(false)
  const [orderSuccess,  setOrderSuccess]  = useState(null)
  const [showUPIModal,  setShowUPIModal]  = useState(false)

  const shipping   = totalPrice >= 999 ? 0 : 99
  const tax        = Math.round(totalPrice * 0.18)
  const grandTotal = totalPrice + shipping + tax

  const validate = () => {
    const e = {}
    if (!form.name.trim())                                  e.name    = 'Name is required'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))   e.email   = 'Valid email required'
    if (!form.phone.match(/^\d{10}$/))                      e.phone   = '10-digit phone required'
    if (!form.address.trim())                               e.address = 'Address is required'
    if (!form.city.trim())                                  e.city    = 'City is required'
    if (!form.pincode.match(/^\d{6}$/))                     e.pincode = '6-digit pincode required'
    if (!form.state.trim())                                 e.state   = 'State is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(er => ({ ...er, [e.target.name]: '' }))
  }

  const buildOrderData = () => ({
    items: items.map(i => ({
      product:  i.id,
      name:     i.name,
      image:    i.image,
      price:    i.price,
      quantity: i.quantity,
    })),
    shippingAddress: {
      name: form.name, email: form.email, phone: form.phone,
      address: form.address, city: form.city, state: form.state, pincode: form.pincode,
    },
    subtotal: totalPrice, shipping, tax, totalPrice: grandTotal,
  })

  const handleRazorpayPayment = async () => {
    const token = localStorage.getItem('token')
    if (!token) { alert('Please login first.'); navigate('/login'); return }

    setLoading(true)
    try {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) { alert('Failed to load Razorpay.'); setLoading(false); return }

      const { data } = await createRazorpayOrder(grandTotal)

      const options = {
        key:         data.keyId,
        amount:      data.amount,
        currency:    data.currency,
        name:        'NexCart',
        description: 'Order Payment',
        order_id:    data.orderId,
        prefill: {
          name:    form.name,
          email:   form.email,
          contact: form.phone.replace(/\D/g, '').slice(-10),
        },
        method: { upi: true, card: true, netbanking: true, wallet: true, emi: false },
        theme:  { color: '#6c63ff' },
        handler: async (response) => {
          try {
            const verifyRes = await verifyRazorpayPayment({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              orderData:           buildOrderData(),
            })
            if (verifyRes.data.success) {
              clearCart()
              setOrderSuccess({ orderId: verifyRes.data.orderId, paymentId: response.razorpay_payment_id })
              setStep(3)
            }
          } catch {
            alert('Payment verified but order saving failed.')
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (r) => { alert(`Payment failed: ${r.error.description}`); setLoading(false) })
      rzp.open()
    } catch (err) {
      alert(err.response?.data?.message || 'Payment initiation failed')
      setLoading(false)
    }
  }

  const handleCOD = async () => {
    setLoading(true)
    try {
      await placeOrder({ ...buildOrderData(), paymentMethod: 'cod' })
      clearCart()
      setOrderSuccess({ orderId: `COD-${Date.now()}`, paymentId: null })
      setStep(3)
    } catch (err) {
      alert(err.response?.data?.message || 'Order placement failed')
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceOrder = () => {
    if (paymentMethod === 'cod')       handleCOD()
    else if (paymentMethod === 'upi')  setShowUPIModal(true)
    else                               handleRazorpayPayment()
  }

  const handleUPISuccess = async () => {
    setShowUPIModal(false)
    setLoading(true)
    try {
      await placeOrder({ ...buildOrderData(), paymentMethod: 'upi' })
      clearCart()
      setOrderSuccess({ orderId: `UPI-${Date.now()}`, paymentId: `upi_sim_${Date.now()}` })
      setStep(3)
    } catch (err) {
      alert(err.response?.data?.message || 'Order saving failed')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0 && step !== 3) { navigate('/cart'); return null }

  const isLoggedIn = !!localStorage.getItem('token')

  if (step === 3) {
    return (
      <div className="checkout-success">
        <div className="checkout-success__card">
          <div className="checkout-success__icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <h2>Order Placed Successfully!</h2>
          <p>Thank you for shopping with NexCart. You'll receive a confirmation email shortly.</p>
          <div className="checkout-success__details">
            <div className="checkout-success__row">
              <span>Order ID</span>
              <strong>#{String(orderSuccess?.orderId).slice(-8).toUpperCase()}</strong>
            </div>
            {orderSuccess?.paymentId && (
              <div className="checkout-success__row">
                <span>Payment ID</span>
                <strong>{orderSuccess.paymentId}</strong>
              </div>
            )}
            <div className="checkout-success__row">
              <span>Amount Paid</span>
              <strong className="checkout-success__amount">₹{grandTotal.toLocaleString()}</strong>
            </div>
            <div className="checkout-success__row">
              <span>Payment</span>
              <strong className={`checkout-success__badge ${paymentMethod === 'cod' ? 'badge--cod' : 'badge--paid'}`}>
                {paymentMethod === 'cod'          ? 'Cash on Delivery'
                 : paymentMethod === 'upi'        ? '✅ Paid via UPI'
                 : paymentMethod === 'card'       ? '✅ Paid via Card'
                 : paymentMethod === 'netbanking' ? '✅ Paid via Net Banking'
                 : '✅ Paid via Razorpay'}
              </strong>
            </div>
          </div>
          <button className="btn-primary checkout-success__btn" onClick={() => navigate('/')}>
            <i className="fas fa-home"></i> Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      {showUPIModal && (
        <UPIModal amount={grandTotal} onSuccess={handleUPISuccess} onClose={() => setShowUPIModal(false)} />
      )}

      <div className="checkout-page__hero">
        <div className="container">
          <h1><i className="fas fa-lock"></i> Secure Checkout</h1>
        </div>
      </div>

      {!isLoggedIn && (
        <div className="container">
          <div className="checkout-login-warning">
            <i className="fas fa-exclamation-triangle"></i>
            <span>You need to <strong>login</strong> before making a payment.</span>
            <button className="btn-primary" onClick={() => navigate('/login')}>
              <i className="fas fa-sign-in-alt"></i> Login Now
            </button>
          </div>
        </div>
      )}

      <div className="container checkout-steps">
        {['Delivery Details', 'Payment', 'Confirmation'].map((s, i) => (
          <div key={s} className={`checkout-step ${step > i + 1 ? 'checkout-step--done' : ''} ${step === i + 1 ? 'checkout-step--active' : ''}`}>
            <div className="checkout-step__num">
              {step > i + 1 ? <i className="fas fa-check"></i> : i + 1}
            </div>
            <span>{s}</span>
          </div>
        ))}
      </div>

      <div className="container checkout-layout">
        <div className="checkout-form-section">

          {step === 1 && (
            <div className="checkout-card">
              <h3><i className="fas fa-map-marker-alt"></i> Delivery Details</h3>
              <div className="checkout-form">
                <div className="form-row">
                  <div className={`form-group ${errors.name ? 'form-group--error' : ''}`}>
                    <label>Full Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" />
                    {errors.name && <span className="form-error">{errors.name}</span>}
                  </div>
                  <div className={`form-group ${errors.email ? 'form-group--error' : ''}`}>
                    <label>Email *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" />
                    {errors.email && <span className="form-error">{errors.email}</span>}
                  </div>
                </div>
                <div className="form-row">
                  <div className={`form-group ${errors.phone ? 'form-group--error' : ''}`}>
                    <label>Phone *</label>
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" maxLength={10} />
                    {errors.phone && <span className="form-error">{errors.phone}</span>}
                  </div>
                  <div className={`form-group ${errors.pincode ? 'form-group--error' : ''}`}>
                    <label>Pincode *</label>
                    <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="575001" maxLength={6} />
                    {errors.pincode && <span className="form-error">{errors.pincode}</span>}
                  </div>
                </div>
                <div className={`form-group ${errors.address ? 'form-group--error' : ''}`}>
                  <label>Address *</label>
                  <input name="address" value={form.address} onChange={handleChange} placeholder="House No, Street, Area" />
                  {errors.address && <span className="form-error">{errors.address}</span>}
                </div>
                <div className="form-row">
                  <div className={`form-group ${errors.city ? 'form-group--error' : ''}`}>
                    <label>City *</label>
                    <input name="city" value={form.city} onChange={handleChange} placeholder="Mangalore" />
                    {errors.city && <span className="form-error">{errors.city}</span>}
                  </div>
                  <div className={`form-group ${errors.state ? 'form-group--error' : ''}`}>
                    <label>State *</label>
                    <input name="state" value={form.state} onChange={handleChange} placeholder="Karnataka" />
                    {errors.state && <span className="form-error">{errors.state}</span>}
                  </div>
                </div>
                <button className="btn-primary checkout-next-btn" onClick={() => { if (validate()) setStep(2) }}>
                  Continue to Payment <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="checkout-card">
              <h3><i className="fas fa-credit-card"></i> Choose Payment Method</h3>

              <div className="payment-methods">
                <label className={`payment-method ${paymentMethod === 'upi' ? 'payment-method--active' : ''}`}>
                  <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} />
                  <div className="payment-method__icon upi-icon">
                    <i className="fas fa-mobile-alt" style={{ color: '#6c63ff', fontSize: '1.2rem' }}></i>
                  </div>
                  <div className="payment-method__info">
                    <strong>UPI / GPay / PhonePe</strong>
                    <span>Pay using any UPI app instantly</span>
                  </div>
                  <div className="payment-method__app-icons">
                    <span className="pm-app-icon pm-app-icon--gpay"><i className="fab fa-google"></i></span>
                    <span className="pm-app-icon pm-app-icon--phonepe"><i className="fas fa-mobile-alt"></i></span>
                    <span className="pm-app-icon pm-app-icon--paytm"><i className="fas fa-wallet"></i></span>
                  </div>
                  {paymentMethod === 'upi' && <i className="fas fa-check-circle payment-method__check"></i>}
                </label>

                <label className={`payment-method ${paymentMethod === 'card' ? 'payment-method--active' : ''}`}>
                  <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                  <div className="payment-method__icon razorpay-icon">
                    <i className="fas fa-credit-card"></i>
                  </div>
                  <div className="payment-method__info">
                    <strong>Credit / Debit Card</strong>
                    <span>Visa · Mastercard · RuPay</span>
                  </div>
                  <div className="payment-method__logos">
                    <i className="fab fa-cc-visa"></i>
                    <i className="fab fa-cc-mastercard"></i>
                  </div>
                  {paymentMethod === 'card' && <i className="fas fa-check-circle payment-method__check"></i>}
                </label>

                <label className={`payment-method ${paymentMethod === 'netbanking' ? 'payment-method--active' : ''}`}>
                  <input type="radio" name="payment" value="netbanking" checked={paymentMethod === 'netbanking'} onChange={() => setPaymentMethod('netbanking')} />
                  <div className="payment-method__icon netbanking-icon">
                    <i className="fas fa-university"></i>
                  </div>
                  <div className="payment-method__info">
                    <strong>Net Banking</strong>
                    <span>All major Indian banks supported</span>
                  </div>
                  {paymentMethod === 'netbanking' && <i className="fas fa-check-circle payment-method__check"></i>}
                </label>

                <label className={`payment-method ${paymentMethod === 'cod' ? 'payment-method--active' : ''}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                  <div className="payment-method__icon cod-icon">
                    <i className="fas fa-money-bill-wave"></i>
                  </div>
                  <div className="payment-method__info">
                    <strong>Cash on Delivery</strong>
                    <span>Pay when your order arrives</span>
                  </div>
                  {paymentMethod === 'cod' && <i className="fas fa-check-circle payment-method__check"></i>}
                </label>
              </div>

              {(paymentMethod === 'upi' || paymentMethod === 'card' || paymentMethod === 'netbanking') && (
                <div className="razorpay-info">
                  <i className="fas fa-shield-alt"></i>
                  <div>
                    <strong>Secured by Razorpay</strong>
                    <p>
                      {paymentMethod === 'upi'       && 'Scan QR or enter UPI ID. Works with GPay, PhonePe, Paytm & all UPI apps.'}
                      {paymentMethod === 'card'       && 'Your card details are encrypted. We never store card information.'}
                      {paymentMethod === 'netbanking' && "You will be redirected to your bank's secure page to complete payment."}
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="cod-info">
                  <i className="fas fa-info-circle"></i>
                  <p>Pay in cash when your order is delivered. Available for orders up to ₹10,000.</p>
                </div>
              )}

              <div className="checkout-payment-actions">
                <button className="btn-outline" onClick={() => setStep(1)}>
                  <i className="fas fa-arrow-left"></i> Back
                </button>
                <button className={`btn-primary ${loading ? 'btn-loading' : ''}`} onClick={handlePlaceOrder} disabled={loading}>
                  {loading                          ? <><i className="fas fa-spinner fa-spin"></i> Processing...</>
                   : paymentMethod === 'cod'        ? <><i className="fas fa-check"></i> Place Order (COD)</>
                   : paymentMethod === 'upi'        ? <><i className="fas fa-mobile-alt"></i> Pay ₹{grandTotal.toLocaleString()} via UPI</>
                   :                                  <><i className="fas fa-lock"></i> Pay ₹{grandTotal.toLocaleString()}</>}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="checkout-summary">
          <h3>Order Summary</h3>
          <div className="checkout-summary__items">
            {items.map(item => (
              <div key={item.id} className="checkout-summary__item">
                <img src={item.image} alt={item.name} />
                <div>
                  <p>{item.name}</p>
                  <span>Qty: {item.quantity}</span>
                </div>
                <strong>₹{(item.price * item.quantity).toLocaleString()}</strong>
              </div>
            ))}
          </div>
          <div className="checkout-summary__totals">
            <div className="checkout-summary__row">
              <span>Subtotal</span><span>₹{totalPrice.toLocaleString()}</span>
            </div>
            <div className="checkout-summary__row">
              <span>Shipping</span>
              <span className={shipping === 0 ? 'free' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
            </div>
            <div className="checkout-summary__row">
              <span>GST (18%)</span><span>₹{tax.toLocaleString()}</span>
            </div>
            <div className="checkout-summary__grand">
              <span>Total</span><span>₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>
          <div className="checkout-summary__secure">
            <i className="fas fa-lock"></i>
            <span>Secured by Razorpay</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
