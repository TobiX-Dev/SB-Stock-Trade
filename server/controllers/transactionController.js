const axios = require('axios');
const Transaction = require('../models/transactionModel');
const Order       = require('../models/orderSchema');
const User        = require('../models/userModel');
const Portfolio   = require('../models/portfolioModel');

const FH     = () => process.env.FINNHUB_API_KEY;
const FH_BASE = 'https://finnhub.io/api/v1';

// ── Fetch live price ──────────────────────────────────────────────────────────
const fetchLivePrice = async (symbol) => {
  // PRIMARY: Finnhub
  try {
    const { data } = await axios.get(
      `${FH_BASE}/quote?symbol=${symbol}&token=${FH()}`,
      { timeout: 7000 }
    );
    if (data.c > 0) return data.c;
  } catch {}

  // FALLBACK: Stooq CSV
  try {
    const url = `https://stooq.com/q/l/?s=${symbol.toLowerCase()}.us&f=sd2t2ohlcvn&h&e=csv`;
    const { data } = await axios.get(url, { timeout: 8000, responseType: 'text' });
    const lines = data.trim().split('\n');
    if (lines.length >= 2) {
      const vals  = lines[1].split(',');
      const price = parseFloat(vals[6]);
      if (price > 0) return price;
    }
  } catch {}

  throw new Error(`Cannot fetch live price for ${symbol}. Please try again.`);
};

const getOrCreatePortfolio = async (userId) => {
  let p = await Portfolio.findOne({ user: userId });
  if (!p) p = await Portfolio.create({ user: userId, name: 'My Portfolio', holdings: [] });
  return p;
};

// ── BUY ───────────────────────────────────────────────────────────────────────
const buyStock = async (req, res) => {
  try {
    const { symbol, companyName, quantity } = req.body;
    if (!symbol || !quantity || parseInt(quantity) < 1)
      return res.status(400).json({ message: 'Invalid symbol or quantity' });

    const price       = await fetchLivePrice(symbol.toUpperCase());
    const totalAmount = parseFloat((price * parseInt(quantity)).toFixed(2));

    const user = await User.findById(req.user._id);
    if (user.balance < totalAmount)
      return res.status(400).json({
        message: `Insufficient funds. Need $${totalAmount.toFixed(2)}, available $${user.balance.toFixed(2)}`
      });

    user.balance = parseFloat((user.balance - totalAmount).toFixed(2));
    await user.save();

    const portfolio = await getOrCreatePortfolio(user._id);
    const idx = portfolio.holdings.findIndex(h => h.symbol === symbol.toUpperCase());
    if (idx >= 0) {
      const h = portfolio.holdings[idx];
      const newQty = h.quantity + parseInt(quantity);
      h.avgBuyPrice = parseFloat(((h.avgBuyPrice * h.quantity + price * parseInt(quantity)) / newQty).toFixed(4));
      h.quantity = newQty;
    } else {
      portfolio.holdings.push({
        symbol:      symbol.toUpperCase(),
        companyName: companyName || symbol,
        quantity:    parseInt(quantity),
        avgBuyPrice: price,
      });
    }
    await portfolio.save();

    const transaction = await Transaction.create({
      user: user._id, symbol: symbol.toUpperCase(),
      companyName: companyName || symbol,
      type: 'buy', quantity: parseInt(quantity), price, totalAmount,
    });
    await Order.create({
      user: user._id, symbol: symbol.toUpperCase(),
      companyName: companyName || symbol,
      orderType: 'buy', quantity: parseInt(quantity), price, totalAmount, status: 'completed',
    });

    res.status(201).json({
      message: `✅ Bought ${quantity} shares of ${symbol} at $${price.toFixed(2)}`,
      transaction, newBalance: user.balance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── SELL ──────────────────────────────────────────────────────────────────────
const sellStock = async (req, res) => {
  try {
    const { symbol, companyName, quantity } = req.body;
    if (!symbol || !quantity || parseInt(quantity) < 1)
      return res.status(400).json({ message: 'Invalid symbol or quantity' });

    const portfolio = await getOrCreatePortfolio(req.user._id);
    const idx = portfolio.holdings.findIndex(h => h.symbol === symbol.toUpperCase());
    if (idx < 0)
      return res.status(400).json({ message: `You don't own any shares of ${symbol}` });
    if (portfolio.holdings[idx].quantity < parseInt(quantity))
      return res.status(400).json({ message: `Only ${portfolio.holdings[idx].quantity} shares available` });

    const price       = await fetchLivePrice(symbol.toUpperCase());
    const totalAmount = parseFloat((price * parseInt(quantity)).toFixed(2));

    portfolio.holdings[idx].quantity -= parseInt(quantity);
    if (portfolio.holdings[idx].quantity === 0) portfolio.holdings.splice(idx, 1);
    await portfolio.save();

    const user = await User.findById(req.user._id);
    user.balance = parseFloat((user.balance + totalAmount).toFixed(2));
    await user.save();

    const transaction = await Transaction.create({
      user: user._id, symbol: symbol.toUpperCase(),
      companyName: companyName || symbol,
      type: 'sell', quantity: parseInt(quantity), price, totalAmount,
    });
    await Order.create({
      user: user._id, symbol: symbol.toUpperCase(),
      companyName: companyName || symbol,
      orderType: 'sell', quantity: parseInt(quantity), price, totalAmount, status: 'completed',
    });

    res.status(201).json({
      message: `✅ Sold ${quantity} shares of ${symbol} at $${price.toFixed(2)}`,
      transaction, newBalance: user.balance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ timestamp: -1 });
    res.json(transactions);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('user', 'username email').sort({ timestamp: -1 });
    res.json(transactions);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getPortfolio = async (req, res) => {
  try {
    const portfolio = await getOrCreatePortfolio(req.user._id);
    res.json(portfolio);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find().populate('user', 'username email balance');
    res.json(portfolios);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = {
  buyStock, sellStock, getUserTransactions, getAllTransactions,
  getPortfolio, getAllPortfolios,
};