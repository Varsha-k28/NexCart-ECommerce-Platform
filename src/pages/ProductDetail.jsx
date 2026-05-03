import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getDummyProductById, getDummyByCategory } from '../services/dummyApi'
import ProductCard from '../components/ProductCard/ProductCard'
import './ProductDetail.css'

const ProductDetail = () => {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const { addToCart } = useCart()

  const [product,    setProduct]    = useState(null)
  const [related,    setRelated]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [quantity,   setQuantity]   = useState(1)
  const [added,      setAdded]      = useState(false)
  const [activeTab,  setActiveTab]  = useState('description')
  const [activeImg,  setActiveImg]  = useState(0)

  useEffect(() => {
    setLoading(true)
    setAdded(false)
    setQuantity(1)
    setActiveImg(0)
    setProduct(null)

    getDummyProductById(id)
      .then(p => {
        setProduct(p)
        setLoading(false)
        return getDummyByCategory(p.category)
      })
      .then(list => setRelated(list.filter(p => p.id !== Number(id)).slice(0, 4)))
      .catch(() => setLoading(false))
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    for (let i = 0; i < quantity; i++) addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    navigate('/cart')
  }

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <i key={i} className={`fas fa-star ${i < Math.floor(rating) ? 'star--filled' : i < rating ? 'star--half' : 'star--empty'}`}></i>
    ))

  if (loading) {
    return (
      <div className="product-detail">
        <div className="container product-detail__grid" style={{ paddingTop: '48px' }}>
          <div className="skeleton" style={{ aspectRatio: '1', borderRadius: '20px' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
            {[60, 90, 40, 100, 80, 100].map((w, i) => (
              <div key={i} className="skeleton" style={{ width: `${w}%`, height: i === 0 ? '12px' : i === 1 ? '28px' : i === 3 ? '80px' : '18px', borderRadius: '8px' }}></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="not-found">
        <i className="fas fa-box-open"></i>
        <h2>Product not found</h2>
        <Link to="/products" className="btn-primary">Back to Products</Link>
      </div>
    )
  }

  const images = product.images?.length > 0 ? product.images : [product.image]

  return (
    <div className="product-detail">
      <div className="breadcrumb">
        <div className="container breadcrumb__inner">
          <Link to="/">Home</Link>
          <i className="fas fa-chevron-right"></i>
          <Link to="/products">Products</Link>
          <i className="fas fa-chevron-right"></i>
          <span>{product.name}</span>
        </div>
      </div>

      <div className="container product-detail__grid">
        <div className="product-detail__images">
          <div className="product-detail__img-main">
            <img src={images[activeImg]} alt={product.name} />
            {product.label && <span className="product-detail__label">{product.label}</span>}
          </div>
          {images.length > 1 && (
            <div className="product-detail__thumbnails">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`product-detail__thumb ${activeImg === i ? 'product-detail__thumb--active' : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-detail__info">
          <span className="product-detail__category">
            <i className="fas fa-tag"></i> {product.category}
          </span>
          {product.brand && (
            <span className="product-detail__brand">{product.brand}</span>
          )}
          <h1 className="product-detail__name">{product.name}</h1>

          <div className="product-detail__rating">
            <div className="product-detail__stars">{renderStars(product.rating)}</div>
            <span>{product.rating} ({product.reviews} in stock)</span>
          </div>

          <div className="product-detail__price-row">
            <span className="product-detail__price">₹{product.price.toLocaleString()}</span>
            <span className="product-detail__original">₹{product.originalPrice.toLocaleString()}</span>
            <span className="product-detail__discount">{product.discount}% OFF</span>
          </div>

          <p className="product-detail__desc">{product.description}</p>

          <div className="product-detail__qty">
            <span>Quantity:</span>
            <div className="qty-control">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                <i className="fas fa-minus"></i>
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}>
                <i className="fas fa-plus"></i>
              </button>
            </div>
          </div>

          <div className="product-detail__actions">
            <button
              className={`btn-primary ${added ? 'btn-added' : ''}`}
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              {added
                ? <><i className="fas fa-check"></i> Added!</>
                : <><i className="fas fa-cart-plus"></i> Add to Cart</>
              }
            </button>
            <button className="btn-outline" onClick={handleBuyNow} disabled={!product.inStock}>
              <i className="fas fa-bolt"></i> Buy Now
            </button>
          </div>

          {!product.inStock && (
            <p className="product-detail__out-of-stock">
              <i className="fas fa-exclamation-circle"></i> Currently out of stock
            </p>
          )}

          <div className="product-detail__meta">
            <span><i className="fas fa-truck"></i> Free delivery on orders above ₹999</span>
            <span><i className="fas fa-undo"></i> 30-day easy returns</span>
            <span><i className="fas fa-shield-alt"></i> Secure payment</span>
          </div>
        </div>
      </div>

      <div className="container product-detail__tabs-section">
        <div className="tabs">
          {['description', 'reviews', 'shipping'].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'tab-btn--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="tab-content">
          {activeTab === 'description' && <p>{product.description}</p>}
          {activeTab === 'reviews' && (
            <div className="reviews-placeholder">
              <i className="fas fa-star"></i>
              <p>Rating: <strong>{product.rating}/5</strong> — {product.reviews} units in stock</p>
            </div>
          )}
          {activeTab === 'shipping' && (
            <ul className="shipping-info">
              <li><i className="fas fa-check"></i> Standard delivery: 3–5 business days</li>
              <li><i className="fas fa-check"></i> Express delivery: 1–2 business days</li>
              <li><i className="fas fa-check"></i> Free shipping on orders above ₹999</li>
              <li><i className="fas fa-check"></i> Cash on delivery available</li>
            </ul>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="container product-detail__related">
          <h2 className="section-title">Related Products</h2>
          <p className="section-subtitle">More from {product.category}</p>
          <div className="related-grid">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail
