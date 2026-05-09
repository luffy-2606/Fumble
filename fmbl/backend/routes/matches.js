const express = require('express');
const {
    getAllMatches,
    getMatchById,
    createMatch,
    updateMatchResult,
    deleteMatch,
} = require('../controllers/matches.controller');

const router = express.Router();

router.get('/', getAllMatches);
router.post('/', createMatch);
router.patch('/:id/result', updateMatchResult);
router.get('/:id', getMatchById);
router.delete('/:id', deleteMatch);

module.exports = router;
