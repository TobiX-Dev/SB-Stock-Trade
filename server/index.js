const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors({ 
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://webstock-client.vercel.app'
    'https://sb-stock-trade.onrender.com'
  ], 
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users',        require('./routes/userRoute'));
app.use('/api/stocks',       require('./routes/stockRoute'));
app.use('/api/transactions', require('./routes/transactionRoute'));
app.use('/api/orders',       require('./routes/orderRoute'));
app.use('/api/feedback',     require('./routes/feedbackRoute'));

app.get('/', (req, res) => res.json({ status: 'SB Stocks API running ✅' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error' });
});

// ── Seed Data ────────────────────────────────────────────────────────────────
const seedData = async () => {
  const Stock = require('./models/stockSchema');
  const User  = require('./models/userModel');
  const bcrypt = require('bcryptjs');

  // Seed stocks
  const count = await Stock.countDocuments();
  if (count === 0) {
    const stocks = [
      // Technology
      { symbol:'AAPL',  companyName:'Apple Inc.',                exchange:'NASDAQ', sector:'Technology' },
      { symbol:'MSFT',  companyName:'Microsoft Corporation',      exchange:'NASDAQ', sector:'Technology' },
      { symbol:'GOOGL', companyName:'Alphabet Inc.',              exchange:'NASDAQ', sector:'Technology' },
      { symbol:'META',  companyName:'Meta Platforms Inc.',        exchange:'NASDAQ', sector:'Technology' },
      { symbol:'NVDA',  companyName:'NVIDIA Corporation',         exchange:'NASDAQ', sector:'Technology' },
      { symbol:'INTC',  companyName:'Intel Corporation',          exchange:'NASDAQ', sector:'Technology' },
      { symbol:'AMD',   companyName:'Advanced Micro Devices',     exchange:'NASDAQ', sector:'Technology' },
      { symbol:'ORCL',  companyName:'Oracle Corporation',         exchange:'NYSE',   sector:'Technology' },
      { symbol:'CRM',   companyName:'Salesforce Inc.',            exchange:'NYSE',   sector:'Technology' },
      { symbol:'ADBE',  companyName:'Adobe Inc.',                 exchange:'NASDAQ', sector:'Technology' },
      // E-Commerce / Consumer
      { symbol:'AMZN',  companyName:'Amazon.com Inc.',            exchange:'NASDAQ', sector:'Consumer Discretionary' },
      { symbol:'TSLA',  companyName:'Tesla Inc.',                 exchange:'NASDAQ', sector:'Automotive' },
      { symbol:'WMT',   companyName:'Walmart Inc.',               exchange:'NYSE',   sector:'Retail' },
      { symbol:'HD',    companyName:'The Home Depot Inc.',        exchange:'NYSE',   sector:'Retail' },
      { symbol:'NKE',   companyName:'Nike Inc.',                  exchange:'NYSE',   sector:'Consumer Goods' },
      { symbol:'MCD',   companyName:"McDonald's Corporation",     exchange:'NYSE',   sector:'Consumer Goods' },
      { symbol:'SBUX',  companyName:'Starbucks Corporation',      exchange:'NASDAQ', sector:'Consumer Goods' },
      { symbol:'KO',    companyName:'The Coca-Cola Company',      exchange:'NYSE',   sector:'Consumer Goods' },
      { symbol:'PEP',   companyName:'PepsiCo Inc.',               exchange:'NASDAQ', sector:'Consumer Goods' },
      // Media / Entertainment
      { symbol:'NFLX',  companyName:'Netflix Inc.',               exchange:'NASDAQ', sector:'Communication' },
      { symbol:'DIS',   companyName:'The Walt Disney Company',    exchange:'NYSE',   sector:'Entertainment' },
      { symbol:'SPOT',  companyName:'Spotify Technology S.A.',    exchange:'NYSE',   sector:'Entertainment' },
      // Financial
      { symbol:'JPM',   companyName:'JPMorgan Chase & Co.',       exchange:'NYSE',   sector:'Financial' },
      { symbol:'BAC',   companyName:'Bank of America Corp.',      exchange:'NYSE',   sector:'Financial' },
      { symbol:'GS',    companyName:'Goldman Sachs Group',        exchange:'NYSE',   sector:'Financial' },
      { symbol:'V',     companyName:'Visa Inc.',                  exchange:'NYSE',   sector:'Financial' },
      { symbol:'MA',    companyName:'Mastercard Incorporated',    exchange:'NYSE',   sector:'Financial' },
      { symbol:'PYPL',  companyName:'PayPal Holdings Inc.',       exchange:'NASDAQ', sector:'Financial' },
      { symbol:'MS',    companyName:'Morgan Stanley',             exchange:'NYSE',   sector:'Financial' },
      // Healthcare
      { symbol:'JNJ',   companyName:'Johnson & Johnson',          exchange:'NYSE',   sector:'Healthcare' },
      { symbol:'PFE',   companyName:'Pfizer Inc.',                exchange:'NYSE',   sector:'Healthcare' },
      { symbol:'UNH',   companyName:'UnitedHealth Group Inc.',    exchange:'NYSE',   sector:'Healthcare' },
      { symbol:'ABBV',  companyName:'AbbVie Inc.',                exchange:'NYSE',   sector:'Healthcare' },
      { symbol:'MRK',   companyName:'Merck & Co. Inc.',           exchange:'NYSE',   sector:'Healthcare' },
      // Energy
      { symbol:'XOM',   companyName:'Exxon Mobil Corporation',    exchange:'NYSE',   sector:'Energy' },
      { symbol:'CVX',   companyName:'Chevron Corporation',        exchange:'NYSE',   sector:'Energy' },
      // Aerospace / Industrial
      { symbol:'BA',    companyName:'The Boeing Company',         exchange:'NYSE',   sector:'Aerospace' },
      { symbol:'CAT',   companyName:'Caterpillar Inc.',           exchange:'NYSE',   sector:'Industrial' },
      { symbol:'GE',    companyName:'GE Aerospace',               exchange:'NYSE',   sector:'Industrial' },
      // Telecom
      { symbol:'T',     companyName:'AT&T Inc.',                  exchange:'NYSE',   sector:'Telecom' },
      { symbol:'VZ',    companyName:'Verizon Communications',     exchange:'NYSE',   sector:'Telecom' },
      // ETFs
      { symbol:'SPY',   companyName:'SPDR S&P 500 ETF Trust',     exchange:'NYSE',   sector:'ETF' },
      { symbol:'QQQ',   companyName:'Invesco QQQ Trust',          exchange:'NASDAQ', sector:'ETF' },
      { symbol:'IWM',   companyName:'iShares Russell 2000 ETF',   exchange:'NYSE',   sector:'ETF' },
      // Others
      { symbol:'UBER',  companyName:'Uber Technologies Inc.',     exchange:'NYSE',   sector:'Transportation' },
      { symbol:'LYFT',  companyName:'Lyft Inc.',                  exchange:'NASDAQ', sector:'Transportation' },
      { symbol:'ABNB',  companyName:'Airbnb Inc.',                exchange:'NASDAQ', sector:'Travel' },
      { symbol:'COIN',  companyName:'Coinbase Global Inc.',       exchange:'NASDAQ', sector:'Crypto/Finance' },
      { symbol:'PLTR',  companyName:'Palantir Technologies Inc.', exchange:'NYSE',   sector:'Technology' },
      { symbol:'SNOW',  companyName:'Snowflake Inc.',             exchange:'NYSE',   sector:'Technology' },
    ];
    await Stock.insertMany(stocks);
    console.log(`✅ ${stocks.length} stocks seeded`);
  } else {
    console.log(`✅ ${count} stocks already in DB`);
  }

  // Seed admin - delete old and create new
  await User.deleteOne({ email: 'admin@sbstocks.com' });
  const adminExists = await User.findOne({ email: 'charpachi04@gmail.com' });
  if (!adminExists) {
    const salt   = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash('Admin123', salt);
    await User.create({
      username: 'admin', email: 'charpachi04@gmail.com',
      password: hashed, role: 'admin', balance: 999999999, isVerified: true,
    });
    console.log('✅ Admin seeded → charpachi04@gmail.com / Admin123');
  } else {
    const salt   = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash('Admin123', salt);
    await User.updateOne({ email: 'charpachi04@gmail.com' }, { password: hashed });
  }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await seedData();
});
