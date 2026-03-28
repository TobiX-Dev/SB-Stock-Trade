const axios = require('axios');
const Stock = require('../models/stockSchema');

// ── Get Finnhub key ───────────────────────────────────────────────────────────
const FH = () => process.env.FINNHUB_API_KEY;
const FH_BASE = 'https://finnhub.io/api/v1';

// ── In-memory cache (avoid rate limits) ──────────────────────────────────────
const cache = new Map();
const CACHE_TTL = 15 * 1000; // 15 seconds

const getCached = (key) => {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.time < CACHE_TTL) return entry.data;
  return null;
};
const setCache = (key, data) => cache.set(key, { data, time: Date.now() });

// ── Stooq CSV parser (free, no auth needed) ───────────────────────────────────
const fetchStooqQuote = async (symbol) => {
  const url = `https://stooq.com/q/l/?s=${symbol.toLowerCase()}.us&f=sd2t2ohlcvn&h&e=csv`;
  const { data } = await axios.get(url, { timeout: 8000, responseType: 'text' });
  const lines = data.trim().split('\n');
  if (lines.length < 2) throw new Error('No data');
  const vals = lines[1].split(',');
  // Symbol,Date,Time,Open,High,Low,Close,Volume,Name
  const close = parseFloat(vals[6]);
  const open  = parseFloat(vals[3]);
  const high  = parseFloat(vals[4]);
  const low   = parseFloat(vals[5]);
  const vol   = parseInt(vals[7]);
  if (!close || close <= 0) throw new Error('Invalid price');
  return { c: close, o: open, h: high, l: low, v: vol, name: vals[8]?.trim() || symbol };
};

