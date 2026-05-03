import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './Cart.css'

const Cart = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty__icon">
          <i className="fas fa-shopping-cart"></i>
        </div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn-primary">
          <i className="fas fa-shopping-bag"></i> Start Shopping
        </Link>
      </div>
    )
  }

  const shipping = totalPrice >= 999 ? 0 : 99
  const tax = Math.round(totalPrice * 0.18)
  const grandTotal = totalPrice + shipping + tax

  return (
    <div className="cart-page">
      <div className="cart-page__hero">
        <div className="container">
          <h1><i className="fas fa-shopping-cart"></i> Your Cart</h1>
          <p>{items.length} item{items.length > 1 ? 's' : ''} in your cart</p>
        </div>
      </div>

      <div className="container cart-page__layout">
        <div className="cart-items">
          <div className="cart-items__header">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Total</span>
            <span></span>
          </div>

          {items.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item__product">
                <img src={item.image} alt={item.name} />
                <div>
                  <h4>{item.name}</h4>
                  <span>{item.category}</span>
                </div>
              </div>
              <div className="cart-item__price">₹{item.price.toLocaleString()}</div>
              <div className="cart-item__qty">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                  <i className="fas fa-minus"></i>
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              <div className="cart-item__total">
                ₹{(item.price * item.quantity).toLocaleString()}
              </div>
              <button
                className="cart-item__remove"
                onClick={() => removeFromCart(item.id)}
                aria-label="Remove"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          ))}

          <div className="cart-items__footer">
            <button className="cart-clear-btn" onClick={clearCart}>
              <i className="fas fa-trash"></i> Clear Cart
            </button>
            <Link to="/products" className="btn-outline">
              <i className="fas fa-arrow-left"></i> Continue Shopping
            </Link>
          </div>
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>

          <div className="cart-summary__rows">
            <div className="cart-summary__row">
              <span>Subtotal</span>
              <span>₹{totalPrice.toLocaleString()}</span>
            </div>
            <div className="cart-summary__row">
              <span>Shipping</span>
              <span className={shipping === 0 ? 'cart-summary__free' : ''}>
                {shipping === 0 ? 'FREE' : `₹${shipping}`}
              </span>
            </div>
            <div className="cart-summary__row">
              <span>GST (18%)</span>
              <span>₹{tax.toLocaleString()}</span>
            </div>
            {shipping > 0 && (
              <p className="cart-summary__shipping-note">
                <i className="fas fa-info-circle"></i>
                Add ₹{(999 - totalPrice).toLocaleString()} more for free shipping
              </p>
            )}
          </div>

          <div className="cart-summary__total">
            <span>Grand Total</span>
            <span>₹{grandTotal.toLocaleString()}</span>
          </div>

          <button
            className="btn-primary cart-summary__checkout"
            onClick={() => navigate('/checkout')}
          >
            <i className="fas fa-lock"></i> Proceed to Checkout
          </button>

          <div className="cart-summary__secure">
            <i className="fas fa-shield-alt"></i>
            <span>Secure & encrypted checkout</span>
          </div>

          <div className="cart-summary__payment-icons">
            <i className="fab fa-cc-visa"></i>
            <i className="fab fa-cc-mastercard"></i>
            <i className="fab fa-cc-paypal"></i>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
