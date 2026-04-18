const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  category:     { type: String, enum: ['salon','cleaning','repair','plumbing','electrical'], required: true },
  description:  { type: String, required: true },
  price:        { type: Number, required: true },
  duration:     { type: Number, required: true },
  rating:       { type: Number, default: 4.5 },
  reviewCount:  { type: Number, default: 0 },
  isActive:     { type: Boolean, default: true },
  slotDuration: { type: Number, default: 60 },
  workingHours: {
    start: { type: String, default: '09:00' },
    end:   { type: String, default: '18:00' }
  }
});

module.exports = mongoose.model('Service', serviceSchema);