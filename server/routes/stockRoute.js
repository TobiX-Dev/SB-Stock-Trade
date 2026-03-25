const express = require('express');
const router = express.Router();
const {
  getAllStocks, getStockQuote, getStockCandles, searchStocks,
  getCompanyProfile, getMarketNews, getBulkQuotes,
  addStock, updateStock, deleteStock
} = require('../controllers/stockController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.get('/', protect, getAllStocks);
router.get('/search', protect, searchStocks);
router.get('/news', protect, getMarketNews);
router.get('/bulk-quotes', protect, getBulkQuotes);
router.get('/quote/:symbol', protect, getStockQuote);
router.get('/candles/:symbol', protect, getStockCandles);
router.get('/profile/:symbol', protect, getCompanyProfile);

// Admin routes
router.post('/', protect, adminOnly, addStock);
router.put('/:id', protect, adminOnly, updateStock);
router.delete('/:id', protect, adminOnly, deleteStock);

module.exports = router;
