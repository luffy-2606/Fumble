const express = require('express');
const {
    getAllPlayers,
    getPlayerById,
    createProfile,
    updateProfile,
    deleteProfile,
} = require('../controllers/players.controller');

const router = express.Router();

router.get('/', getAllPlayers);
router.get('/:id', getPlayerById);
router.post('/', createProfile);
router.put('/:id', updateProfile);
router.delete('/:id', deleteProfile);

module.exports = router;
