import { useEffect, useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './App.css'
import Footer from './components/Footer'

const staticRays = Array.from({ length: 15 }).map((_, i) => {
  const top = Math.random() * 100;
  const duration = 0.5 + Math.random() * 2; // Very fast speed 0.5s to 2.5s
  const delay = Math.random() * -5;
  const width = 100 + Math.random() * 800;
  const colors = ['#a855f7', '#d946ef', '#ec4899', '#3b82f6', '#8b5cf6', '#e879f9']; // purples, pinks, blues
  const color = colors[Math.floor(Math.random() * colors.length)];
  const height = Math.random() > 0.85 ? '4px' : (Math.random() > 0.5 ? '2px' : '1px');

  return (
    <div 
      key={i} 
      className="speed-ray"
      style={{
        top: `${top}%`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        width: `${width}px`,
        height: height,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        boxShadow: `0 0 12px ${color}, 0 0 24px ${color}`
      }}
    />
  )
})

const LightRaysBackground = () => (
  <div className="speed-rays-container">
    {staticRays}
  </div>
)

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`toast ${type}`}>
      {type === 'success' ? 'Success:' : 'Error:'} {message}
    </div>
  )
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function Navbar({ isMenuOpen, setIsMenuOpen, isLoggedIn, handleLogout, isAdmin, isDriver }) {
  useEffect(() => {
    document.body.classList.add('dark-mode')
  }, [])

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand" onClick={() => setIsMenuOpen(false)}>
          FuriousCabs
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
          {!isDriver && (
            <>
              <Link to="/booking" onClick={() => setIsMenuOpen(false)}>Booking</Link>
              <Link to="/my-booking" onClick={() => setIsMenuOpen(false)}>My Booking</Link>
            </>
          )}
          {isAdmin && <Link to="/admin" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>}
          {isDriver && <Link to="/driver-dashboard" onClick={() => setIsMenuOpen(false)}>Driver Panel</Link>}
          {!isLoggedIn && !isDriver ? (
            <>
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="signup-link" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
            </>
          ) : (
            <button className="logout-btn" onClick={() => { setIsMenuOpen(false); handleLogout(); }}>Logout</button>
          )}
        </div>
      </div>
    </nav>
  )
}

function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="tagline">Premium | Secure | Reliable</p>
          <h1>Your trusted cab partner for every ride</h1>
          <p>
            Ride with confidence anytime, anywhere. Fast booking, verified drivers,
            and comfort-first journeys at your fingertips.
          </p>
          <Link to="/booking" className="primary-btn">
            Go to Booking
          </Link>
        </div>
      </section>

      <section className="features">
        <article>
          <h3>Safe Rides</h3>
          <p>Verified drivers and real-time trip tracking for every booking.</p>
        </article>
        <article>
          <h3>Secure Payments</h3>
          <p>Cashless checkout with trusted payment methods.</p>
        </article>
        <article>
          <h3>Always Reliable</h3>
          <p>24/7 availability for local, airport, and city rides.</p>
        </article>
      </section>
    </>
  )
}

function AuthRequiredPopup() {
  const navigate = useNavigate()
  return (
    <div className="center-page-wrapper">
      <section className="booking-card login-card" style={{ alignItems: 'center', textAlign: 'center' }}>
        <h1>Authentication Required</h1>
        <p>Please log in or sign up to access this page.</p>
        <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1rem' }}>
          <button onClick={() => navigate('/login')} className="primary-btn form-btn" style={{ flex: 1 }}>
            Login
          </button>
          <button onClick={() => navigate('/signup')} className="primary-btn form-btn" style={{ flex: 1, background: '#475569' }}>
            Sign Up
          </button>
        </div>
      </section>
    </div>
  )
}

