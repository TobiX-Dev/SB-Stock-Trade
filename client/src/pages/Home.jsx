import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../components/axiosInstance';
import { useGeneral } from '../context/GeneralContext';

const WATCHLIST = ['AAPL','MSFT','GOOGL','AMZN','TSLA','NVDA','META','NFLX'];

export default function Home() {
  const { user, stocks } = useGeneral();
  const [quotes, setQuotes]     = useState({});
  const [news, setNews]         = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [txns, setTxns]         = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadQuotes, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    await Promise.allSettled([loadQuotes(), loadNews(), loadPortfolio(), loadTxns()]);
    setLoading(false);
  };

  const loadQuotes = async () => {
    try {
      const syms = WATCHLIST.join(',');
      const { data } = await axiosInstance.get(`/stocks/bulk-quotes?symbols=${syms}`);
      const map = {};
      data.forEach(d => { if (d.quote) map[d.symbol] = d.quote; });
      setQuotes(map);
    } catch {}
  };

  const loadNews  = async () => {
    try { const { data } = await axiosInstance.get('/stocks/news'); setNews(data.slice(0,4)); } catch {}
  };
  const loadPortfolio = async () => {
    try { const { data } = await axiosInstance.get('/transactions/portfolio'); setPortfolio(data); } catch {}
  };
  const loadTxns  = async () => {
    try { const { data } = await axiosInstance.get('/transactions/my'); setTxns(data.slice(0,5)); } catch {}
  };

  const portfolioValue = portfolio?.holdings?.reduce((sum, h) => {
    const q = quotes[h.symbol];
    return sum + (q ? q.c * h.quantity : h.avgBuyPrice * h.quantity);
  }, 0) || 0;

  const totalPnL = portfolio?.holdings?.reduce((sum, h) => {
    const q = quotes[h.symbol];
    const cur = q ? q.c : h.avgBuyPrice;
    return sum + (cur - h.avgBuyPrice) * h.quantity;
  }, 0) || 0;

  return (
    <div className="pt-14 min-h-screen bg-night">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-2xl font-bold text-white">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},&nbsp;
            <span className="text-teal">{user?.username}</span> 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here's your market overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Cash Balance', value: `$${(user?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, sub: 'Available to invest', color: 'text-teal' },
            { label: 'Portfolio Value', value: `$${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, sub: 'Current holdings', color: 'text-white' },
            { label: 'Total P&L', value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`, sub: 'Unrealized gains/loss', color: totalPnL >= 0 ? 'text-teal' : 'text-crimson' },
            { label: 'Net Worth', value: `$${((user?.balance || 0) + portfolioValue).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, sub: 'Cash + Portfolio', color: 'text-gold' },
          ].map(c => (
            <div key={c.label} className="stat-card animate-slide-up">
              <p className="label">{c.label}</p>
              <p className={`font-mono text-xl font-bold ${c.color}`}>{c.value}</p>
              <p className="text-slate-500 text-xs">{c.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Watchlist */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-white font-semibold">Market Watchlist</h2>
                <Link to="/stocks" className="text-xs text-teal hover:underline">View All →</Link>
              </div>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-12 bg-night-300 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-night-300">
                  {WATCHLIST.map(sym => {
                    const q = quotes[sym];
                    const pct = q ? ((q.c - q.pc) / q.pc * 100).toFixed(2) : null;
                    const up = pct >= 0;
                    return (
                      <Link to={`/stocks/${sym}`} key={sym}
                        className="flex items-center justify-between py-3 hover:bg-night-300 px-2 rounded-lg transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-night-300 flex items-center justify-center text-xs font-mono text-teal font-bold group-hover:bg-teal-dim">
                            {sym[0]}
                          </div>
                          <div>
                            <p className="text-white text-sm font-semibold font-mono">{sym}</p>
                            <p className="text-slate-500 text-xs">{stocks.find(s=>s.symbol===sym)?.companyName || sym}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-sm text-white font-medium">
                            {q ? `$${q.c.toFixed(2)}` : '—'}
                          </p>
                          {pct !== null && (
                            <p className={`text-xs font-mono ${up ? 'text-teal' : 'text-crimson'}`}>
                              {up ? '▲' : '▼'} {Math.abs(pct)}%
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Recent transactions */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-white font-semibold text-sm">Recent Activity</h2>
                <Link to="/history" className="text-xs text-teal hover:underline">All →</Link>
              </div>
              {txns.length === 0 ? (
                <p className="text-slate-600 text-xs text-center py-4">No transactions yet. <Link to="/stocks" className="text-teal">Start trading!</Link></p>
              ) : (
                <div className="space-y-2">
                  {txns.map(t => (
                    <div key={t._id} className="flex items-center justify-between py-2 border-b border-night-300">
                      <div className="flex items-center gap-2">
                        <span className={t.type === 'buy' ? 'badge-buy' : 'badge-sell'}>{t.type.toUpperCase()}</span>
                        <div>
                          <p className="text-white text-xs font-mono font-semibold">{t.symbol}</p>
                          <p className="text-slate-500 text-xs">{t.quantity} shares</p>
                        </div>
                      </div>
                      <p className="font-mono text-xs text-white">${t.totalAmount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* News */}
            <div className="card">
              <h2 className="font-display text-white font-semibold text-sm mb-4">Market News</h2>
              <div className="space-y-3">
                {news.slice(0,3).map((n, i) => (
                  <a key={i} href={n.url} target="_blank" rel="noreferrer"
                    className="block hover:bg-night-300 -mx-2 px-2 py-2 rounded-lg transition-colors">
                    <p className="text-slate-300 text-xs leading-relaxed line-clamp-2">{n.headline}</p>
                    <p className="text-slate-600 text-xs mt-1">{n.source}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
