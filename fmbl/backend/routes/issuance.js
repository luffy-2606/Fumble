const express = require('express');
const {
    getAllIssuances,
    getIssuanceById,
    issueItem,
    returnItem,
    deleteIssuance,
} = require('../controllers/issuance.controller');

const router = express.Router();

router.get('/', getAllIssuances);
router.post('/', issueItem);
router.get('/:id', getIssuanceById);
router.patch('/:id/return', returnItem);
router.delete('/:id', deleteIssuance);

module.exports = router;
