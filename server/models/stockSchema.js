const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  symbol:      { type: String, required: true, unique: true, uppercase: true },
  companyName: { type: String, required: true },
  exchange:    { type: String, default: 'NASDAQ' },
  sector:      { type: String, default: 'Technology' },
  description: { type: String, default: '' },
  logo:        { type: String, default: '' },
  isActive:    { type: Boolean, default: true },
  addedAt:     { type: Date, default: Date.now }
});

module.exports = mongoose.model('Stock', stockSchema);
