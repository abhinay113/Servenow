const crypto = require('crypto');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
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
    console.log('Payment verification request received:', req.body);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingData } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingData) {
      console.error('Missing required payment verification fields');
      return res.status(400).json({ success: false, error: 'Missing required payment data' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      console.error('Invalid payment signature');
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }

    // Prepare booking data, excluding fields not in schema
    const bookingDataToSave = {
      userId: bookingData.userId,
      serviceId: bookingData.serviceId,
      date: bookingData.date,
      timeSlot: bookingData.timeSlot,
      address: bookingData.address,
      city: bookingData.city,
      pincode: bookingData.pincode,
      notes: bookingData.notes,
      totalAmount: bookingData.totalAmount,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentOrderId: razorpay_order_id,
      paymentId: razorpay_payment_id
    };

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(bookingDataToSave.userId)) {
      console.error('Invalid userId:', bookingDataToSave.userId);
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(bookingDataToSave.serviceId)) {
      console.error('Invalid serviceId:', bookingDataToSave.serviceId);
      return res.status(400).json({ success: false, error: 'Invalid service ID' });
    }

    console.log('Creating booking with data:', bookingDataToSave);

    const booking = await Booking.create(bookingDataToSave);

    console.log('Booking created successfully:', booking._id);

    res.json({ success: true, booking });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ error: err.message, details: err.stack });
  }
};