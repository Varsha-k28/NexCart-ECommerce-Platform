import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <i className="fas fa-shopping-bag"></i> NexCart
          </Link>
          <p>Your one-stop destination for modern fashion and lifestyle products. Quality you can trust, prices you'll love.</p>
          <div className="footer__socials">
            {['facebook-f', 'instagram', 'twitter', 'youtube'].map(icon => (
              <a key={icon} href="#" className="footer__social-link" aria-label={icon}>
                <i className={`fab fa-${icon}`}></i>
              </a>
            ))}
          </div>
        </div>

        <div className="footer__col">
          <h4>Quick Links</h4>
          <ul>
            {[
              { label: 'Home', path: '/' },
              { label: 'Products', path: '/products' },
              { label: 'Cart', path: '/cart' },
              { label: 'Login', path: '/login' },
            ].map(link => (
              <li key={link.path}>
                <Link to={link.path}><i className="fas fa-chevron-right"></i> {link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h4>Contact Us</h4>
          <ul className="footer__contact">
            <li><i className="fas fa-map-marker-alt"></i> Mangalore, Karnataka, India</li>
            <li><i className="fas fa-phone"></i> +91 93533 62201</li>
            <li><i className="fas fa-envelope"></i> support@nexcart.in</li>
            <li><i className="fas fa-clock"></i> Mon–Sat: 9AM – 6PM</li>
          </ul>
        </div>

        <div className="footer__col">
          <h4>Newsletter</h4>
          <p>Subscribe to get exclusive deals and updates.</p>
          <form className="footer__subscribe" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="Your email address" required />
            <button type="submit"><i className="fas fa-paper-plane"></i></button>
          </form>
          <div className="footer__badges">
            <span><i className="fas fa-shield-alt"></i> Secure Payments</span>
            <span><i className="fas fa-undo"></i> Easy Returns</span>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© 2025 NexCart. All rights reserved.</p>
          <div className="footer__payment-icons">
            {['cc-visa', 'cc-mastercard', 'cc-paypal', 'cc-stripe'].map(icon => (
              <i key={icon} className={`fab fa-${icon}`}></i>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
