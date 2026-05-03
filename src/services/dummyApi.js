import axios from 'axios'

const DUMMY = axios.create({ baseURL: 'https://dummyjson.com' })

const normalizeProduct = (p) => ({
  id:            p.id,
  name:          p.title,
  description:   p.description,
  price:         Math.round(p.price * 83),
  originalPrice: Math.round((p.price / (1 - p.discountPercentage / 100)) * 83),
  discount:      Math.round(p.discountPercentage),
  category:      p.category,
  image:         p.thumbnail,
  images:        p.images || [p.thumbnail],
  rating:        p.rating,
  reviews:       p.stock,
  inStock:       p.stock > 0,
  stock:         p.stock,
  brand:         p.brand || '',
  label:         p.discountPercentage >= 20 ? `-${Math.round(p.discountPercentage)}%` : 'New',
})

export const getDummyProducts = async () => {
  const res = await DUMMY.get('/products?limit=100&select=id,title,description,price,discountPercentage,rating,stock,brand,category,thumbnail,images')
  return res.data.products.map(normalizeProduct)
}

export const getDummyByCategory = async (category) => {
  const res = await DUMMY.get(`/products/category/${category}?limit=50`)
  return res.data.products.map(normalizeProduct)
}

export const searchDummyProducts = async (query) => {
  const res = await DUMMY.get(`/products/search?q=${encodeURIComponent(query)}&limit=50`)
  return res.data.products.map(normalizeProduct)
}

export const getDummyProductById = async (id) => {
  const res = await DUMMY.get(`/products/${id}`)
  return normalizeProduct(res.data)
}

export const getDummyCategories = async () => {
  const res = await DUMMY.get('/products/categories')
  return res.data.map(c => (typeof c === 'string' ? c : c.slug))
}
