import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import './ProductCard.css'

const ProductCard = ({ product }) => {
  const { addToCart } = useCart()
  const [wishlisted, setWishlisted] = useState(false)
  const [added,      setAdded]      = useState(false)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!product.inStock) return

    const success = await addToCart(product)
    if (success) {
      setAdded(true)
      setTimeout(() => setAdded(false), 1500)
    }
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setWishlisted(w => !w)
  }

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <i key={i} className={`fas fa-star ${
        i < Math.floor(rating) ? 'star--filled'
        : i < rating           ? 'star--half'
        : 'star--empty'
      }`}></i>
    ))

  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-card__img-wrap">
        <img src={product.image} alt={product.name} loading="lazy" />

        {product.label && (
          <span className={`product-card__label ${
            product.label.startsWith('-') ? 'product-card__label--discount' : 'product-card__label--new'
          }`}>
            {product.label}
          </span>
        )}

        {!product.inStock && (
          <div className="product-card__out-of-stock">Out of Stock</div>
        )}

        <button
          className={`product-card__wishlist ${wishlisted ? 'product-card__wishlist--active' : ''}`}
          onClick={handleWishlist}
          aria-label="Add to wishlist"
        >
          <i className={wishlisted ? 'fas fa-heart' : 'far fa-heart'}></i>
        </button>
      </div>

      <div className="product-card__info">
        <span className="product-card__category">{product.category}</span>
        <h3 className="product-card__name">{product.name}</h3>

        <div className="product-card__rating">
          <div className="product-card__stars">{renderStars(product.rating)}</div>
          <span className="product-card__reviews">({product.reviews})</span>
        </div>

        <div className="product-card__price-row">
          <span className="product-card__price">₹{product.price.toLocaleString()}</span>
          <span className="product-card__original">₹{product.originalPrice?.toLocaleString()}</span>
          <span className="product-card__discount">{product.discount}% off</span>
        </div>

        <button
          className={`product-card__add-btn ${added ? 'product-card__add-btn--added' : ''} ${!product.inStock ? 'product-card__add-btn--disabled' : ''}`}
          onClick={handleAddToCart}
          disabled={!product.inStock}
          aria-label={added ? 'Added to cart' : 'Add to cart'}
        >
          {added
            ? <><i className="fas fa-check"></i><span>Added!</span></>
            : <><i className="fas fa-cart-plus"></i><span>Add to Cart</span></>
          }
        </button>
      </div>
    </Link>
  )
}

export default ProductCard
