const express = require('express');
const router = express.Router();
const { registerUser, verifyEmail, loginUser, verifyTOTP, forgotPassword, resetPassword, googleAuth, setUsername, totpSetup, totpEnable, getUserProfile, updateUserProfile, getAllUsers, deleteUser } = require('../controllers/userController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);
router.post('/login', loginUser);
router.post('/verify-totp', verifyTOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/google-auth', googleAuth);
router.post('/set-username', setUsername);
router.post('/totp/setup', protect, totpSetup);
router.post('/totp/enable', protect, totpEnable);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/all', protect, adminOnly, getAllUsers);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;
