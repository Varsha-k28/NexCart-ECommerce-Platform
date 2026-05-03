import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { CartProvider, useCart } from './context/CartContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider, useToast } from './context/ToastContext'
import Navbar         from './components/Navbar/Navbar'
import Footer         from './components/Footer/Footer'
import ScrollToTop    from './components/ScrollToTop'
import Home           from './pages/Home'
import Products       from './pages/Products'
import ProductDetail  from './pages/ProductDetail'
import Cart           from './pages/Cart'
import Checkout       from './pages/Checkout'
import Auth           from './pages/Auth'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword  from './pages/ResetPassword'
import Settings       from './pages/Settings'

const AppBridge = () => {
  const navigate          = useNavigate()
  const toast             = useToast()
  const { navigateRef, toastRef, reloadCart } = useCart()
  const { reloadCartRef } = useAuth()

  useEffect(() => {
    navigateRef.current  = navigate
    toastRef.current     = toast
    reloadCartRef.current = reloadCart
  }, [navigate, toast, reloadCart, navigateRef, toastRef, reloadCartRef])

  return null
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <Router>
            <AppBridge />
            <ScrollToTop />
            <Navbar />
            <main>
              <Routes>
                <Route path="/"                       element={<Home />} />
                <Route path="/products"               element={<Products />} />
                <Route path="/products/:id"           element={<ProductDetail />} />
                <Route path="/cart"                   element={<Cart />} />
                <Route path="/checkout"               element={<Checkout />} />
                <Route path="/login"                  element={<Auth />} />
                <Route path="/register"               element={<Auth />} />
                <Route path="/forgot-password"        element={<ForgotPassword />} />
                <Route path="/reset-password/:token"  element={<ResetPassword />} />
                <Route path="/settings"               element={<Settings />} />
                <Route path="*"                       element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </Router>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
