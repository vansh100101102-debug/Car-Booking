import { Router } from 'express'
import Driver from '../models/Driver.js'
import Booking from '../models/Booking.js'

const router = Router()


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }
    const driver = await Driver.findOne({ email })
    if (!driver) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    const isMatch = await driver.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    res.json({ _id: driver._id, name: driver.name, email: driver.email })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' })
  }
})

// Driver's Assigned Bookings
router.get('/bookings/:driverId', async (req, res) => {
  try {
    const bookings = await Booking.find({ assignedDriver: req.params.driverId }).sort({ createdAt: -1 })
    res.json(bookings)
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load assigned bookings' })
  }
})

router.put('/bookings/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    const booking = await Booking.findById(req.params.id)
    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    if (status === 'Completed') {
      booking.driverCompleted = true
      // Only set status to Completed and isDropped if passenger also confirmed
      if (booking.passengerCompleted) {
        booking.status = 'Completed'
        booking.isDropped = true
      }
    } else {
      booking.status = status
    }

    await booking.save()
    res.json(booking)
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update status' })
  }
})

export default router
