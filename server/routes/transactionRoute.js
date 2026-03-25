const express = require('express');
const router = express.Router();
const {
  buyStock, sellStock, getUserTransactions, getAllTransactions,
  getPortfolio, getAllPortfolios
} = require('../controllers/transactionController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.post('/buy',  protect, buyStock);
router.post('/sell', protect, sellStock);
router.get('/my',    protect, getUserTransactions);
router.get('/portfolio', protect, getPortfolio);
router.get('/all',   protect, adminOnly, getAllTransactions);
router.get('/portfolios', protect, adminOnly, getAllPortfolios);

module.exports = router;