// ── GET all stocks from DB ────────────────────────────────────────────────────
const getAllStocks = async (req, res) => {
  try {
    const stocks = await Stock.find({ isActive: true }).sort({ symbol: 1 });
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET live quote ─────────────────────────────────────────────────────────────
const getStockQuote = async (req, res) => {
  const { symbol } = req.params;
  const cacheKey   = `quote_${symbol}`;
  const cached     = getCached(cacheKey);
  if (cached) return res.json(cached);

  // PRIMARY: Finnhub
  try {
    const { data } = await axios.get(`${FH_BASE}/quote?symbol=${symbol}&token=${FH()}`, { timeout: 7000 });
    if (data.c > 0) {
      setCache(cacheKey, data);
      return res.json(data);
    }
    throw new Error('Zero price from Finnhub');
  } catch (fhErr) {
    console.warn(`Finnhub quote failed ${symbol}: ${fhErr.message}`);
  }

  // FALLBACK: Stooq
  try {
    const q = await fetchStooqQuote(symbol);
    const result = {
      c:  q.c,
      o:  q.o,
      h:  q.h,
      l:  q.l,
      v:  q.v,
      pc: q.c, // stooq doesn't give prev close in this endpoint
      d:  0,
      dp: 0,
      t:  Math.floor(Date.now() / 1000),
      name: q.name,
    };
    setCache(cacheKey, result);
    return res.json(result);
  } catch (stooqErr) {
    console.warn(`Stooq quote failed ${symbol}: ${stooqErr.message}`);
  }

  res.status(503).json({ message: `Could not fetch quote for ${symbol}` });
};

// ── GET OHLCV chart candles ────────────────────────────────────────────────────
const getStockCandles = async (req, res) => {
  const { symbol }        = req.params;
  const { resolution = 'D' } = req.query;
  const cacheKey          = `candles_${symbol}_${resolution}`;
  const cached            = getCached(cacheKey);
  if (cached) return res.json(cached);

  const to   = Math.floor(Date.now() / 1000);
  const fromMap = { 'D': 90, 'W': 365, 'M': 1825, '60': 30, '15': 5 };
  const days = fromMap[resolution] || 90;
  const from = to - days * 24 * 3600;

  // PRIMARY: Finnhub candles
  try {
    const { data } = await axios.get(
      `${FH_BASE}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FH()}`,
      { timeout: 10000 }
    );
    if (data.s === 'ok' && data.c?.length > 0) {
      setCache(cacheKey, data);
      return res.json(data);
    }
    throw new Error(`Finnhub returned: ${data.s}`);
  } catch (fhErr) {
    console.warn(`Finnhub candles failed ${symbol}: ${fhErr.message}`);
  }

  // FALLBACK: Stooq historical CSV
  try {
    const interval = resolution === 'W' ? 'w' : resolution === 'M' ? 'm' : 'd';
    const startDate = new Date(from * 1000).toISOString().split('T')[0].replace(/-/g,'');
    const endDate   = new Date(to   * 1000).toISOString().split('T')[0].replace(/-/g,'');
    const url = `https://stooq.com/q/d/l/?s=${symbol.toLowerCase()}.us&d1=${startDate}&d2=${endDate}&i=${interval}`;
    const { data } = await axios.get(url, { timeout: 10000, responseType: 'text' });
    const lines = data.trim().split('\n').slice(1); // skip header
    const valid = lines
      .map(l => l.split(','))
      .filter(p => p.length >= 6 && parseFloat(p[4]) > 0)
      .map(p => ({
        t: Math.floor(new Date(p[0]).getTime() / 1000),
        o: parseFloat(p[1]),
        h: parseFloat(p[2]),
        l: parseFloat(p[3]),
        c: parseFloat(p[4]),
        v: parseInt(p[5]) || 0,
      }));

    if (valid.length === 0) throw new Error('No stooq candle data');

    const result = {
      s: 'ok',
      t: valid.map(d => d.t),
      o: valid.map(d => d.o),
      h: valid.map(d => d.h),
      l: valid.map(d => d.l),
      c: valid.map(d => d.c),
      v: valid.map(d => d.v),
    };
    setCache(cacheKey, result);
    return res.json(result);
  } catch (stooqErr) {
    console.warn(`Stooq candles failed ${symbol}: ${stooqErr.message}`);
  }

  return res.json({ s: 'no_data', t: [], c: [], o: [], h: [], l: [], v: [] });
};

// ── SEARCH stocks ──────────────────────────────────────────────────────────────
const searchStocks = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ result: [] });
  try {
    const { data } = await axios.get(
      `${FH_BASE}/search?q=${encodeURIComponent(q)}&token=${FH()}`,
      { timeout: 6000 }
    );
    return res.json(data);
  } catch {
    return res.json({ result: [] });
  }
};

// ── GET company profile ────────────────────────────────────────────────────────
const getCompanyProfile = async (req, res) => {
  const { symbol } = req.params;
  const cacheKey   = `profile_${symbol}`;
  const cached     = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const { data } = await axios.get(
      `${FH_BASE}/stock/profile2?symbol=${symbol}&token=${FH()}`,
      { timeout: 8000 }
    );
    if (data && data.name) {
      setCache(cacheKey, data);
      return res.json(data);
    }
    throw new Error('Empty profile');
  } catch (err) {
    console.warn(`Profile failed ${symbol}: ${err.message}`);
    return res.json({ name: symbol, ticker: symbol, description: '', logo: '' });
  }
};

// ── GET market news ────────────────────────────────────────────────────────────
const getMarketNews = async (req, res) => {
  const cacheKey = 'market_news';
  const cached   = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const { data } = await axios.get(
      `${FH_BASE}/news?category=general&token=${FH()}`,
      { timeout: 8000 }
    );
    const news = data.slice(0, 12);
    setCache(cacheKey, news);
    return res.json(news);
  } catch (err) {
    console.warn('News failed:', err.message);
    return res.json([
      { id:'1', headline:'Markets open higher as tech stocks lead gains', source:'Reuters', url:'#', datetime: Math.floor(Date.now()/1000) },
      { id:'2', headline:'Federal Reserve holds rates steady in latest meeting', source:'Bloomberg', url:'#', datetime: Math.floor(Date.now()/1000) },
      { id:'3', headline:'S&P 500 edges higher amid mixed earnings season', source:'CNBC', url:'#', datetime: Math.floor(Date.now()/1000) },
    ]);
  }
};

