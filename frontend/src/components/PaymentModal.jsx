import { useState } from 'react'
import { fmt } from '../utils/helpers'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function PaymentModal({ booking, service, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false)

  const handlePay = async () => {
    setLoading(true)
    try {
      const order = await api.post('/payment/create-order', {
        amount: service.price,
        receipt: `booking_${Date.now()}`
      })

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.data.amount,
        currency: 'INR',
        name: 'ServeNow',
        description: service.name,
        order_id: order.data.id,
        prefill: {
          name: booking.userName,
          contact: booking.userPhone,
          email: booking.userEmail
        },
        theme: { color: '#7C3AED' },
        handler: async (response) => {
          const verify = await api.post('/payment/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            bookingData: booking
          })
          if (verify.data.success) {
            toast.success('Payment successful! Booking confirmed.')
            onSuccess(verify.data.booking)
          } else {
            toast.error('Payment verification failed.')
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', () => toast.error('Payment failed. Please try again.'))
      rzp.open()
    } catch (err) {
      toast.error('Could not initiate payment. Check your Razorpay keys.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal-container" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="header-icon">
            <svg className="payment-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h2 className="modal-title">Payment Summary</h2>
          <p className="modal-subtitle">Review your booking details</p>
          <button onClick={onClose} className="close-btn">
            <svg className="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Booking Details */}
        <div className="booking-details-card">
          <div className="service-badge">
            <span className="service-icon">✨</span>
            <span className="service-name">{service.name}</span>
          </div>

          <div className="details-list">
            <div className="detail-item">
              <div className="detail-icon-wrapper">
                <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="detail-content">
                <span className="detail-label">Date</span>
                <span className="detail-value">{booking.date}</span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon-wrapper">
                <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="detail-content">
                <span className="detail-label">Time Slot</span>
                <span className="detail-value">{booking.timeSlot}</span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon-wrapper">
                <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="detail-content">
                <span className="detail-label">Address</span>
                <span className="detail-value">{booking.address}, {booking.city} - {booking.pincode}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="price-breakdown">
          <div className="price-row">
            <span>Service Charge</span>
            <span>{fmt(service.price)}</span>
          </div>
          <div className="price-row">
            <span>GST (18%)</span>
            <span>{fmt(service.price * 0.18)}</span>
          </div>
          <div className="price-row discount">
            <span>Discount</span>
            <span>- {fmt(0)}</span>
          </div>
          <div className="price-row total">
            <span>Total Amount</span>
            <span>{fmt(service.price + (service.price * 0.18))}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="payment-methods">
          <p className="methods-title">Secure Payment Options</p>
          <div className="methods-icons">
            <div className="method-badge">UPI</div>
            <div className="method-badge">Card</div>
            <div className="method-badge">NetBanking</div>
            <div className="method-badge">Wallet</div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="security-notice">
          <svg className="security-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <p className="security-title">100% Secure Payments</p>
            <p className="security-text">Your payment information is encrypted and secure</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button onClick={handlePay} disabled={loading} className="pay-btn">
            {loading ? (
              <>
                <div className="btn-spinner"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Pay {fmt(service.price + (service.price * 0.18))}</span>
                <svg className="btn-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        /* Modal Overlay */
        .payment-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Modal Container */
        .payment-modal-container {
          background: white;
          border-radius: 2rem;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Custom Scrollbar */
        .payment-modal-container::-webkit-scrollbar {
          width: 6px;
        }

        .payment-modal-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .payment-modal-container::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
        }

        /* Modal Header */
        .modal-header {
          text-align: center;
          padding: 2rem 2rem 1rem 2rem;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 2rem 2rem 0 0;
          position: relative;
        }

        .header-icon {
          width: 4rem;
          height: 4rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
          }
        }

        .payment-icon {
          width: 2rem;
          height: 2rem;
          color: white;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin-bottom: 0.25rem;
        }

        .modal-subtitle {
          font-size: 0.875rem;
          color: #64748b;
        }

        .close-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: white;
          border: none;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .close-btn:hover {
          background: #fee2e2;
          transform: rotate(90deg);
        }

        .close-icon {
          width: 1rem;
          height: 1rem;
          color: #64748b;
        }

        /* Booking Details Card */
        .booking-details-card {
          padding: 1.5rem;
          margin: 1.5rem;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 1.5rem;
          transition: all 0.3s ease;
        }

        .booking-details-card:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
        }

        .service-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 100%);
          border-radius: 2rem;
          margin-bottom: 1rem;
        }

        .service-icon {
          font-size: 1rem;
        }

        .service-name {
          font-weight: 600;
          color: #667eea;
          font-size: 0.875rem;
        }

        .details-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .detail-icon-wrapper {
          width: 2rem;
          height: 2rem;
          background: #f8fafc;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .detail-icon {
          width: 1rem;
          height: 1rem;
          color: #667eea;
        }

        .detail-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-label {
          font-size: 0.75rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-value {
          font-size: 0.875rem;
          font-weight: 500;
          color: #1e293b;
        }

        /* Price Breakdown */
        .price-breakdown {
          margin: 0 1.5rem 1.5rem 1.5rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 1rem;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          font-size: 0.875rem;
          color: #475569;
        }

        .price-row.discount {
          color: #10b981;
          border-bottom: 1px dashed #e2e8f0;
        }

        .price-row.total {
          margin-top: 0.5rem;
          padding-top: 0.75rem;
          border-top: 2px solid #e2e8f0;
          font-weight: 700;
          font-size: 1rem;
          color: #1e293b;
        }

        /* Payment Methods */
        .payment-methods {
          margin: 0 1.5rem 1.5rem 1.5rem;
          text-align: center;
        }

        .methods-title {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .methods-icons {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .method-badge {
          padding: 0.375rem 0.75rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: #64748b;
          transition: all 0.3s ease;
        }

        .method-badge:hover {
          border-color: #667eea;
          color: #667eea;
          transform: translateY(-2px);
        }

        /* Security Notice */
        .security-notice {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 0 1.5rem 1.5rem 1.5rem;
          padding: 0.75rem;
          background: #f0fdf4;
          border-radius: 1rem;
          border: 1px solid #bbf7d0;
        }

        .security-icon {
          width: 1.5rem;
          height: 1.5rem;
          color: #10b981;
          flex-shrink: 0;
        }

        .security-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: #166534;
          margin-bottom: 0.125rem;
        }

        .security-text {
          font-size: 0.7rem;
          color: #15803d;
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          background: #f8fafc;
          border-radius: 0 0 2rem 2rem;
        }

        .cancel-btn {
          flex: 1;
          padding: 0.875rem;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 1rem;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-btn:hover {
          border-color: #ef4444;
          color: #ef4444;
          transform: translateY(-2px);
        }

        .pay-btn {
          flex: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 1rem;
          font-weight: 700;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .pay-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .pay-btn:hover::before {
          left: 100%;
        }

        .pay-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
          gap: 0.75rem;
        }

        .pay-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-arrow {
          width: 1rem;
          height: 1rem;
          transition: transform 0.3s ease;
        }

        .pay-btn:hover .btn-arrow {
          transform: translateX(4px);
        }

        .btn-spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Responsive */
        @media (max-width: 640px) {
          .payment-modal-container {
            max-width: 95%;
          }
          
          .modal-header {
            padding: 1.5rem 1.5rem 1rem 1.5rem;
          }
          
          .booking-details-card,
          .price-breakdown,
          .payment-methods,
          .security-notice {
            margin-left: 1rem;
            margin-right: 1rem;
          }
          
          .action-buttons {
            padding: 1rem;
            flex-direction: column;
          }
          
          .cancel-btn,
          .pay-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}