function BookingPage({ isLoggedIn, userEmail, showToast }) {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    phoneNo: '',
    pickup: '',
    destination: '',
    dateTime: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isLoggedIn) {
    return <AuthRequiredPopup />
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const getMinDateTime = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    
    // Additional frontend validation check
    const selectedDate = new Date(formData.dateTime)
    if (selectedDate < new Date()) {
      setError('Please select a date and time in the future.')
      setIsSubmitting(false)
      showToast('Please select a date and time in the future.', 'error')
      return
    }

    try {
      const payload = { ...formData, userEmail }
      await axios.post(`${API_BASE_URL}/bookings`, payload)
      showToast('Ride booked successfully!')
      navigate('/my-booking')
    } catch (requestError) {
      const serverMessage = requestError?.response?.data?.message
      showToast(serverMessage || 'Could not save booking.', 'error')
      setError(serverMessage || 'Could not save booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="booking-card">
      <h1>Book Your Ride</h1>
      <p>Enter your details to request a ride in seconds.</p>
      <form className="booking-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" required />
        </label>
        <label>
          Phone No
          <input type="tel" name="phoneNo" value={formData.phoneNo} onChange={handleChange} placeholder="Enter phone number" required />
        </label>
        <label>
          Starting Point
          <input type="text" name="pickup" value={formData.pickup} onChange={handleChange} placeholder="Pickup location" required />
        </label>
        <label>
          Destination
          <input type="text" name="destination" value={formData.destination} onChange={handleChange} placeholder="Drop location" required />
        </label>
        <label>
          Date and Time
          <input 
            type="datetime-local" 
            name="dateTime" 
            value={formData.dateTime} 
            onChange={handleChange} 
            min={getMinDateTime()}
            onClick={(e) => {
              try {
                e.target.showPicker();
              } catch (err) {}
            }}
            required 
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" className="primary-btn form-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Requesting...' : 'Request Ride'}
        </button>
      </form>
    </section>
  )
}

function MyBookingPage({ isLoggedIn, userEmail, showToast }) {
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      if (!userEmail) {
        setIsLoading(false)
        return
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/bookings?email=${userEmail}`)
        setBookings(response.data)
      } catch {
        setBookings([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchBookings()
  }, [userEmail])

  if (!isLoggedIn) {
    return <AuthRequiredPopup />
  }

  const handleCompleteRide = async (id) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/bookings/${id}/complete`)
      setBookings(prev => prev.map(b => b._id === id ? response.data : b))
    } catch (err) {
      console.error('Failed to complete ride', err)
    }
  }

  const handleCancelRide = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/bookings/${id}`)
      setBookings(prev => prev.filter(b => b._id !== id))
    } catch (err) {
      console.error('Failed to cancel ride', err)
    }
  }

  const [filter, setFilter] = useState('All')

  const now = new Date()
  let filteredBookings = bookings

  if (filter === 'Upcoming') {
    filteredBookings = bookings.filter(b => !b.isDropped && new Date(b.dateTime) >= now)
  } else if (filter === 'Past') {
    filteredBookings = bookings.filter(b => b.isDropped || new Date(b.dateTime) < now)
  }

  const getStatusClass = (booking) => {
    if (booking.isDropped || booking.status === 'Completed') return 'completed'
    if (booking.status === 'Ongoing') return 'ongoing'
    return 'pending'
  }

  const getStatusLabel = (booking) => {
    if (booking.isDropped || booking.status === 'Completed') return 'Completed'
    if (booking.status === 'Ongoing') return 'Ongoing'
    return 'Pending'
  }

  const renderBookingCard = (booking) => {
    const statusClass = getStatusClass(booking)
    const statusLabel = getStatusLabel(booking)
    const passengerInit = booking.name ? booking.name.charAt(0).toUpperCase() : 'P'
    
    return (
      <article key={booking._id} className="booking-item admin-booking-card" style={{ padding: '24px' }}>
        {/* Header with Avatar and Status */}
        <div className="admin-booking-header">
          <div className="passenger-info">
            <div className="passenger-avatar">{passengerInit}</div>
            <div>
              <h3>{booking.name}</h3>
              <span className="passenger-email">Ph: {booking.phoneNo}</span>
            </div>
          </div>
          <span className={`status-pill ${statusClass}`}>
            {statusLabel}
          </span>
        </div>

        {/* Route Flow */}
        <div className="admin-booking-route">
          <div className="route-stop">
            <span className="route-dot start"></span>
            <div className="route-details">
              <span className="route-label">Pickup Point</span>
              <span className="route-text">{booking.pickup}</span>
            </div>
          </div>
          
          <div className="route-line-connector"></div>

          <div className="route-stop">
            <span className="route-dot end"></span>
            <div className="route-details">
              <span className="route-label">Destination</span>
              <span className="route-text">{booking.destination}</span>
            </div>
          </div>
        </div>

        {/* Date and Fare */}
        <div className="admin-booking-checklists">
          <div className="checklist-item">
            <span className="checklist-label">Date & Time</span>
            <span className="completion-badge pending" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
              {new Date(booking.dateTime).toLocaleString()}
            </span>
          </div>
          <div className="checklist-item">
            <span className="checklist-label">Estimated Fare</span>
            <span className="completion-badge checked" style={{ fontSize: '13px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '6px 12px' }}>
              ₹{booking.fare || 'Pending'}
            </span>
          </div>
        </div>

        {/* Driver Card Info if assigned */}
        {booking.assignedDriver && (
          <div className="admin-driver-assigned-card">
            <div className="driver-visual-info">
              <span className="driver-avatar-mini">👨‍✈️</span>
              <div>
                <span className="driver-assigned-label">Driver Assigned</span>
                <div className="driver-assigned-name">{booking.assignedDriver.name}</div>
                <div className="driver-assigned-phone">Phone: {booking.assignedDriver.phone || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Passenger checklist status badges */}
        <div className="admin-booking-checklists" style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '10px' }}>
          <div className="checklist-item">
            <span className="checklist-label">Ride Verification Status</span>
            <div className="checklist-badges">
              <span className={`completion-badge ${booking.passengerCompleted ? 'checked' : 'pending'}`}>
                Passenger: {booking.passengerCompleted ? '✓ Completed' : 'Pending'}
              </span>
              <span className={`completion-badge ${booking.driverCompleted ? 'checked' : 'pending'}`}>
                Driver: {booking.driverCompleted ? '✓ Completed' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Complete / Cancel Action Buttons */}
        {(!booking.isDropped && new Date(booking.dateTime) >= now) && (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button
              className="primary-btn form-btn complete-ride-btn"
              onClick={() => handleCompleteRide(booking._id)}
              disabled={booking.passengerCompleted}
              style={{ flex: 1 }}
            >
              {booking.passengerCompleted ? 'Waiting for Driver' : 'Complete Ride'}
            </button>
            <button
              className="primary-btn form-btn cancel-ride-btn"
              onClick={() => handleCancelRide(booking._id)}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        )}
      </article>
    )
  }

  return (
    <section className="booking-card" style={{ maxWidth: '800px' }}>
      <h1>My Booking</h1>
      <p>Track your ride history and upcoming journeys.</p>
      
      <div className="filter-tabs" style={{ display: 'flex', gap: '1rem', margin: '1.5rem 0' }}>
        {['All', 'Upcoming', 'Past'].map(t => (
          <button key={t} className={`primary-btn ${filter === t ? '' : 'outline'}`} style={{ flex: 1, fontSize: '0.8rem' }} onClick={() => setFilter(t)}>{t}</button>
        ))}
      </div>

      {isLoading ? <p>Loading bookings...</p> : null}
      {!isLoading && filteredBookings.length === 0 ? <p>No rides found.</p> : null}
      {!isLoading && filteredBookings.length > 0 ? (
        <div className="booking-list">
          {filteredBookings.map(b => renderBookingCard(b))}
        </div>
      ) : null}
    </section>
  )
}

function SignupPage({ setIsLoggedIn, setUserEmail, showToast }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setIsSubmitting(true)

    try {
      await axios.post(`${API_BASE_URL}/auth/signup`, formData)
      setIsLoggedIn(true)
      setUserEmail(formData.email)
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userEmail', formData.email)
      navigate('/')
    } catch (requestError) {
      const serverMessage = requestError?.response?.data?.message
      setError(serverMessage || 'Could not sign up. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="center-page-wrapper">
      <section className="booking-card login-card">
        <h1>Sign Up</h1>
        <p>Create an account to manage your rides.</p>
        <form className="booking-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              minLength={6}
              required
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="primary-btn form-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
      </section>
    </div>
  )
}

function LoginPage({ setIsLoggedIn, setUserEmail, setIsAdmin, setIsDriver, setDriverId, showToast }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, formData)
      
      if (response.data.isDriver) {
        setIsDriver(true)
        setDriverId(response.data.driverId)
        localStorage.setItem('isDriver', 'true')
        localStorage.setItem('driverId', response.data.driverId)
        navigate('/driver-dashboard')
      } else {
        setIsLoggedIn(true)
        setUserEmail(response.data.email)
        setIsAdmin(response.data.isAdmin || false)
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('userEmail', response.data.email)
        localStorage.setItem('isAdmin', response.data.isAdmin ? 'true' : 'false')
        navigate('/')
      }
    } catch (requestError) {
      const serverMessage = requestError?.response?.data?.message
      setError(serverMessage || 'Could not log in. Please check your credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="center-page-wrapper">
      <section className="booking-card login-card">
        <h1>Log In</h1>
        <p>Welcome back! Please enter your details.</p>
        <form className="booking-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="primary-btn form-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </button>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <a href="#" style={{ fontSize: '14px', color: 'var(--primary)', textDecoration: 'none' }}>Forgot Password?</a>
          </div>
        </form>
      </section>
    </div>
  )
}

function DriverAssignDropdown({ bookingId, currentDriver, drivers, onAssign }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const handleClose = () => setIsOpen(false)
    window.addEventListener('click', handleClose)
    return () => window.removeEventListener('click', handleClose)
  }, [isOpen])

  return (
    <div className="driver-assign-container" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className={`driver-assign-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="driver-assign-icon">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>{currentDriver ? `Driver: ${currentDriver.name}` : 'Assign Driver'}</span>
        </div>
        <svg className="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="driver-assign-dropdown">
          <div className="dropdown-header">Available Drivers</div>
          <div className="dropdown-options">
            <button
              type="button"
              className={`dropdown-option ${!currentDriver ? 'selected' : ''}`}
              onClick={() => {
                onAssign(bookingId, '')
                setIsOpen(false)
              }}
            >
              <div className="option-info">
                <div className="option-name" style={{ color: 'var(--error)' }}>Unassign Driver</div>
                <div className="option-details">Remove driver from this ride</div>
              </div>
            </button>
            {drivers.map((d) => (
              <button
                key={d._id}
                type="button"
                className={`dropdown-option ${currentDriver?._id === d._id ? 'selected' : ''}`}
                onClick={() => {
                  onAssign(bookingId, d._id)
                  setIsOpen(false)
                }}
              >
                <div className="option-info">
                  <div className="option-name">{d.name}</div>
                  <div className="option-details">
                    {d.email} {d.phone && `• ${d.phone}`}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AdminDashboard({ isAdmin, showToast }) {
  const [activeTab, setActiveTab] = useState('bookings')
  const [data, setData] = useState([])
  const [drivers, setDrivers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [newDriver, setNewDriver] = useState({ name: '', email: '', password: '', phone: '' })
  const [editingDriver, setEditingDriver] = useState(null)

  useEffect(() => {
    if (!isAdmin) return
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const endpoint = activeTab === 'bookings' ? '/admin/bookings' : '/admin/users'
        const response = await axios.get(`${API_BASE_URL}${endpoint}`)
        setData(response.data)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
    if (activeTab === 'bookings' || activeTab === 'drivers') fetchDrivers()
  }, [isAdmin, activeTab])

  const fetchDrivers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/drivers`)
      setDrivers(response.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure?')) return
    try {
      await axios.delete(`${API_BASE_URL}/admin/users/${id}`)
      setData(data.filter(u => u._id !== id))
    } catch (err) {
      alert('Failed to delete')
    }
  }

  const handleAddDriver = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE_URL}/admin/drivers`, newDriver)
      alert('Driver Added Successfully!')
      setNewDriver({ name: '', email: '', password: '', phone: '' })
      fetchDrivers()
    } catch (err) {
      const serverMessage = err.response?.data?.message || 'Failed to add driver'
      alert(`Error: ${serverMessage}`)
    }
  }

  const handleDeleteDriver = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return
    try {
      await axios.delete(`${API_BASE_URL}/admin/drivers/${id}`)
      fetchDrivers()
    } catch (err) {
      alert('Failed to delete driver')
    }
  }

  const handleUpdateDriver = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`${API_BASE_URL}/admin/drivers/${editingDriver._id}`, editingDriver)
      alert('Driver Updated!')
      setEditingDriver(null)
      fetchDrivers()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update driver'
      alert(msg)
    }
  }

  const handleAssignDriver = async (bookingId, driverId) => {
    try {
      await axios.patch(`${API_BASE_URL}/admin/bookings/${bookingId}/assign`, { driverId })
      alert('Driver Assigned!')
      const response = await axios.get(`${API_BASE_URL}/admin/bookings`)
      setData(response.data)
    } catch (err) {
      alert('Failed to assign')
    }
  }

  if (!isAdmin) return <div className="center-page-wrapper"><h1>Access Denied</h1></div>

  return (
    <section className="booking-card admin-card" style={{ maxWidth: '1000px' }}>
      <h1>Admin Dashboard</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button className={`primary-btn ${activeTab === 'bookings' ? '' : 'outline'}`} onClick={() => setActiveTab('bookings')}>Bookings</button>
        <button className={`primary-btn ${activeTab === 'users' ? '' : 'outline'}`} onClick={() => setActiveTab('users')}>Users</button>
        <button className={`primary-btn ${activeTab === 'drivers' ? '' : 'outline'}`} onClick={() => setActiveTab('drivers')}>Drivers</button>
      </div>

      {activeTab === 'bookings' && (
        <div className="booking-list">
          {isLoading ? <p>Loading...</p> : data.map(booking => {
            const isCompleted = booking.status === 'Completed'
            const statusClass = booking.status ? booking.status.toLowerCase() : 'pending'
            
            return (
              <div key={booking._id} className={`booking-item admin-booking-card ${statusClass}`}>
                <div className="admin-booking-header">
                  <div className="passenger-info">
                    <div className="passenger-avatar">
                      {booking.name ? booking.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h3>{booking.name}</h3>
                      <span className="passenger-email">{booking.userEmail}</span>
                    </div>
                  </div>
                  <span className={`status-pill ${statusClass}`}>{booking.status || 'Pending'}</span>
                </div>

                <div className="admin-booking-route">
                  <div className="route-stop pickup">
                    <span className="route-dot start"></span>
                    <div className="route-details">
                      <span className="route-label">Pickup Location</span>
                      <span className="route-text">{booking.pickup}</span>
                    </div>
                  </div>
                  <div className="route-line-connector"></div>
                  <div className="route-stop drop">
                    <span className="route-dot end"></span>
                    <div className="route-details">
                      <span className="route-label">Drop Destination</span>
                      <span className="route-text">{booking.destination}</span>
                    </div>
                  </div>
                </div>

                <div className="admin-booking-checklists">
                  <div className="checklist-item">
                    <span className="checklist-label">Completion Status:</span>
                    <div className="checklist-badges">
                      <span className={`completion-badge ${booking.passengerCompleted ? 'checked' : 'pending'}`}>
                        Passenger {booking.passengerCompleted ? '✓' : '✗'}
                      </span>
                      <span className={`completion-badge ${booking.driverCompleted ? 'checked' : 'pending'}`}>
                        Driver {booking.driverCompleted ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                </div>

                {booking.assignedDriver ? (
                  <div className="admin-driver-assigned-card">
                    <div className="driver-visual-info">
                      <div className="driver-avatar-mini">🚗</div>
                      <div>
                        <div className="driver-assigned-label">Assigned Driver</div>
                        <div className="driver-assigned-name">{booking.assignedDriver.name}</div>
                        {booking.assignedDriver.phone && (
                          <div className="driver-assigned-phone">{booking.assignedDriver.phone}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="admin-driver-unassigned-card">
                    <span className="unassigned-icon">⚠️</span>
                    <span>No Driver Assigned Yet</span>
                  </div>
                )}

                <DriverAssignDropdown 
                  bookingId={booking._id} 
                  currentDriver={booking.assignedDriver} 
                  drivers={drivers} 
                  onAssign={handleAssignDriver} 
                />
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="admin-users-list">
          {isLoading ? (
            <p>Loading...</p>
          ) : data.length === 0 ? (
            <p className="no-data-text">No users found.</p>
          ) : (
            <div className="users-grid" style={{ display: 'grid', gap: '1rem' }}>
              {data.map(user => {
                const userInit = user.email ? user.email.charAt(0).toUpperCase() : 'U'
                return (
                  <div key={user._id} className="admin-user-row-card">
                    <div className="user-profile-info">
                      <div className="passenger-avatar user-avatar-icon">{userInit}</div>
                      <div className="user-text-details">
                        <span className="user-email-text">{user.email}</span>
                        <span className="user-role-badge">{user.isAdmin ? 'System Admin' : 'Customer'}</span>
                      </div>
                    </div>
                    {!user.isAdmin && (
                      <button 
                        onClick={() => handleDeleteUser(user._id)} 
                        className="delete-user-row-btn"
                        title="Delete User"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'drivers' && (
        <div className="driver-management">
          {editingDriver ? (
            <form onSubmit={handleUpdateDriver} className="booking-form admin-driver-form">
              <h3>Edit Driver Settings</h3>
              <label>
                Driver Name
                <input type="text" placeholder="Name" value={editingDriver.name} onChange={e => setEditingDriver({...editingDriver, name: e.target.value})} required />
              </label>
              <label>
                Email Address
                <input type="email" placeholder="Email" value={editingDriver.email} onChange={e => setEditingDriver({...editingDriver, email: e.target.value})} required />
              </label>
              <label>
                Phone Number
                <input type="tel" placeholder="Phone" value={editingDriver.phone} onChange={e => setEditingDriver({...editingDriver, phone: e.target.value})} />
              </label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '10px' }}>
                <button type="submit" className="primary-btn form-btn complete-ride-btn" style={{ flex: 1 }}>Update</button>
                <button type="button" className="primary-btn form-btn cancel-ride-btn" style={{ flex: 1 }} onClick={() => setEditingDriver(null)}>Cancel</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAddDriver} className="booking-form admin-driver-form">
              <h3>Add New System Driver</h3>
              <label>
                Driver Name
                <input type="text" placeholder="Enter name" value={newDriver.name} onChange={e => setNewDriver({...newDriver, name: e.target.value})} required />
              </label>
              <label>
                Email Address
                <input type="email" placeholder="Enter email" value={newDriver.email} onChange={e => setNewDriver({...newDriver, email: e.target.value})} required />
              </label>
              <label>
                Password
                <input type="password" placeholder="Create password" value={newDriver.password} onChange={e => setNewDriver({...newDriver, password: e.target.value})} required />
              </label>
              <label>
                Phone Number
                <input type="tel" placeholder="Enter phone number" value={newDriver.phone} onChange={e => setNewDriver({...newDriver, phone: e.target.value})} />
              </label>
              <button type="submit" className="primary-btn form-btn" style={{ marginTop: '10px' }}>Add Driver Account</button>
            </form>
          )}
          
          <div className="driver-list" style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px', fontSize: '18px', fontWeight: '700' }}>Current Active Drivers</h3>
            <div className="drivers-grid" style={{ display: 'grid', gap: '1rem' }}>
              {drivers.length === 0 ? (
                <p className="no-data-text">No active drivers found.</p>
              ) : drivers.map(d => (
                <div key={d._id} className="admin-user-row-card" style={{ padding: '16px 20px' }}>
                  <div className="user-profile-info">
                    <div className="passenger-avatar user-avatar-icon" style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>👨‍✈️</div>
                    <div className="user-text-details">
                      <span className="user-email-text" style={{ fontSize: '15px', fontWeight: '700' }}>{d.name}</span>
                      <span className="user-role-badge" style={{ color: 'var(--text-muted)' }}>{d.email} | {d.phone || 'No Phone'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <button 
                      onClick={() => setEditingDriver(d)} 
                      className="edit-driver-row-btn"
                      title="Edit Driver"
                      style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '13px', fontWeight: '700', padding: '6px 12px', borderRadius: '6px', transition: 'all 0.2s' }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteDriver(d._id)} 
                      className="delete-user-row-btn"
                      title="Delete Driver"
                      style={{ padding: '8px' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function DriverDashboard({ isDriver, driverId, showToast }) {
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isDriver || !driverId) return
    fetchBookings()
  }, [isDriver, driverId])

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/driver/bookings/${driverId}`)
      setBookings(response.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/driver/bookings/${bookingId}/status`, { status })
      setBookings(prev => prev.map(b => b._id === bookingId ? response.data : b))
      alert(`Ride marked as ${status}`)
    } catch (err) {
      alert('Failed to update status')
    }
  }

  if (!isDriver) return <div className="center-page-wrapper"><h1>Access Denied</h1></div>

  return (
    <section className="booking-card">
      <h1>Driver Dashboard</h1>
      <p>Assigned Rides</p>
      {isLoading ? <p>Loading...</p> : (
        <div className="booking-list">
          {bookings.map(booking => {
            const customerInit = booking.name ? booking.name.charAt(0).toUpperCase() : 'C'
            const statusClass = booking.status ? booking.status.toLowerCase() : 'pending'
            
            return (
              <div key={booking._id} className={`booking-item admin-booking-card ${statusClass}`} style={{ padding: '24px' }}>
                {/* Header with Avatar and Status */}
                <div className="admin-booking-header">
                  <div className="passenger-info">
                    <div className="passenger-avatar" style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}>{customerInit}</div>
                    <div>
                      <h3>{booking.name}</h3>
                      <span className="passenger-email">Ph: {booking.phoneNo}</span>
                    </div>
                  </div>
                  <span className={`status-pill ${statusClass}`}>{booking.status || 'Pending'}</span>
                </div>

                {/* Route Flow */}
                <div className="admin-booking-route">
                  <div className="route-stop pickup">
                    <span className="route-dot start"></span>
                    <div className="route-details">
                      <span className="route-label">Pickup Location</span>
                      <span className="route-text">{booking.pickup}</span>
                    </div>
                  </div>
                  <div className="route-line-connector"></div>
                  <div className="route-stop drop">
                    <span className="route-dot end"></span>
                    <div className="route-details">
                      <span className="route-label">Drop Destination</span>
                      <span className="route-text">{booking.destination}</span>
                    </div>
                  </div>
                </div>

                {/* Verification Checklists */}
                <div className="admin-booking-checklists" style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                  <div className="checklist-item">
                    <span className="checklist-label">Ride Verification Status:</span>
                    <div className="checklist-badges">
                      <span className={`completion-badge ${booking.passengerCompleted ? 'checked' : 'pending'}`}>
                        Passenger {booking.passengerCompleted ? '✓' : '✗'}
                      </span>
                      <span className={`completion-badge ${booking.driverCompleted ? 'checked' : 'pending'}`}>
                        Driver {booking.driverCompleted ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Driver Actions */}
                {booking.status !== 'Completed' && (
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.2rem' }}>
                    <button 
                      className="primary-btn form-btn complete-ride-btn" 
                      style={{ flex: 1, background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }} 
                      onClick={() => handleUpdateStatus(booking._id, 'Ongoing')}
                    >
                      Start Ride
                    </button>
                    <button 
                      className="primary-btn form-btn complete-ride-btn" 
                      style={{ flex: 1 }} 
                      onClick={() => handleUpdateStatus(booking._id, 'Completed')}
                      disabled={booking.driverCompleted}
                    >
                      {booking.driverCompleted ? '✓ Waiting...' : 'Complete Ride'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
          {bookings.length === 0 && <p>No rides assigned yet.</p>}
        </div>
      )}
    </section>
  )
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true')
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '')
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true')
  const [isDriver, setIsDriver] = useState(localStorage.getItem('isDriver') === 'true')
  const [driverId, setDriverId] = useState(localStorage.getItem('driverId') || '')
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserEmail('')
    setIsAdmin(false)
    setIsDriver(false)
    setDriverId('')
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('isDriver')
    localStorage.removeItem('driverId')
    navigate('/')
  }

  return (
    <main className="app">
      <LightRaysBackground />
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} isLoggedIn={isLoggedIn} handleLogout={handleLogout} isAdmin={isAdmin} isDriver={isDriver} />

      <div className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/booking" element={<BookingPage isLoggedIn={isLoggedIn} userEmail={userEmail} showToast={showToast} />} />
          <Route path="/my-booking" element={<MyBookingPage isLoggedIn={isLoggedIn} userEmail={userEmail} showToast={showToast} />} />
          <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} setUserEmail={setUserEmail} setIsAdmin={setIsAdmin} setIsDriver={setIsDriver} setDriverId={setDriverId} showToast={showToast} />} />
          <Route path="/signup" element={<SignupPage setIsLoggedIn={setIsLoggedIn} setUserEmail={setUserEmail} showToast={showToast} />} />
          <Route path="/admin" element={<AdminDashboard isAdmin={isAdmin} showToast={showToast} />} />
          <Route path="/driver-dashboard" element={<DriverDashboard isDriver={isDriver} driverId={driverId} showToast={showToast} />} />
        </Routes>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <Footer />
    </main>
  )
}

export default App
