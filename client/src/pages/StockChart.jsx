import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import axiosInstance from '../components/axiosInstance';
import { useGeneral } from '../context/GeneralContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const RESOLUTIONS = [
  { label: '1D', value: 'D' },
  { label: '1W', value: 'W' },
  { label: '1M', value: 'M' },
];

export default function StockChart() {
  const { symbol }  = useParams();
  const { user, refreshUser } = useGeneral();
  const navigate    = useNavigate();

  const [quote, setQuote]         = useState(null);
  const [candles, setCandles]     = useState(null);
  const [profile, setProfile]     = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [resolution, setRes]      = useState('D');
  const [tradeModal, setTradeModal] = useState(null);
  const [qty, setQty]             = useState(1);
  const [tradeLoading, setTradeLoading] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    setPageLoading(true);
    Promise.allSettled([loadQuote(), loadCandles(), loadProfile(), loadPortfolio()])
      .finally(() => setPageLoading(false));

    intervalRef.current = setInterval(() => {
      setQuoteLoading(true);
      loadQuote().finally(() => setQuoteLoading(false));
    }, 12000);

    return () => clearInterval(intervalRef.current);
  }, [symbol]);

  useEffect(() => {
    setChartLoading(true);
    loadCandles().finally(() => setChartLoading(false));
  }, [resolution]);

  const loadQuote = async () => {
    try {
      const { data } = await axiosInstance.get(`/stocks/quote/${symbol}`);
      if (data && (data.c > 0 || data.pc > 0)) setQuote(data);
    } catch {}
  };

  const loadCandles = async () => {
    try {
      const { data } = await axiosInstance.get(`/stocks/candles/${symbol}?resolution=${resolution}`);
      setCandles(data);
    } catch {}
  };

  const loadProfile = async () => {
    try {
      const { data } = await axiosInstance.get(`/stocks/profile/${symbol}`);
      setProfile(data);
    } catch {}
  };

  const loadPortfolio = async () => {
    try {
      const { data } = await axiosInstance.get('/transactions/portfolio');
      setPortfolio(data);
    } catch {}
  };

  const handleTrade = async () => {
    const parsedQty = parseInt(qty);
    if (!parsedQty || parsedQty < 1) return toast.error('Enter a valid quantity');
    setTradeLoading(true);
    try {
      const url = tradeModal === 'buy' ? '/transactions/buy' : '/transactions/sell';
      await axiosInstance.post(url, {
        symbol,
        companyName: profile?.name || symbol,
        quantity: parsedQty
      });
      toast.success(`${tradeModal === 'buy' ? '🟢 Bought' : '🔴 Sold'} ${parsedQty} × ${symbol}`);
      setTradeModal(null);
      setQty(1);
      refreshUser();
      loadPortfolio();
      loadQuote();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Trade failed');
    }
    setTradeLoading(false);
  };

  const holding = portfolio?.holdings?.find(h => h.symbol === symbol);
  const chg = quote ? (quote.c - quote.pc) : 0;
  const pct = quote && quote.pc > 0 ? (chg / quote.pc * 100) : 0;
  const up  = chg >= 0;

  // Chart data
  const hasChart = candles && candles.s === 'ok' && candles.c?.length > 1;

  const chartData = hasChart ? {
    labels: candles.t.map(ts => {
      const d = new Date(ts * 1000);
      return resolution === 'D'
        ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : resolution === 'W'
        ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }),
    datasets: [{
      label: `${symbol} Price`,
      data: candles.c,
      borderColor: up ? '#00d4aa' : '#ff4757',
      backgroundColor: up
        ? 'rgba(0,212,170,0.06)'
        : 'rgba(255,71,87,0.06)',
      fill: true,
      tension: 0.3,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: up ? '#00d4aa' : '#ff4757',
      borderWidth: 2.5,
    }]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0d1220',
        borderColor: '#1a2235',
        borderWidth: 1,
        titleColor: '#64748b',
        bodyColor: '#e2e8f0',
        padding: 12,
        callbacks: {
          title: (items) => items[0].label,
          label: (ctx) => ` $${ctx.raw.toFixed(2)}`,
        }
      }
    },
    scales: {
      x: {
        grid: { color: '#1a223580', drawBorder: false },
        ticks: { color: '#475569', maxTicksLimit: 8, font: { family: 'JetBrains Mono', size: 10 } }
      },
      y: {
        grid: { color: '#1a223580', drawBorder: false },
        ticks: {
          color: '#475569',
          font: { family: 'JetBrains Mono', size: 10 },
          callback: v => `$${v >= 1000 ? (v/1000).toFixed(1)+'k' : v.toFixed(2)}`
        }
      }
    }
  };

  const estimatedTotal = quote ? (quote.c * (parseInt(qty) || 1)).toFixed(2) : '—';

  // price change from chart
  const chartChange = hasChart
    ? ((candles.c[candles.c.length-1] - candles.c[0]) / candles.c[0] * 100).toFixed(2)
    : null;

  if (pageLoading) return (
    <div className="pt-14 min-h-screen bg-night flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-teal border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-mono text-sm">Loading {symbol}...</p>
      </div>
    </div>
  );

  return (
    <div className="pt-14 min-h-screen bg-night">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-500 hover:text-teal text-sm mb-6 transition-colors group">
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Back to Stocks
        </button>

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-6 animate-fade-in">
          <div className="flex items-center gap-4">
            {profile?.logo ? (
              <img
                src={profile.logo}
                alt={symbol}
                onError={e => e.target.style.display = 'none'}
                className="w-12 h-12 rounded-xl bg-night-200 object-contain p-1.5 border border-night-300"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-teal-dim border border-teal/20 flex items-center justify-center font-display font-bold text-teal text-xl">
                {symbol[0]}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl font-bold text-white">{symbol}</h1>
                {profile?.exchange && (
                  <span className="text-xs bg-night-300 text-slate-400 px-2 py-0.5 rounded font-mono">{profile.exchange}</span>
                )}
                {profile?.finnhubIndustry && (
                  <span className="text-xs bg-night-300 text-slate-500 px-2 py-0.5 rounded hidden sm:inline">{profile.finnhubIndustry}</span>
                )}
              </div>
              <p className="text-slate-400 text-sm mt-0.5">{profile?.name || symbol}</p>
              {holding && (
                <p className="text-xs text-teal mt-1 font-mono">
                  ✓ You own {holding.quantity} shares · avg cost ${holding.avgBuyPrice?.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Price block */}
          <div className="text-left sm:text-right">
            {quote ? (
              <>
                <div className="flex sm:justify-end items-center gap-2">
                  <p className="font-mono text-3xl font-bold text-white">${quote.c?.toFixed(2)}</p>
                  {quoteLoading && <span className="w-2 h-2 rounded-full bg-teal animate-ping"></span>}
                </div>
                <p className={`font-mono text-sm font-medium ${up ? 'text-teal' : 'text-crimson'}`}>
                  {up ? '▲' : '▼'} ${Math.abs(chg).toFixed(2)} ({Math.abs(pct).toFixed(2)}%) today
                </p>
                <p className="text-slate-500 text-xs mt-0.5 font-mono">
                  Prev close: ${quote.pc?.toFixed(2)}
                </p>
              </>
            ) : (
              <div className="space-y-2">
                <div className="w-36 h-8 bg-night-300 rounded animate-pulse"></div>
                <div className="w-24 h-4 bg-night-300 rounded animate-pulse"></div>
              </div>
            )}
          </div>
        </div>

        {/* Quick stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Open',    value: quote ? `$${quote.o?.toFixed(2)}` : '—', color: 'text-white' },
            { label: 'High',    value: quote ? `$${quote.h?.toFixed(2)}` : '—', color: 'text-teal' },
            { label: 'Low',     value: quote ? `$${quote.l?.toFixed(2)}` : '—', color: 'text-crimson' },
            { label: 'Volume',  value: quote?.v ? (quote.v >= 1e6 ? `${(quote.v/1e6).toFixed(1)}M` : `${(quote.v/1e3).toFixed(0)}K`) : '—', color: 'text-white' },
          ].map(s => (
            <div key={s.label} className="card py-3 px-4">
              <p className="label">{s.label}</p>
              <p className={`font-mono font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-white font-semibold">Price Chart</h2>
              {chartChange !== null && (
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${parseFloat(chartChange) >= 0 ? 'bg-teal-dim text-teal' : 'bg-crimson-dim text-crimson'}`}>
                  {parseFloat(chartChange) >= 0 ? '+' : ''}{chartChange}% period
                </span>
              )}
            </div>
            <div className="flex gap-1 bg-night-300 rounded-lg p-1">
              {RESOLUTIONS.map(r => (
                <button key={r.value} onClick={() => setRes(r.value)}
                  className={`text-xs px-3 py-1.5 rounded-md font-mono font-medium transition-all ${
                    resolution === r.value
                      ? 'bg-teal text-night shadow-sm'
                      : 'text-slate-500 hover:text-white'
                  }`}>{r.label}</button>
              ))}
            </div>
          </div>

          <div className="h-64 relative">
            {chartLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-teal border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-600 text-xs font-mono">Loading chart...</p>
                </div>
              </div>
            ) : hasChart ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-12 h-12 rounded-xl bg-night-300 flex items-center justify-center text-2xl">📊</div>
                <div className="text-center">
                  <p className="text-slate-400 text-sm font-medium">Chart data unavailable</p>
                  <p className="text-slate-600 text-xs mt-1">Try a different time range or check back later</p>
                </div>
                <button onClick={() => { setChartLoading(true); loadCandles().finally(() => setChartLoading(false)); }}
                  className="text-xs text-teal hover:underline border border-teal/20 px-3 py-1.5 rounded-lg hover:bg-teal-dim transition-all">
                  ↺ Retry
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Trade buttons */}
        <div className="flex gap-3 mb-6">
          <button onClick={() => { setTradeModal('buy'); setQty(1); }}
            className="flex-1 btn-primary py-3.5 rounded-xl font-semibold text-base">
            🟢 Buy {symbol}
          </button>
          <button onClick={() => { setTradeModal('sell'); setQty(1); }}
            disabled={!holding || holding.quantity === 0}
            className="flex-1 btn-danger py-3.5 rounded-xl font-semibold text-base disabled:opacity-30 disabled:cursor-not-allowed">
            🔴 Sell {symbol}
          </button>
        </div>
        {!holding && <p className="text-center text-slate-600 text-xs mb-6">Buy shares to enable selling</p>}

        {/* Company description */}
        {profile?.description && (
          <div className="card mb-4">
            <h3 className="font-display text-white font-semibold mb-3 text-sm">About {profile?.name}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{profile.description}</p>
            <div className="flex flex-wrap gap-5 mt-4 pt-4 border-t border-night-300">
              {[
                { label: 'Sector',    value: profile?.sector },
                { label: 'Industry',  value: profile?.finnhubIndustry },
                { label: 'Country',   value: profile?.country },
                { label: 'Market Cap', value: profile?.marketCapitalization ? `$${Number(profile.marketCapitalization).toLocaleString()}M` : null },
                { label: 'Employees', value: profile?.employees ? Number(profile.employees).toLocaleString() : null },
              ].filter(i => i.value).map(i => (
                <div key={i.label}>
                  <p className="label">{i.label}</p>
                  <p className="text-white text-sm font-medium">{i.value}</p>
                </div>
              ))}
              {profile?.website && (
                <div>
                  <p className="label">Website</p>
                  <a href={profile.website} target="_blank" rel="noreferrer" className="text-teal text-sm hover:underline">{profile.website.replace(/https?:\/\//,'')}</a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Trade Modal ────────────────────────────────────────────────────── */}
      {tradeModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setTradeModal(null)}>
          <div className="bg-night-200 border border-night-300 rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-sm shadow-2xl animate-slide-up"
            onClick={e => e.stopPropagation()}>

            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display text-white font-bold text-lg">
                  {tradeModal === 'buy' ? '🟢 Buy' : '🔴 Sell'} {symbol}
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">{profile?.name || symbol}</p>
              </div>
              <button onClick={() => setTradeModal(null)} className="text-slate-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-night-300 transition-colors">✕</button>
            </div>

            <div className="space-y-3 mb-5">
              <div className="bg-night-300 rounded-xl p-3.5 flex justify-between items-center">
                <span className="text-slate-400 text-sm">Live Price</span>
                <span className="font-mono text-white font-bold">${quote?.c?.toFixed(2) || '—'}</span>
              </div>

              {tradeModal === 'buy' && (
                <div className="bg-night-300 rounded-xl p-3.5 flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Your Balance</span>
                  <span className="font-mono text-teal font-semibold">${user?.balance?.toFixed(2)}</span>
                </div>
              )}

              {tradeModal === 'sell' && holding && (
                <div className="bg-night-300 rounded-xl p-3.5 flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Shares Available</span>
                  <span className="font-mono text-white font-semibold">{holding.quantity}</span>
                </div>
              )}

              <div>
                <label className="label">Number of Shares</label>
                <div className="flex gap-2 items-center">
                  <button onClick={() => setQty(Math.max(1, parseInt(qty||1)-1))}
                    className="w-10 h-10 rounded-lg bg-night-300 text-white hover:bg-night-100 transition-colors font-bold text-lg flex-shrink-0">−</button>
                  <input type="number" min={1} max={tradeModal === 'sell' ? holding?.quantity : 99999}
                    value={qty} onChange={e => setQty(e.target.value)}
                    className="input text-center text-xl font-mono font-bold flex-1" />
                  <button onClick={() => setQty((parseInt(qty)||0)+1)}
                    className="w-10 h-10 rounded-lg bg-night-300 text-white hover:bg-night-100 transition-colors font-bold text-lg flex-shrink-0">+</button>
                </div>
              </div>

              <div className={`rounded-xl p-3.5 flex justify-between items-center border ${tradeModal === 'buy' ? 'border-teal/20 bg-teal-dim' : 'border-crimson/20 bg-crimson-dim'}`}>
                <span className="text-slate-300 text-sm font-medium">Total {tradeModal === 'buy' ? 'Cost' : 'Proceeds'}</span>
                <span className={`font-mono font-bold text-xl ${tradeModal === 'buy' ? 'text-teal' : 'text-crimson'}`}>
                  ${estimatedTotal}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setTradeModal(null)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleTrade} disabled={tradeLoading}
                className={`flex-1 font-semibold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50 ${
                  tradeModal === 'buy' ? 'btn-primary' : 'btn-danger'
                }`}>
                {tradeLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Processing...
                  </span>
                ) : `Confirm ${tradeModal === 'buy' ? 'Buy' : 'Sell'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
