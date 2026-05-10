const express = require('express');
const {
    getAllIssuances,
    getIssuanceById,
    issueItem,
    returnItem,
    deleteIssuance,
} = require('../controllers/issuance.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require login
router.use(protect);

router.get('/', getAllIssuances);
router.post('/', authorize('admin'), issueItem);          // admin only
router.get('/:id', getIssuanceById);
router.patch('/:id/return', authorize('admin'), returnItem); // admin only — mark as returned
router.delete('/:id', authorize('admin'), deleteIssuance);   // admin only

module.exports = router;
