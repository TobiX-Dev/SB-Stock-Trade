const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile, getAllUsers, deleteUser } = require('../controllers/userController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/all', protect, adminOnly, getAllUsers);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;
