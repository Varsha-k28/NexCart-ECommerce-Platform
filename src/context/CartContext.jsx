import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react'
import { fetchCart, addToCart as apiAdd, updateCartItem as apiUpdate, removeCartItem as apiRemove, clearCartAPI } from '../services/api'

const CartContext = createContext()

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':    return { ...state, items: action.payload, synced: true }
    case 'SET_LOADING': return { ...state, loading: action.payload }
    default:            return state
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [], loading: false, synced: false,
  })

  const navigateRef = useRef(null)
  const toastRef    = useRef(null)

  const isLoggedIn = () => !!localStorage.getItem('token')

  const loadCart = useCallback(async () => {
    if (!isLoggedIn()) {
      dispatch({ type: 'SET_CART', payload: [] })
      return
    }
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const res = await fetchCart()
      dispatch({ type: 'SET_CART', payload: res.data.items || [] })
    } catch {
      dispatch({ type: 'SET_CART', payload: [] })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  useEffect(() => { loadCart() }, [loadCart])

  const addToCart = async (product) => {
    if (!isLoggedIn()) {
      toastRef.current?.warning('Please login to add items to cart')
      setTimeout(() => navigateRef.current?.('/login', { state: { from: window.location.pathname } }), 800)
      return false
    }
    try {
      const res = await apiAdd({
        productId:     product.id,
        name:          product.name,
        price:         product.price,
        originalPrice: product.originalPrice || product.price,
        discount:      product.discount || 0,
        image:         product.image,
        category:      product.category,
        quantity:      1,
      })
      dispatch({ type: 'SET_CART', payload: res.data.items || [] })
      toastRef.current?.success(`${product.name.slice(0, 30)}... added to cart!`)
      return true
    } catch (err) {
      toastRef.current?.error('Failed to add to cart. Try again.')
      console.error('Add to cart failed:', err.message)
      return false
    }
  }

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return removeFromCart(productId)
    try {
      const res = await apiUpdate({ productId: String(productId), quantity })
      dispatch({ type: 'SET_CART', payload: res.data.items || [] })
    } catch (err) {
      toastRef.current?.error('Failed to update quantity')
      console.error('Update cart failed:', err.message)
    }
  }

  const removeFromCart = async (productId) => {
    try {
      const res = await apiRemove(String(productId))
      dispatch({ type: 'SET_CART', payload: res.data.items || [] })
      toastRef.current?.info('Item removed from cart')
    } catch (err) {
      toastRef.current?.error('Failed to remove item')
      console.error('Remove from cart failed:', err.message)
    }
  }

  const clearCart = async () => {
    try {
      if (isLoggedIn()) await clearCartAPI()
      dispatch({ type: 'SET_CART', payload: [] })
    } catch {
      dispatch({ type: 'SET_CART', payload: [] })
    }
  }

  const reloadCart = () => loadCart()

  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0)
  const totalPrice = state.items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items: state.items,
      loading: state.loading,
      totalItems,
      totalPrice,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      reloadCart,
      navigateRef,
      toastRef,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
