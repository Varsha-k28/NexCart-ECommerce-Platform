const express  = require('express')
const mongoose = require('mongoose')
const cors     = require('cors')
const dotenv   = require('dotenv')
const path     = require('path')

dotenv.config()

const app = express()

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:4173',
]

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true)
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'production')
      return cb(null, true)
    cb(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

app.use(express.json())

app.use('/api/auth',     require('./routes/authRoutes'))
app.use('/api/products', require('./routes/productRoutes'))
app.use('/api/orders',   require('./routes/orderRoutes'))
app.use('/api/payment',  require('./routes/paymentRoutes'))
app.use('/api/cart',     require('./routes/cartRoutes'))

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'NexCart API running ✅' })
})

if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '..', 'dist')
  app.use(express.static(frontendPath))
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'))
  })
}

app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API route not found' })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Internal server error', error: err.message })
})

const PORT = process.env.PORT || 5000

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`))
  })
  .catch(err => {
    console.error('❌ MongoDB failed:', err.message)
    process.exit(1)
  })
