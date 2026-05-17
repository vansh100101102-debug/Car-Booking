import { Router } from 'express'
import Booking from '../models/Booking.js'
import User from '../models/User.js'
import Driver from '../models/Driver.js'

const router = Router()


router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().populate('assignedDriver', 'name email phone').sort({ createdAt: -1 })
    res.json(bookings)
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load bookings' })
  }
})

router.patch('/bookings/:id/assign', async (req, res) => {
  try {
    const { driverId } = req.body
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { assignedDriver: driverId, status: 'Ongoing' },
      { returnDocument: 'after' }
    ).populate('assignedDriver', 'name email phone')
    if (!booking) return res.status(404).json({ message: 'Booking not found' })
    res.json(booking)
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to assign driver' })
  }
})


router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load users' })
  }
})

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to delete user' })
  }
})


router.get('/drivers', async (req, res) => {
  try {
    const drivers = await Driver.find().select('-password').sort({ createdAt: -1 })
    res.json(drivers)
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load drivers' })
  }
})

router.post('/drivers', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }
    const normalizedEmail = email.toLowerCase()
    const existingDriver = await Driver.findOne({ email: normalizedEmail })
    if (existingDriver) {
      return res.status(400).json({ message: 'Driver with this email already exists' })
    }
    const driver = new Driver({ name, email: normalizedEmail, password, phone })
    await driver.save()
    res.status(201).json({ _id: driver._id, name: driver.name, email: driver.email })
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to create driver' })
  }
})

router.put('/drivers/:id', async (req, res) => {
  try {
    const { name, email, phone } = req.body
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { name, email, phone },
      { returnDocument: 'after' }
    )
    if (!driver) return res.status(404).json({ message: 'Driver not found' })
    res.json(driver)
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update driver' })
  }
})

router.delete('/drivers/:id', async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id)
    if (!driver) return res.status(404).json({ message: 'Driver not found' })

    await Booking.updateMany({ assignedDriver: req.params.id }, { assignedDriver: null, status: 'Pending' })
    res.json({ message: 'Driver deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to delete driver' })
  }
})

export default router
