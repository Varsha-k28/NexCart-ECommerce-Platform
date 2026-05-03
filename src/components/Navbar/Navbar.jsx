import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const { totalItems }  = useCart()
  const { user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  const [scrolled,     setScrolled]     = useState(false)
  const [menuOpen,     setMenuOpen]     = useState(false)
  const [searchOpen,   setSearchOpen]   = useState(false)
  const [searchQuery,  setSearchQuery]  = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false); setDropdownOpen(false) }, [location])

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    navigate('/')
  }

  const navLinks = [
    { label: 'Home',     path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'Cart',     path: '/cart' },
  ]

  return (
    <>
      <div className="topbar">
        <div className="container topbar__inner">
          <span><i className="fas fa-truck"></i> Free shipping on orders above ₹999</span>
          <span><i className="fas fa-phone"></i> +91 93533 62201</span>
          <span><i className="fas fa-tag"></i> Use code <strong>SHOP10</strong> for 10% off</span>
        </div>
      </div>

      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="container navbar__inner">

          <Link to="/" className="navbar__logo">
            <i className="fas fa-shopping-bag"></i>
            <span>NexCart</span>
          </Link>

          <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
            {navLinks.map(link => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`navbar__link ${location.pathname === link.path ? 'navbar__link--active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {!user && (
              <li className="navbar__links-auth-mobile">
                <Link to="/login"    className="navbar__link" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="navbar__link navbar__link--signup" onClick={() => setMenuOpen(false)}>Create Account</Link>
              </li>
            )}
            {user && (
              <li className="navbar__links-auth-mobile">
                <button className="navbar__link navbar__link--logout" onClick={() => { handleLogout(); setMenuOpen(false) }}>
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </li>
            )}
          </ul>

          <div className="navbar__icons">
            <button
              className="navbar__icon-btn"
              onClick={() => setSearchOpen(s => !s)}
              aria-label="Search"
            >
              <i className="fas fa-search"></i>
            </button>

            {user ? (
              <div className="navbar__user-menu" ref={dropdownRef}>
                <button
                  className={`navbar__user-btn ${dropdownOpen ? 'navbar__user-btn--open' : ''}`}
                  onClick={() => setDropdownOpen(d => !d)}
                  aria-label="User menu"
                >
                  <div className="navbar__user-avatar">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="navbar__user-name">{user.name?.split(' ')[0]}</span>
                  <i className={`fas fa-chevron-${dropdownOpen ? 'up' : 'down'} navbar__user-chevron`}></i>
                </button>

                {dropdownOpen && (
                  <div className="navbar__dropdown">
                    <div className="navbar__dropdown-header">
                      <div className="navbar__dropdown-avatar">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </div>
                    </div>

                    <div className="navbar__dropdown-divider"></div>

                    <Link to="/settings" className="navbar__dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <i className="fas fa-user-cog"></i> Profile & Settings
                    </Link>
                    <Link to="/cart" className="navbar__dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <i className="fas fa-shopping-cart"></i> My Cart
                      {totalItems > 0 && <span className="navbar__dropdown-badge">{totalItems}</span>}
                    </Link>
                    <Link to="/settings" className="navbar__dropdown-item" onClick={() => { setDropdownOpen(false) }}>
                      <i className="fas fa-box"></i> My Orders
                    </Link>

                    <div className="navbar__dropdown-divider"></div>

                    <button className="navbar__dropdown-item navbar__dropdown-logout" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="navbar__auth-btns">
                <Link to="/login" className="navbar__login-btn">
                  <i className="fas fa-sign-in-alt"></i> Login
                </Link>
                <Link to="/register" className="navbar__register-btn">
                  Create Account
                </Link>
              </div>
            )}

            <Link to="/cart" className="navbar__icon-btn navbar__cart-btn" aria-label="Cart">
              <i className="fas fa-shopping-cart"></i>
              {totalItems > 0 && (
                <span className="navbar__cart-badge">{totalItems}</span>
              )}
            </Link>

            <button
              className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
              onClick={() => setMenuOpen(m => !m)}
              aria-label="Menu"
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="navbar__search-bar">
            <div className="container">
              <form onSubmit={handleSearch} className="navbar__search-form">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button type="submit"><i className="fas fa-search"></i></button>
                <button type="button" onClick={() => setSearchOpen(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </form>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

export default Navbar
