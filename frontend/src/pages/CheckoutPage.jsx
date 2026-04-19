import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { fmt } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [payLoading, setPayLoading] = useState(false)

  if (!state?.service) {
    navigate('/services')
    return null
  }

  const { service, date, timeSlot, address, city,
    pincode, notes, userId, userName, userPhone } = state

  // Handle both 'time' and 'timeSlot' for backward compatibility
  const finalTimeSlot = timeSlot || state.time

  const originalAmount = service.price
  const discount = coupon?.discount || 0
  const finalAmount = Math.max(originalAmount - discount, 0)

  const applyCoupon = async () => {
    if (!couponCode.trim()) return toast.error('Enter a coupon code')
    setCouponLoading(true)
    setCouponError('')
    setCoupon(null)
    try {
      const { data } = await api.post('/admin/coupon/apply', {
        code: couponCode,
        amount: originalAmount
      })
      setCoupon(data)
      toast.success(`Coupon applied! You save ${fmt(data.discount)}`)
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid coupon code'
      setCouponError(msg)
      toast.error(msg)
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  const handlePayment = async () => {
    console.log('Payment button clicked')
    setPayLoading(true)

    // Check if Razorpay key is available
    if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
      toast.error('Payment configuration missing. Please contact support.')
      setPayLoading(false)
      return
    }

    try {
      console.log('Creating payment order...')
      const orderRes = await api.post('/payment/create-order', {
        amount: finalAmount,
        receipt: `booking_${Date.now()}`
      })

      console.log('Order created:', orderRes.data)

      if (!orderRes.data || !orderRes.data.id) {
        toast.error('Failed to create payment order. Please try again.')
        setPayLoading(false)
        return
      }

      if (!window.Razorpay) {
        toast.error('Payment system not loaded. Please refresh and try again.')
        setPayLoading(false)
        return
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderRes.data.amount,
        currency: 'INR',
        name: 'ServeNow',
        description: service.name,
        order_id: orderRes.data.id,
        prefill: {
          name: userName,
          contact: userPhone
        },
        theme: { color: '#7C3AED' },
        handler: async (response) => {
          console.log('Payment completed, response:', response)
          try {
            console.log('Verifying payment...')
            const verify = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingData: {
                userId,
                serviceId: service._id,
                date,
                timeSlot: finalTimeSlot,
                address,
                city,
                pincode,
                notes,
                totalAmount: finalAmount,
                couponCode: coupon?.code || null,
                discount: discount
              }
            })

            console.log('Verification response:', verify.data)

            if (verify.data && verify.data.success && verify.data.booking) {
              toast.success('Payment successful! Booking confirmed.')
              console.log('Saving booking data to sessionStorage and navigating...')
              window.sessionStorage.setItem('serveNowBooking', JSON.stringify(verify.data.booking))
              navigate('/confirmation', {
                state: { booking: verify.data.booking }
              })
            } else {
              toast.error('Payment verification failed. Please contact support.')
              console.error('Verification response:', verify.data)
              setPayLoading(false)
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            toast.error('Payment verification failed. Please contact support.')
            setPayLoading(false)
          }
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed')
            setPayLoading(false)
          }
        }
      }

      console.log('Opening Razorpay modal...')
      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (response) => {
        console.error('Payment failed:', response)
        toast.error('Payment failed. Please try again.')
        setPayLoading(false)
      })
      rzp.open()
    } catch (error) {
      console.error('Payment initialization error:', error)
      toast.error('Could not start payment. Please try again.')
      setPayLoading(false)
    }
  }

  return (
    <>
      <div className="checkout-container">
        <div className="checkout-wrapper">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="checkout-title">Secure Checkout</h1>
            <p className="checkout-subtitle">Complete your booking with secure payment</p>
          </div>

          {/* Booking Summary Card */}
          <div className="card">
            <div className="card-header">
              <div className="step-badge">1</div>
              <h2 className="card-title">Booking Summary</h2>
            </div>

            <div className="service-info">
              <div className="service-icon">
                {service.category === 'salon' ? '💇' : 
                 service.category === 'cleaning' ? '🧹' : 
                 service.category === 'repair' ? '🔧' : 
                 service.category === 'plumbing' ? '🚰' : '⚡'}
              </div>
              <div>
                <p className="service-name">{service.name}</p>
                <p className="service-category">{service.category} • {service.duration} mins</p>
              </div>
            </div>

            <div className="details-list">
              <div className="detail-row">
                <span className="detail-label">Date</span>
                <span className="detail-value">{date}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Time</span>
                <span className="detail-value">{finalTimeSlot}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Address</span>
                <span className="detail-value">{address}, {city} - {pincode}</span>
              </div>
            </div>
          </div>

          {/* Coupon Card */}
          <div className="card">
            <div className="card-header">
              <div className="step-badge">2</div>
              <h2 className="card-title">Apply Coupon</h2>
            </div>

            {!coupon ? (
              <>
                <div className="coupon-input-group">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={e => {
                      setCouponCode(e.target.value.toUpperCase())
                      setCouponError('')
                    }}
                    className="coupon-input"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading}
                    className="apply-btn"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
                {couponError && (
                  <p className="error-msg">⚠️ {couponError}</p>
                )}
              </>
            ) : (
              <div className="coupon-applied">
                <div className="coupon-applied-content">
                  <div className="check-icon">✓</div>
                  <div>
                    <p className="coupon-code">{coupon.code}</p>
                    <p className="coupon-desc">
                      {coupon.type === 'percent'
                        ? `${coupon.value}% off applied`
                        : `₹${coupon.value} off applied`}
                    </p>
                  </div>
                </div>
                <button onClick={removeCoupon} className="remove-coupon">Remove</button>
              </div>
            )}
          </div>

          {/* Price Details Card */}
          <div className="card">
            <h2 className="card-title">Price Details</h2>

            <div className="price-list">
              <div className="price-row">
                <span className="price-label">Service charge</span>
                <span className="price-amount">{fmt(originalAmount)}</span>
              </div>

              {coupon && (
                <div className="price-row discount">
                  <span className="price-label">Coupon discount</span>
                  <span className="price-amount">- {fmt(discount)}</span>
                </div>
              )}

              <div className="price-row">
                <span className="price-label">Platform fee</span>
                <span className="price-amount free">FREE</span>
              </div>

              <div className="price-total">
                <span className="total-label">Total Payable</span>
                <div className="total-amount">
                  {coupon && <span className="original-price">{fmt(originalAmount)}</span>}
                  <span className="final-price">{fmt(finalAmount)}</span>
                </div>
              </div>

              {coupon && (
                <div className="savings-banner">
                  🎉 You saved {fmt(discount)}!
                </div>
              )}
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="back-btn"
          >
            ← Back to Booking
          </button>

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={payLoading}
            className="pay-btn"
          >
            {payLoading ? 'Processing...' : `Pay ${fmt(finalAmount)} via UPI / Card`}
          </button>

          <p className="security-text">
            🔒 Secured by Razorpay. Your payment info is encrypted.
          </p>
        </div>
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .checkout-container {
          min-height: 100vh;
          background: #f8fafc;
          padding: 2rem 1rem;
        }

        .checkout-wrapper {
          max-width: 600px;
          margin: 0 auto;
        }

        /* Header */
        .checkout-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .checkout-subtitle {
          font-size: 0.875rem;
          color: #64748b;
        }

        /* Cards */
        .card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1.25rem;
          margin-bottom: 1rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .step-badge {
          width: 1.5rem;
          height: 1.5rem;
          background: #7c3aed;
          color: white;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .card-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #334155;
        }

        /* Service Info */
        .service-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-bottom: 0.75rem;
          margin-bottom: 0.75rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .service-icon {
          width: 2.5rem;
          height: 2.5rem;
          background: #ede9fe;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .service-name {
          font-weight: 600;
          color: #1e293b;
          font-size: 0.875rem;
        }

        .service-category {
          font-size: 0.7rem;
          color: #94a3b8;
          text-transform: capitalize;
        }

        /* Details */
        .details-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .detail-label {
          color: #64748b;
        }

        .detail-value {
          color: #334155;
          font-weight: 500;
          text-align: right;
          max-width: 60%;
        }

        /* Coupon */
        .coupon-input-group {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .coupon-input {
          flex: 1;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          outline: none;
          text-transform: uppercase;
        }

        .coupon-input:focus {
          border-color: #7c3aed;
          ring: 2px solid #7c3aed;
        }

        .apply-btn {
          padding: 0.5rem 1rem;
          background: #7c3aed;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .apply-btn:hover {
          background: #6d28d9;
        }

        .error-msg {
          color: #ef4444;
          font-size: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .coupons-list {
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: #f5f3ff;
          border-radius: 0.5rem;
        }

        .coupons-title {
          font-size: 0.7rem;
          font-weight: 600;
          color: #6d28d9;
          margin-bottom: 0.5rem;
        }

        .coupon-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .coupon-btn {
          font-size: 0.7rem;
          background: white;
          border: 1px solid #ddd6fe;
          color: #6d28d9;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-family: monospace;
          cursor: pointer;
          transition: all 0.2s;
        }

        .coupon-btn:hover {
          background: #ede9fe;
        }

        .coupon-applied {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 0.5rem;
          padding: 0.75rem;
        }

        .coupon-applied-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .check-icon {
          width: 1.5rem;
          height: 1.5rem;
          background: #22c55e;
          color: white;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
        }

        .coupon-code {
          font-weight: 600;
          color: #166534;
          font-size: 0.875rem;
          font-family: monospace;
        }

        .coupon-desc {
          font-size: 0.7rem;
          color: #15803d;
        }

        .remove-coupon {
          font-size: 0.7rem;
          color: #ef4444;
          background: none;
          border: none;
          cursor: pointer;
        }

        .remove-coupon:hover {
          text-decoration: underline;
        }

        /* Price Details */
        .price-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .price-label {
          color: #64748b;
        }

        .price-amount {
          color: #334155;
          font-weight: 500;
        }

        .price-row.discount .price-amount {
          color: #16a34a;
        }

        .price-amount.free {
          color: #16a34a;
        }

        .price-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #e2e8f0;
          padding-top: 0.75rem;
          margin-top: 0.25rem;
        }

        .total-label {
          font-weight: 600;
          color: #1e293b;
        }

        .total-amount {
          text-align: right;
        }

        .original-price {
          font-size: 0.7rem;
          color: #94a3b8;
          text-decoration: line-through;
          display: block;
        }

        .final-price {
          font-weight: 700;
          font-size: 1.125rem;
          color: #7c3aed;
        }

        .savings-banner {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: #f0fdf4;
          border-radius: 0.5rem;
          text-align: center;
          font-size: 0.75rem;
          color: #16a34a;
          font-weight: 500;
        }

        /* Back Button */
        .back-btn {
          width: 100%;
          padding: 0.75rem;
          background: white;
          color: #64748b;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .back-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #475569;
        }

        /* Pay Button */
        .pay-btn {
          width: 100%;
          padding: 0.75rem;
          background: #7c3aed;
          color: white;
          border: none;
          border-radius: 0.75rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 0.5rem;
        }

        .pay-btn:hover {
          background: #6d28d9;
        }

        .pay-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Security Text */
        .security-text {
          text-align: center;
          font-size: 0.7rem;
          color: #94a3b8;
          margin-top: 1rem;
        }
      `}</style>
    </>
  )
}