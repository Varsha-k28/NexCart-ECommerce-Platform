import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard/ProductCard'
import { getDummyProducts } from '../services/dummyApi'
import { blogPosts } from '../data/products'
import './Home.css'

const Hero = () => (
  <section className="hero">
    <div className="hero__bg-shapes">
      <div className="hero__shape hero__shape--1"></div>
      <div className="hero__shape hero__shape--2"></div>
    </div>
    <div className="container hero__inner">
      <div className="hero__text fade-in-up">
        <span className="hero__badge"><i className="fas fa-bolt"></i> Big Sale Event</span>
        <h1 className="hero__heading">
          Shop the <span className="hero__heading--accent">Latest</span><br />
          Trends Online
        </h1>
        <p className="hero__sub">
          Discover thousands of products at unbeatable prices.<br />
          Up to <strong>50% OFF</strong> on top brands — limited time only!
        </p>
        <div className="hero__actions">
          <Link to="/products" className="btn-primary">
            <i className="fas fa-shopping-bag"></i> Shop Now
          </Link>
          <Link to="/products" className="btn-outline">View Collection</Link>
        </div>
        <div className="hero__stats">
          {[
            { value: '100+', label: 'Products' },
            { value: '50K+', label: 'Customers' },
            { value: '4.8★', label: 'Rating' },
          ].map(s => (
            <div key={s.label} className="hero__stat">
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="hero__image fade-in">
        <div className="hero__img-card">
          <img
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80"
            alt="Shopping"
          />
          <div className="hero__img-badge">
            <i className="fas fa-tag"></i>
            <div>
              <strong>50% OFF</strong>
              <span>Today only</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
)

const features = [
  { icon: 'fas fa-truck',       title: 'Free Shipping',   desc: 'On all orders above ₹999' },
  { icon: 'fas fa-headset',     title: '24/7 Support',    desc: 'Dedicated customer service' },
  { icon: 'fas fa-undo-alt',    title: 'Easy Returns',    desc: '30-day hassle-free returns' },
  { icon: 'fas fa-shield-alt',  title: 'Secure Payment',  desc: '100% secure transactions' },
]

const Features = () => (
  <section className="features">
    <div className="container features__grid">
      {features.map(f => (
        <div key={f.title} className="feature-card">
          <div className="feature-card__icon"><i className={f.icon}></i></div>
          <div>
            <h4>{f.title}</h4>
            <p>{f.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
)

const NewArrivals = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    getDummyProducts()
      .then(data => { setProducts(data.slice(0, 8)); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">New Arrivals</h2>
        <p className="section-subtitle">
          Live products from <strong>DummyJSON API</strong> — prices in INR
        </p>

        {loading ? (
          <div className="home-skeleton-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton skeleton-img"></div>
                <div className="skeleton-body">
                  <div className="skeleton skeleton-line" style={{ width: '60%', height: '11px' }}></div>
                  <div className="skeleton skeleton-line" style={{ width: '85%', height: '15px', marginTop: '8px' }}></div>
                  <div className="skeleton skeleton-line" style={{ width: '45%', height: '13px', marginTop: '8px' }}></div>
                  <div className="skeleton skeleton-line" style={{ width: '100%', height: '34px', marginTop: '12px', borderRadius: '50px' }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="products-grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        <div className="section-cta">
          <Link to="/products" className="btn-primary">
            View All Products <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    </section>
  )
}

const PromoBanner = () => (
  <section className="promo-banner">
    <div className="container promo-banner__inner">
      <div className="promo-banner__text">
        <span className="promo-banner__tag">Limited Offer</span>
        <h2>Get 20% Off Your First Order</h2>
        <p>Sign up today and use code <strong>WELCOME20</strong> at checkout.</p>
        <Link to="/register" className="btn-primary">
          <i className="fas fa-user-plus"></i> Create Account
        </Link>
      </div>
      <div className="promo-banner__img">
        <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80" alt="Promo" />
      </div>
    </div>
  </section>
)

const Blog = () => (
  <section className="section">
    <div className="container">
      <h2 className="section-title">Our Blog</h2>
      <p className="section-subtitle">Style tips, trends, and inspiration from our team</p>
      <div className="blog-grid">
        {blogPosts.map(post => (
          <article key={post.id} className="blog-card">
            <div className="blog-card__img">
              <img src={post.image} alt={post.title} loading="lazy" />
              <span className="blog-card__category">{post.category}</span>
            </div>
            <div className="blog-card__body">
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <div className="blog-card__meta">
                <span><i className="fas fa-user"></i> {post.author}</span>
                <span><i className="fas fa-calendar"></i> {post.date}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
)

const Home = () => (
  <>
    <Hero />
    <Features />
    <NewArrivals />
    <PromoBanner />
    <Blog />
  </>
)

export default Home
