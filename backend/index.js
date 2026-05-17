import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import bookingRoutes from './routes/bookingRoutes.js'
import authRoutes from './routes/authRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import driverRoutes from './routes/driverRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001
const MONGODB_HOST = process.env.MONGODB_HOST || '127.0.0.1'
const MONGODB_PORT = process.env.MONGODB_PORT || '27017'
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'furiouscabs'
const MONGODB_URI =
  process.env.MONGODB_URI ||
  `mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DB_NAME}`
const isCustomUri = Boolean(process.env.MONGODB_URI)

app.use(cors())
app.use(express.json())

app.use('/api', bookingRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/driver', driverRoutes)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    const sourceLabel = isCustomUri
      ? 'custom MONGODB_URI'
      : `${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DB_NAME}`
    console.log(`MongoDB connected successfully (${sourceLabel})`)

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Mongo connection failed:', error.message)
    process.exit(1)
  })
