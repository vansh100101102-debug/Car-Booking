
import express from 'express'
import User from '../models/User.js'
import Driver from '../models/Driver.js'

const router = express.Router()

router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }


    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }


    const newUser = new User({ email, password })
    await newUser.save()

    res.status(201).json({ message: 'User created successfully' })
  } catch (error) {
    console.error('Signup error:', error)


    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({ message: messages.join(', ') })
    }

    res.status(500).json({ message: 'Server error during signup' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const driver = await Driver.findOne({ email })
    if (driver) {
      const isMatch = await driver.comparePassword(password)
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' })
      }
      return res.status(200).json({ 
        message: 'Login successful', 
        email: driver.email, 
        isDriver: true, 
        driverId: driver._id 
      })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    res.status(200).json({ message: 'Login successful', email: user.email, isAdmin: user.isAdmin, isDriver: false })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error during login' })
  }
})

export default router
