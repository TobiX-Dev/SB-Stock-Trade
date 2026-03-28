const express = require('express');
const router = express.Router();
const {
  getAllStocks, getStockQuote, getStockCandles, searchStocks,
  getCompanyProfile, getMarketNews, getBulkQuotes,
  addStock, updateStock, deleteStock, searchFinnhub
} = require('../controllers/stockController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// Public/Protected routes (GET)
router.get('/', protect, getAllStocks);
router.get('/quote/:symbol', protect, getStockQuote);
router.get('/candles/:symbol', protect, getStockCandles);
router.get('/profile/:symbol', protect, getCompanyProfile);
router.get('/search', protect, searchStocks);
router.get('/news', protect, getMarketNews);
router.get('/bulk-quotes', protect, getBulkQuotes);

// Admin routes (POST/PUT/DELETE)
router.post('/admin/search-finnhub', protect, adminOnly, searchFinnhub);
router.post('/', protect, adminOnly, addStock);
router.put('/:id', protect, adminOnly, updateStock);
router.delete('/:id', protect, adminOnly, deleteStock);

module.exports = router;
