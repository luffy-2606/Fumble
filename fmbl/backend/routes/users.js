const express = require('express');
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
} = require('../controllers/users.controller');   // fixed typo: contoller → controller
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Admin-only routes
router.get('/', protect, authorize('admin'), getAllUsers);
router.post('/', protect, authorize('admin'), createUser);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

// Any authenticated user can view a single profile
router.get('/:id', protect, getUserById);

module.exports = router;