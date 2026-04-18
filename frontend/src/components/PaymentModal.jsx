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
        amount:  service.price,
        receipt: `booking_${Date.now()}`
      })

      const options = {
        key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount:      order.data.amount,
        currency:    'INR',
        name:        'ServeNow',
        description: service.name,
        order_id:    order.data.id,
        prefill: {
          name:    booking.userName,
          contact: booking.userPhone
        },
        theme: { color: '#7C3AED' },
        handler: async (response) => {
          const verify = await api.post('/payment/verify', {
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
            bookingData:         booking
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-xl font-bold text-slate-800 mb-6 font-display">Payment Summary</h2>

        <div className="bg-slate-50 rounded-xl p-5 mb-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Service</span>
            <span className="font-medium text-slate-800">{service.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Date</span>
            <span className="font-medium text-slate-800">{booking.date}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Time</span>
            <span className="font-medium text-slate-800">{booking.timeSlot}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Address</span>
            <span className="font-medium text-slate-800 text-right max-w-[200px]">{booking.address}</span>
          </div>
          <div className="border-t border-slate-200 pt-3 flex justify-between">
            <span className="font-semibold text-slate-800">Total</span>
            <span className="font-bold text-lg text-violet-600">{fmt(service.price)}</span>
          </div>
        </div>

        <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 mb-6 text-sm text-violet-700">
          💳 You will be redirected to Razorpay's secure UPI / card checkout.
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handlePay}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition disabled:opacity-60"
          >
            {loading ? 'Processing...' : `Pay ${fmt(service.price)}`}
          </button>
        </div>
      </div>
    </div>
  )
}