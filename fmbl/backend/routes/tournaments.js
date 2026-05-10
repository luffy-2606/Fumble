const express = require('express');
const {
    getAllTournaments,
    getTournamentById,
    createTournament,
    updateTournamentStatus,
    registerTeam,
    updateRegistrationStatus,
    deleteTournament,
} = require('../controllers/tournaments.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require login
router.use(protect);

router.patch('/registrations/:reg_id/status', authorize('admin'), updateRegistrationStatus); // admin only
router.get('/', getAllTournaments);
router.post('/', createTournament);                                   // students + admin
router.get('/:id', getTournamentById);
router.patch('/:id/status', authorize('admin'), updateTournamentStatus); // admin only
router.post('/:id/register', registerTeam);
router.delete('/:id', authorize('admin'), deleteTournament);          // admin only

module.exports = router;
