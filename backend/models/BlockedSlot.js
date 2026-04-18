const mongoose = require('mongoose');

const blockedSlotSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  date:      { type: String, required: true },
  timeSlot:  { type: String, required: true }
});

module.exports = mongoose.model('BlockedSlot', blockedSlotSchema);