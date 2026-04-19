import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import { today, fmt } from '../utils/helpers'
import BookingSteps from '../components/BookingSteps'
import SlotPicker from '../components/SlotPicker'
import toast from 'react-hot-toast'

export default function BookingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [service, setService] = useState(null)
  const [step, setStep] = useState(1)
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSlot] = useState('')
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [form, setForm] = useState({ address: '', city: '', pincode: '', notes: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { 
      toast.error('Please sign in to book')
      navigate('/login')
      return 
    }
    setLoading(true)
    api.get(`/services/${id}`)
      .then(r => setService(r.data))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!date || !id) return
    setSlotsLoading(true)
    api.get(`/slots?date=${date}&serviceId=${id}`)
      .then(r => setSlots(r.data))
      .finally(() => setSlotsLoading(false))
  }, [date, id])

  const handleStep1 = () => {
    if (!date) return toast.error('Please select a date')
    if (!selectedSlot) return toast.error('Please select a time slot')
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStep2 = () => {
    if (!form.address) return toast.error('Please enter your address')
    if (!form.city) return toast.error('Please enter your city')
    if (!form.pincode) return toast.error('Please enter your pincode')
    if (!/^\d{6}$/.test(form.pincode)) return toast.error('Enter a valid 6-digit pincode')

    // Navigate to CheckoutPage with all data
    navigate('/checkout', {
      state: {
        service,
        date,
        time: selectedSlot,
        address: form.address,
        city: form.city,
        pincode: form.pincode,
        notes: form.notes,
        userId: user._id,
        userName: user.name,
        userPhone: user.phone,
        totalPrice: service.price
      }
    })
  }

  const bookingData = {
    userId: user?._id,
    serviceId: id,
    date,
    timeSlot: selectedSlot,
    totalAmount: service?.price,
    userName: user?.name,
    userEmail: user?.email,
    userPhone: user?.phone,
    ...form
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <p className="loading-text">Loading booking details...</p>
        </div>
        <style>{`
          .loading-container {
            min-height: 60vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .loading-spinner {
            text-align: center;
          }
          .spinner-ring {
            width: 3rem;
            height: 3rem;
            border: 3px solid #e2e8f0;
            border-top-color: #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .loading-text {
            color: #64748b;
          }
        `}</style>
      </div>
    )
  }

  if (!service) return null

  return (
    <div className="booking-page">
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <button onClick={() => navigate(`/services/${id}`)} className="back-button">
            <svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Service
          </button>
          
          <div className="service-summary">
            <div className="service-icon">{service.category === 'salon' ? '💇' : service.category === 'cleaning' ? '🧹' : '🔧'}</div>
            <div>
              <h1 className="page-title">Book: {service.name}</h1>
              <p className="page-subtitle">Complete your booking in 3 easy steps</p>
            </div>
          </div>
        </div>

        <BookingSteps current={step} />

        {/* Step 1 — Date & Slot */}
        {step === 1 && (
          <div className="step-card animate-fade-in">
            <div className="step-header">
              <div className="step-number-badge">1</div>
              <h2 className="step-title">Choose Date & Time</h2>
              <p className="step-description">Select your preferred date and available time slot</p>
            </div>

            <div className="step-content">
              <div className="date-section">
                <label className="form-label">
                  <svg className="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Select Date
                </label>
                <input
                  type="date"
                  min={today()}
                  value={date}
                  onChange={e => { setDate(e.target.value); setSlot('') }}
                  className="date-input"
                />
              </div>

              {date && (
                <div className="slots-section">
                  <label className="form-label">
                    <svg className="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Select Time Slot
                  </label>
                  {slotsLoading ? (
                    <div className="slots-loading">
                      <div className="dots-loading">
                        <span></span><span></span><span></span>
                      </div>
                      <p>Checking availability...</p>
                    </div>
                  ) : (
                    <SlotPicker slots={slots} selected={selectedSlot} onSelect={setSlot} />
                  )}
                </div>
              )}
            </div>

            <div className="step-actions">
              <button onClick={handleStep1} className="btn-continue">
                Continue to Details
                <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Address */}
        {step === 2 && (
          <div className="step-card animate-fade-in">
            <div className="step-header">
              <div className="step-number-badge">2</div>
              <h2 className="step-title">Your Details</h2>
              <p className="step-description">We need your address to provide the service</p>
            </div>

            <div className="step-content">
              <div className="form-group">
                <label className="form-label">
                  <svg className="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Full Address
                </label>
                <textarea
                  rows={3}
                  placeholder="Flat No, Building Name, Street, Landmark"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="address-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    placeholder="Enter your city"
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    placeholder="600001"
                    maxLength={6}
                    value={form.pincode}
                    onChange={e => setForm({ ...form, pincode: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <svg className="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Special Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Any special requests or instructions"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="step-actions dual-actions">
              <button onClick={() => setStep(1)} className="btn-back">
                <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              <button onClick={handleStep2} className="btn-pay">
                Proceed to Payment
                <span className="price-badge">{fmt(service.price)}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .booking-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 2rem 1rem;
        }

        .page-container {
          max-width: 800px;
          margin: 0 auto;
        }

        /* Header */
        .page-header {
          margin-bottom: 2rem;
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 2rem;
          color: #64748b;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 1.5rem;
        }

        .back-button:hover {
          border-color: #667eea;
          color: #667eea;
          transform: translateX(-4px);
        }

        .back-icon {
          width: 1rem;
          height: 1rem;
        }

        .service-summary {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .service-icon {
          width: 3rem;
          height: 3rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .page-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .page-subtitle {
          font-size: 0.875rem;
          color: #64748b;
        }

        /* Step Card */
        .step-card {
          background: white;
          border-radius: 1.5rem;
          box-shadow: 0 20px 35px -8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .step-header {
          padding: 1.5rem 1.5rem 0 1.5rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .step-number-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-weight: 700;
          border-radius: 0.75rem;
          margin-bottom: 1rem;
        }

        .step-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .step-description {
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 1rem;
        }

        .step-content {
          padding: 1.5rem;
        }

        /* Form Styles */
        .date-section, .slots-section {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 0.5rem;
        }

        .label-icon {
          width: 1rem;
          height: 1rem;
          color: #667eea;
        }

        .date-input, .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 1rem;
          font-size: 0.875rem;
          transition: all 0.3s ease;
        }

        .date-input:focus, .form-input:focus, .address-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .address-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 1rem;
          font-size: 0.875rem;
          resize: vertical;
          transition: all 0.3s ease;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        /* Slots Grid */
        .slots-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }

        @media (min-width: 640px) {
          .slots-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .slot-button {
          padding: 0.625rem 0.75rem;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          border: 2px solid #e2e8f0;
          background: white;
          color: #334155;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .slot-button:hover:not(.slot-disabled) {
          border-color: #667eea;
          color: #667eea;
          transform: translateY(-1px);
        }

        .slot-disabled {
          background: #f8fafc;
          color: #94a3b8;
          border-color: #f1f5f9;
          cursor: not-allowed;
          text-decoration: line-through;
        }

        .slot-selected {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: #667eea;
          box-shadow: 0 4px 12px -2px rgba(102, 126, 234, 0.3);
        }

        .slot-available {
          background: white;
          color: #334155;
          border-color: #e2e8f0;
        }

        .no-slots-text {
          color: #94a3b8;
          font-size: 0.875rem;
          text-align: center;
          padding: 2rem;
        }

        /* Step Actions */
        .step-actions {
          padding: 1.5rem;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }

        .dual-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-continue {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 1rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-continue:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(102, 126, 234, 0.4);
          gap: 0.75rem;
        }

        .btn-back {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 1rem;
          color: #64748b;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-back:hover {
          border-color: #667eea;
          color: #667eea;
          transform: translateX(-4px);
        }

        .btn-pay {
          flex: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0.875rem;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border: none;
          border-radius: 1rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-pay:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.4);
        }

        .price-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.5rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
        }

        .btn-icon {
          width: 1rem;
          height: 1rem;
        }

        /* Responsive */
        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }
          
          .dual-actions {
            flex-direction: column;
          }
          
          .step-header {
            padding: 1rem 1rem 0 1rem;
          }
          
          .step-content {
            padding: 1rem;
          }
          
          .step-actions {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  )
}