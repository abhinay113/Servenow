const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Service = require('../models/Service');

router.get('/stats', async (req, res) => {
  try {
    const [total, confirmed, paid, active] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Service.countDocuments({ isActive: true })
    ]);
    res.json({
      totalBookings:  total,
      confirmed,
      revenue:        paid[0]?.total || 0,
      activeServices: active
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;