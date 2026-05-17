import { Router } from 'express'
import Booking from '../models/Booking.js'

const router = Router()

router.post('/bookings', async (req, res) => {
  try {

    const { pickup = '', destination = '' } = req.body
    const baseFare = 150
    const distanceFactor = (pickup.length + destination.length) * 12
    const randomFluctuation = Math.floor(Math.random() * 50)
    req.body.fare = baseFare + distanceFactor + randomFluctuation

    const booking = await Booking.create(req.body)
    res.status(201).json(booking)
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to create booking' })
  }
})

router.get('/bookings', async (req, res) => {
  try {
    const { email } = req.query
    const filter = email ? { userEmail: email } : {}
    const bookings = await Booking.find(filter).populate('assignedDriver', 'name phone email').sort({ createdAt: -1 })
    res.json(bookings)
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load bookings' })
  }
})

router.patch('/bookings/:id/complete', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    booking.passengerCompleted = true
    

    if (booking.driverCompleted) {
      booking.isDropped = true
      booking.status = 'Completed'
    }

    await booking.save()
    res.json(booking)
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to complete booking' })
  }
})

router.delete('/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id)
    if (!booking) return res.status(404).json({ message: 'Booking not found' })
    res.json({ message: 'Booking cancelled successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to cancel booking' })
  }
})

export default router
