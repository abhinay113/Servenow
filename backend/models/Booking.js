const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  date:            { type: String, required: true },
  timeSlot:        { type: String, required: true },
  address:         { type: String, required: true },
  city:            { type: String, required: true },
  pincode:         { type: String, required: true },
  status:          { type: String, enum: ['pending','confirmed','completed','cancelled'], default: 'pending' },
  paymentStatus:   { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
  paymentOrderId:  { type: String },
  paymentId:       { type: String },
  totalAmount:     { type: Number, required: true },
  notes:           { type: String },
  createdAt:       { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);