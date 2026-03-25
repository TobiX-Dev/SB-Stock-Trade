const express = require('express');
const router = express.Router();
const { getUserOrders, getAllOrders, getOrderStats } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.get('/my',    protect, getUserOrders);
router.get('/all',   protect, adminOnly, getAllOrders);
router.get('/stats', protect, adminOnly, getOrderStats);

module.exports = router;
