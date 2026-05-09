const express = require('express');
const {
    getAllBookings,
    getBookingById,
    createBooking,
    updateBookingStatus,
    deleteBooking,
} = require('../controllers/courts.controller');

const router = express.Router();

router.get('/', getAllBookings);
router.post('/', createBooking);
router.get('/:id', getBookingById);
router.patch('/:id/status', updateBookingStatus);
router.delete('/:id', deleteBooking);

module.exports = router;
