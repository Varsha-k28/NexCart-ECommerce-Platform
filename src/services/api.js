import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const registerUser      = (data)  => API.post('/auth/register', data)
export const loginUser         = (data)  => API.post('/auth/login', data)
export const googleLogin       = (data)  => API.post('/auth/google', data)
export const getProfile        = ()      => API.get('/auth/profile')
export const updateProfile     = (data)  => API.put('/auth/profile', data)
export const changePassword    = (data)  => API.put('/auth/change-password', data)
export const forgotPassword    = (data)  => API.post('/auth/forgot-password', data)
export const verifyOTP         = (data)  => API.post('/auth/verify-otp', data)
export const resetPassword     = (token, data) => API.post(`/auth/reset-password/${token}`, data)

export const fetchCart         = ()      => API.get('/cart')
export const addToCart         = (data)  => API.post('/cart/add', data)
export const updateCartItem    = (data)  => API.put('/cart/update', data)
export const removeCartItem    = (productId) => API.delete(`/cart/remove/${productId}`)
export const clearCartAPI      = ()      => API.delete('/cart/clear')

export const fetchProducts     = (params) => API.get('/products', { params })
export const fetchProductById  = (id)     => API.get(`/products/${id}`)
export const fetchCategories   = ()       => API.get('/products/categories')

export const placeOrder        = (data)  => API.post('/orders', data)
export const getMyOrders       = ()      => API.get('/orders/my')
export const getOrderById      = (id)    => API.get(`/orders/${id}`)

export const createRazorpayOrder   = (amount) => API.post('/payment/create-order', { amount })
export const verifyRazorpayPayment = (data)   => API.post('/payment/verify', data)
