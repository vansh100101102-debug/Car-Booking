import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNo: {
      type: String,
      required: true,
      trim: true,
    },
    pickup: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    dateTime: {
      type: Date,
      required: true,
    },
    isDropped: {
      type: Boolean,
      default: false,
    },
    fare: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Ongoing', 'Completed'],
      default: 'Pending',
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },
    passengerCompleted: {
      type: Boolean,
      default: false,
    },
    driverCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

const Booking = mongoose.model('Booking', bookingSchema)

export default Booking