// ── GET bulk quotes ────────────────────────────────────────────────────────────
// Finnhub free: 60 calls/min → batch with small delay
const getBulkQuotes = async (req, res) => {
  const { symbols } = req.query;
  if (!symbols) return res.json([]);
  const MAX_BULK_SYMBOLS = 50;
  const list = symbols.split(',').map(s => s.trim()).filter(Boolean).slice(0, MAX_BULK_SYMBOLS);  if (!list.length) return res.json([]);

  // Check cache first
  const cacheKey = `bulk_${list.join('_')}`;
  const cached   = getCached(cacheKey);
  if (cached) return res.json(cached);

  // Fetch from Finnhub in parallel (free tier: 60/min = 1/sec → safe for 25)
  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  const results = [];
  for (let i = 0; i < list.length; i++) {
    const sym = list[i];
    try {
      const { data } = await axios.get(
        `${FH_BASE}/quote?symbol=${sym}&token=${FH()}`,
        { timeout: 5000 }
      );
      if (data.c > 0) {
        results.push({ symbol: sym, quote: data });
      } else {
        // Try stooq fallback for this symbol
        try {
          const q = await fetchStooqQuote(sym);
          results.push({ symbol: sym, quote: { c: q.c, h: q.h, l: q.l, o: q.o, v: q.v, pc: q.c, d: 0, dp: 0 } });
        } catch {
          results.push({ symbol: sym, quote: null });
        }
      }
    } catch (err) {
      // Rate limit hit — try stooq
      try {
        const q = await fetchStooqQuote(sym);
        results.push({ symbol: sym, quote: { c: q.c, h: q.h, l: q.l, o: q.o, v: q.v, pc: q.c, d: 0, dp: 0 } });
      } catch {
        results.push({ symbol: sym, quote: null });
      }
    }
    // Small delay to respect rate limits
    if (i < list.length - 1) await delay(100);
  }

  setCache(cacheKey, results);
  return res.json(results);
};

// ── Admin CRUD ─────────────────────────────────────────────────────────────────
const addStock = async (req, res) => {
  try {
    const { symbol, companyName, exchange, sector, description } = req.body;
    if (!symbol || !companyName)
      return res.status(400).json({ message: 'Symbol and company name required' });
    const exists = await Stock.findOne({ symbol: symbol.toUpperCase() });
    if (exists) return res.status(400).json({ message: 'Stock already listed' });
    const stock = await Stock.create({ symbol: symbol.toUpperCase(), companyName, exchange, sector, description });
    res.status(201).json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStock = async (req, res) => {
  try {
    const stock = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!stock) return res.status(404).json({ message: 'Stock not found' });
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteStock = async (req, res) => {
  try {
    await Stock.findByIdAndDelete(req.params.id);
    res.json({ message: 'Stock removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchFinnhub = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || query.length < 1) return res.json({ results: [] });

    // Search via Finnhub Symbol Lookup
    const url = `${FH_BASE}/search?q=${encodeURIComponent(query)}&token=${FH()}`;
    const { data } = await axios.get(url, { timeout: 8000 });
    
    if (!data.result) return res.json({ results: [] });

    // Filter and format results (prefer stocks over other securities)
    const results = data.result
      .filter(item => 
        item.type === 'Common Stock' && 
        item.symbol && 
        item.description
      )
      .slice(0, 20) // Limit to 20 results
      .map(item => ({
        symbol: item.symbol,
        description: item.description,
        exchange: item.displaySymbol,
        mic: item.mic || 'NASDAQ',
        sector: item.subindustry || 'Technology',
        logo: item.logo || ''
      }));

    res.json({ results });
  } catch (error) {
    console.error('Finnhub search error:', error.message);
    res.status(500).json({ message: 'Failed to search stocks' });
  }
};

module.exports = {
  getAllStocks, getStockQuote, getStockCandles, searchStocks,
  getCompanyProfile, getMarketNews, getBulkQuotes,
  addStock, updateStock, deleteStock, searchFinnhub
};