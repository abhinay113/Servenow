const express = require('express');
const router = express.Router();
const {
  createBooking, getUserBookings,
  getAllBookings, updateBooking
} = require('../controllers/bookingController');

router.post('/',              createBooking);
router.get('/',               getAllBookings);
router.get('/user/:userId',   getUserBookings);
router.patch('/:id',          updateBooking);

module.exports = router;