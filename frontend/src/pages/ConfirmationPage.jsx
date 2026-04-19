import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { fmt, formatDate, formatTime } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function ConfirmationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Prefer state from navigation, but fall back to session storage after refresh
    if (location.state?.booking) {
      console.log('Booking data received from location state:', location.state.booking)
      setBooking(location.state.booking)
      setLoading(false)
      window.sessionStorage.setItem('serveNowBooking', JSON.stringify(location.state.booking))
    } else {
      const storedBooking = window.sessionStorage.getItem('serveNowBooking')
      if (storedBooking) {
        console.log('Booking data loaded from sessionStorage')
        setBooking(JSON.parse(storedBooking))
      }
      setLoading(false)
    }
  }, [location.state])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="confirmation-card max-w-xl bg-white rounded-3xl p-8 text-center shadow-lg border border-slate-200">
          <div className="text-6xl mb-5">⚠️</div>
          <h1 className="text-2xl font-bold mb-3">Confirmation not found</h1>
          <p className="text-slate-600 mb-6">
            We could not retrieve your booking details. If you just completed payment, try refreshing this page once or visit your bookings.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row justify-center">
            <button onClick={() => navigate('/bookings')} className="btn-primary">
              View My Bookings
            </button>
            <button onClick={() => navigate('/')} className="btn-secondary">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="confirmation-page">
      <div className="confirmation-card">
        {/* Success Icon */}
        <div className="success-icon">
          <span>✅</span>
        </div>

        {/* Title */}
        <h1 className="title">Booking Confirmed!</h1>
        <p className="subtitle">Your payment was successful.</p>

        {/* Booking ID */}
        <div className="booking-id-wrapper">
          <p className="booking-id-label">Booking ID</p>
          <p className="booking-id-value">{booking?._id || booking?.bookingId || 'N/A'}</p>
        </div>

        {/* Message */}
        <div className="message-box">
          <svg className="message-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>A professional will contact you before arriving at your location.</p>
        </div>

        {/* Buttons */}
        <div className="button-group">
          <button onClick={() => navigate('/bookings')} className="btn-primary">
            View My Bookings
          </button>
          <button onClick={() => navigate('/')} className="btn-secondary">
            Back to Home
          </button>
        </div>
      </div>

      <style>{`
        .confirmation-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .confirmation-card {
          max-width: 28rem;
          width: 100%;
          background: white;
          border-radius: 1.5rem;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
          border: 1px solid #f1f5f9;
          text-align: center;
        }

        /* Success Icon */
        .success-icon {
          width: 4rem;
          height: 4rem;
          background: #dcfce7;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .success-icon span {
          font-size: 2rem;
        }

        /* Typography */
        .title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: #64748b;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }

        /* Booking ID */
        .booking-id-wrapper {
          background: #f8fafc;
          border-radius: 0.75rem;
          padding: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .booking-id-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          margin-bottom: 0.25rem;
        }

        .booking-id-value {
          font-family: monospace;
          font-size: 0.875rem;
          font-weight: 600;
          color: #1e293b;
        }

        /* Message Box */
        .message-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          margin-bottom: 1.5rem;
          text-align: left;
        }

        .message-icon {
          width: 1.25rem;
          height: 1.25rem;
          color: #16a34a;
          flex-shrink: 0;
        }

        .message-box p {
          font-size: 0.75rem;
          color: #166534;
          line-height: 1.4;
        }

        /* Buttons */
        .button-group {
          display: flex;
          gap: 0.75rem;
        }

        .btn-primary {
          flex: 1;
          background: #7c3aed;
          color: white;
          padding: 0.625rem 1rem;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 0.875rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary:hover {
          background: #6d28d9;
        }

        .btn-secondary {
          flex: 1;
          background: white;
          color: #64748b;
          padding: 0.625rem 1rem;
          border-radius: 0.75rem;
          font-weight: 500;
          font-size: 0.875rem;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        /* Responsive */
        @media (max-width: 480px) {
          .confirmation-card {
            padding: 1.5rem;
          }
          
          .button-group {
            flex-direction: column;
          }
          
          .title {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  )
}