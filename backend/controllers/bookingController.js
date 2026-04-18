const Booking = require('../models/Booking');
const BlockedSlot = require('../models/BlockedSlot');
const Service = require('../models/Service');

function generateSlots(start, end, duration) {
  const slots = [];
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let current = sh * 60 + sm;
  const endMin = eh * 60 + em;
  while (current + duration <= endMin) {
    const h = Math.floor(current / 60).toString().padStart(2, '0');
    const m = (current % 60).toString().padStart(2, '0');
    slots.push(`${h}:${m}`);
    current += duration;
  }
  return slots;
}

exports.getSlots = async (req, res) => {
  try {
    const { date, serviceId } = req.query;
    if (!date || !serviceId)
      return res.status(400).json({ error: 'date and serviceId are required' });

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    const allSlots = generateSlots(
      service.workingHours.start,
      service.workingHours.end,
      service.slotDuration
    );

    const booked = await Booking.find({
      serviceId, date, status: { $in: ['pending', 'confirmed'] }
    }).select('timeSlot');
    const bookedTimes = booked.map(b => b.timeSlot);

    const blocked = await BlockedSlot.find({ serviceId, date }).select('timeSlot');
    const blockedTimes = blocked.map(b => b.timeSlot);

    const result = allSlots.map(slot => ({
      time: slot,
      available: !bookedTimes.includes(slot) && !blockedTimes.includes(slot)
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId })
      .populate('serviceId')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('serviceId')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.blockSlot = async (req, res) => {
  try {
    const { serviceId, date, timeSlot } = req.body;
    await BlockedSlot.create({ serviceId, date, timeSlot });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.unblockSlot = async (req, res) => {
  try {
    const { serviceId, date, timeSlot } = req.body;
    await BlockedSlot.deleteOne({ serviceId, date, timeSlot });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};