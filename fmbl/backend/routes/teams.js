const express = require('express');
const {
    getAllTeams,
    getTeamById,
    createTeam,
    approveTeam,
    addMember,
    removeMember,
    deleteTeam,
    getOpponents,
} = require('../controllers/teams.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require login
router.use(protect);

router.get('/opponents/:sport_id/:team_id', getOpponents);
router.get('/', getAllTeams);
router.post('/', createTeam);                                         // students + admin
router.get('/:id', getTeamById);
router.patch('/:id/approve', authorize('admin'), approveTeam);        // admin only
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);
router.delete('/:id', authorize('admin'), deleteTeam);               // admin only

module.exports = router;
