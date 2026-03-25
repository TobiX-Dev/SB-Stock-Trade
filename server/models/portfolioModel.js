const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
  symbol:       { type: String, required: true },
  companyName:  { type: String, default: '' },
  quantity:     { type: Number, required: true, min: 0 },
  avgBuyPrice:  { type: Number, required: true }
}, { _id: false });

const portfolioSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:      { type: String, default: 'My Portfolio' },
  holdings:  [holdingSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
