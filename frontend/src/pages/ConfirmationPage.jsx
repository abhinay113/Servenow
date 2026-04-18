import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { fmt, formatDate, formatTime } from '../utils/helpers'

export default function ConfirmationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)

  useEffect(() => {
    api.get(`/bookings/user/null`).catch(() => {})
    // Fetch booking directly by populating from bookings list
    // Simple approach: store in state passed from PaymentModal via navigate
  }, [])

  return (
    <div className="max-w-lg mx-auto px-6 py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl mx-auto mb-6">✅</div>
      <h1 className="text-3xl font-bold text-slate-800 font-display mb-3">Booking Confirmed!</h1>
      <p className="text-slate-500 mb-2">Your payment was successful.</p>
      <p className="text-sm text-slate-400 mb-8">Booking ID: <span className="font-mono text-slate-600">{id}</span></p>

      <div className="bg-green-50 border border-green-100 rounded-xl p-5 text-sm text-green-700 mb-8">
        A professional will contact you before arriving at your location.
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={() => navigate('/bookings')}
          className="bg-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-violet-700 transition"
        >
          View My Bookings
        </button>
        <button
          onClick={() => navigate('/')}
          className="border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-medium hover:bg-slate-50 transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}