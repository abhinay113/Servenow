const express = require('express');
const router = express.Router();
const { getSlots, blockSlot, unblockSlot } = require('../controllers/bookingController');

router.get('/',          getSlots);
router.post('/block',    blockSlot);
router.delete('/block',  unblockSlot);

module.exports = router;