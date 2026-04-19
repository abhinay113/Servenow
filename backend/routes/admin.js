const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Service = require('../models/Service');

// ─── Stats ────────────────────────────────────────────────────────────────────
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

// ─── Coupons ──────────────────────────────────────────────────────────────────
const coupons = [
  { code: 'SAVE10',   discount: 10,  type: 'percent' },
  { code: 'FLAT100',  discount: 100, type: 'flat'    },
  { code: 'FIRST50',  discount: 50,  type: 'percent' },
  { code: 'SERVENOW', discount: 200, type: 'flat'    },
];

router.post('/coupon/apply', (req, res) => {
  const { code, amount } = req.body;

  if (!code || !amount)
    return res.status(400).json({ error: 'code and amount are required' });

  const coupon = coupons.find(c => c.code === code.toUpperCase().trim());
  if (!coupon)
    return res.status(404).json({ error: 'Invalid coupon code' });

  let discount = 0;
  if (coupon.type === 'percent') {
    discount = Math.round((amount * coupon.discount) / 100);
  } else {
    discount = coupon.discount;
  }

  const finalAmount = Math.max(amount - discount, 0);

  res.json({
    success:     true,
    code:        coupon.code,
    discount,
    finalAmount,
    type:        coupon.type,
    value:       coupon.discount
  });
});

module.exports = router;