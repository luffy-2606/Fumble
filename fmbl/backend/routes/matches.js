const express = require('express');
const {
    getAllMatches,
    getMatchById,
    createMatch,
    updateMatchResult,
    deleteMatch,
} = require('../controllers/matches.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require login
router.use(protect);

router.get('/', getAllMatches);
router.post('/', createMatch);                                        // students + admin
router.patch('/:id/result', authorize('admin'), updateMatchResult);  // admin only
router.get('/:id', getMatchById);
router.delete('/:id', authorize('admin'), deleteMatch);              // admin only

module.exports = router;
