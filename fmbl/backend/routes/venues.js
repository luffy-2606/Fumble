const express = require('express');
const {
    getAllVenues,
    getVenueById,
    createVenue,
    updateVenueAvailability,
    deleteVenue,
} = require('../controllers/venues.controller');

const router = express.Router();

router.get('/', getAllVenues);
router.get('/:id', getVenueById);
router.post('/', createVenue);
router.patch('/:id/availability', updateVenueAvailability);
router.delete('/:id', deleteVenue);

module.exports = router;
