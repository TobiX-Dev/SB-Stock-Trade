const express = require('express');
const router = express.Router();
const { submitFeedback, getAllFeedback, updateFeedbackStatus, deleteFeedback } = require('../controllers/feedbackController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.post('/submit', protect, submitFeedback);
router.get('/all', protect, adminOnly, getAllFeedback);
router.put('/:id', protect, adminOnly, updateFeedbackStatus);
router.delete('/:id', protect, adminOnly, deleteFeedback);

module.exports = router;
