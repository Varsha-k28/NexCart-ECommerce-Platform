import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard/ProductCard'
import {
  getDummyProducts,
  getDummyByCategory,
  searchDummyProducts,
  getDummyCategories,
} from '../services/dummyApi'
import './Products.css'

const sortOptions = [
  { value: 'default',    label: 'Default' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'discount',   label: 'Best Discount' },
]

const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton skeleton-img"></div>
    <div className="skeleton-body">
      <div className="skeleton skeleton-line" style={{ width: '60%', height: '12px' }}></div>
      <div className="skeleton skeleton-line" style={{ width: '90%', height: '16px', marginTop: '8px' }}></div>
      <div className="skeleton skeleton-line" style={{ width: '40%', height: '14px', marginTop: '8px' }}></div>
      <div className="skeleton skeleton-line" style={{ width: '100%', height: '36px', marginTop: '12px', borderRadius: '50px' }}></div>
    </div>
  </div>
)

const Products = () => {
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''

  const [allProducts, setAllProducts]   = useState([])
  const [categories, setCategories]     = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [search, setSearch]             = useState(initialSearch)
  const [searchInput, setSearchInput]   = useState(initialSearch)
  const [category, setCategory]         = useState('all')
  const [sort, setSort]                 = useState('default')
  const [maxPrice, setMaxPrice]         = useState(100000)
  const [priceLimit, setPriceLimit]     = useState(100000)

  useEffect(() => {
    getDummyCategories()
      .then(cats => setCategories(['all', ...cats]))
      .catch(() => setCategories(['all']))
  }, [])

  useEffect(() => {
    setLoading(true)
    setError('')
    const fetcher = category === 'all'
      ? getDummyProducts()
      : getDummyByCategory(category)

    fetcher
      .then(data => {
        setAllProducts(data)
        const max = Math.max(...data.map(p => p.price), 100000)
        setPriceLimit(max)
        setMaxPrice(max)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load products. Please check your internet connection.')
        setLoading(false)
      })
  }, [category])

  useEffect(() => {
    if (!searchInput.trim()) {
      setSearch('')
      return
    }
    const timer = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    if (!search.trim()) return
    setLoading(true)
    searchDummyProducts(search)
      .then(data => { setAllProducts(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [search])

  const filtered = useMemo(() => {
    let list = allProducts.filter(p => p.price <= maxPrice)
    switch (sort) {
      case 'price-asc':  list = [...list].sort((a, b) => a.price - b.price);    break
      case 'price-desc': list = [...list].sort((a, b) => b.price - a.price);    break
      case 'rating':     list = [...list].sort((a, b) => b.rating - a.rating);  break
      case 'discount':   list = [...list].sort((a, b) => b.discount - a.discount); break
      default: break
    }
    return list
  }, [allProducts, sort, maxPrice])

  const handleReset = useCallback(() => {
    setCategory('all')
    setSort('default')
    setMaxPrice(priceLimit)
    setSearchInput('')
    setSearch('')
  }, [priceLimit])

  return (
    <div className="products-page">
      <div className="products-page__hero">
        <div className="container">
          <h1>All Products</h1>
          <p>Real products from DummyJSON API — {allProducts.length} items loaded</p>
        </div>
      </div>

      <div className="container products-page__layout">
        <aside className="products-page__sidebar">
          <div className="filter-section">
            <h3><i className="fas fa-th-large"></i> Categories</h3>
            <ul className="filter-categories">
              {categories.map(cat => (
                <li key={cat}>
                  <button
                    className={`filter-cat-btn ${category === cat ? 'filter-cat-btn--active' : ''}`}
                    onClick={() => { setCategory(cat); setSearchInput(''); setSearch('') }}
                  >
                    <span className="filter-cat-btn__name">
                      {cat === 'all' ? 'All Products' : cat.replace(/-/g, ' ')}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="filter-section">
            <h3><i className="fas fa-rupee-sign"></i> Max Price</h3>
            <div className="price-range">
              <input
                type="range"
                min="0"
                max={priceLimit}
                step="500"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
              />
              <div className="price-range__labels">
                <span>₹0</span>
                <span>₹{maxPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button className="filter-reset" onClick={handleReset}>
            <i className="fas fa-redo"></i> Reset Filters
          </button>
        </aside>

        <div className="products-page__main">
          <div className="products-toolbar">
            <div className="products-toolbar__search">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button className="products-toolbar__clear" onClick={() => { setSearchInput(''); setSearch('') }}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            <div className="products-toolbar__right">
              <span className="products-toolbar__count">
                {loading ? '...' : `${filtered.length} products`}
              </span>
              <select value={sort} onChange={e => setSort(e.target.value)}>
                {sortOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="api-badge">
            <i className="fas fa-plug"></i>
            Live data from <a href="https://dummyjson.com" target="_blank" rel="noreferrer">DummyJSON API</a>
            &nbsp;— prices converted to INR (₹)
          </div>

          {error && (
            <div className="products-error">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          {loading && (
            <div className="products-grid-3">
              {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="products-grid-3">
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && !error && (
            <div className="products-empty">
              <i className="fas fa-search"></i>
              <h3>No products found</h3>
              <p>Try a different search term or reset filters</p>
              <button className="btn-primary" onClick={handleReset}>
                <i className="fas fa-redo"></i> Reset
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Products
