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

const router = express.Router();

router.patch('/registrations/:reg_id/status', updateRegistrationStatus);
router.get('/', getAllTournaments);
router.post('/', createTournament);
router.get('/:id', getTournamentById);
router.patch('/:id/status', updateTournamentStatus);
router.post('/:id/register', registerTeam);
router.delete('/:id', deleteTournament);

module.exports = router;
