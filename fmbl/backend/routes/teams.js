const express = require('express');
const {
    getAllTeams,
    getTeamById,
    createTeam,
    addMember,
    removeMember,
    deleteTeam,
    getOpponents,
} = require('../controllers/teams.controller');

const router = express.Router();

router.get('/opponents/:sport_id/:team_id', getOpponents);
router.get('/', getAllTeams);
router.post('/', createTeam);
router.get('/:id', getTeamById);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);
router.delete('/:id', deleteTeam);

module.exports = router;
