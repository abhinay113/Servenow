const crypto = require('crypto');
const Razorpay = require('razorpay');
const Booking = require('../models/Booking');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    const order = await razorpay.orders.create({
      amount:   Math.round(amount * 100),
      currency,
      receipt:  receipt || `order_${Date.now()}`
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create payment order', details: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingData } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature)
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });

    const booking = await Booking.create({
      ...bookingData,
      status:          'confirmed',
      paymentStatus:   'paid',
      paymentOrderId:  razorpay_order_id,
      paymentId:       razorpay_payment_id
    });

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};