import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../components/axiosInstance';
import { useGeneral } from '../context/GeneralContext';

export default function StocksPage() {
  const { stocks } = useGeneral();
  const [quotes, setQuotes]   = useState({});
  const [search, setSearch]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quotesLoading, setQuotesLoading] = useState(true);

  useEffect(() => {
    if (stocks.length > 0) fetchQuotes();
  }, [stocks]);

  const fetchQuotes = async () => {
    setQuotesLoading(true);
    try {
      const syms = stocks.map(s => s.symbol).join(',');
      const { data } = await axiosInstance.get(`/stocks/bulk-quotes?symbols=${syms}`);
      const map = {};
      data.forEach(d => { if (d.quote) map[d.symbol] = d.quote; });
      setQuotes(map);
    } catch {}
    setQuotesLoading(false);
  };

  const handleSearch = useCallback(async (val) => {
    setSearch(val);
    if (!val.trim()) return setResults([]);
    try {
      const { data } = await axiosInstance.get(`/stocks/search?q=${val}`);
      setResults((data.result || []).slice(0, 8).filter(r => r.type === 'Common Stock'));
    } catch {}
  }, []);

  const filtered = stocks.filter(s =>
    s.symbol.includes(search.toUpperCase()) ||
    s.companyName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-14 min-h-screen bg-night">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">US Stock Market</h1>
            <p className="text-slate-500 text-sm mt-1">{stocks.length} stocks · Live prices</p>
          </div>
          <div className="relative max-w-sm w-full">
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search stocks by symbol or name..."
              className="input pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">⌕</span>
            {/* Search dropdown */}
            {results.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-night-200 border border-night-300 rounded-xl shadow-2xl z-50 overflow-hidden">
                {results.map(r => (
                  <Link key={r.symbol} to={`/stocks/${r.symbol}`}
                    onClick={() => { setSearch(''); setResults([]); }}
                    className="flex items-center justify-between px-4 py-3 hover:bg-night-300 transition-colors">
                    <div>
                      <span className="text-white text-sm font-mono font-semibold">{r.symbol}</span>
                      <p className="text-slate-500 text-xs truncate max-w-xs">{r.description}</p>
                    </div>
                    <span className="text-slate-500 text-xs">{r.type}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-night-300 bg-night-300">
                  <th className="text-left px-5 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Symbol</th>
                  <th className="text-left px-5 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider hidden sm:table-cell">Company</th>
                  <th className="text-left px-5 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider hidden md:table-cell">Sector</th>
                  <th className="text-right px-5 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Price</th>
                  <th className="text-right px-5 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Change</th>
                  <th className="text-right px-5 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider hidden md:table-cell">High/Low</th>
                  <th className="text-center px-5 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Trade</th>
                </tr>
              </thead>
              <tbody>
                {(search ? filtered : stocks).map(stock => {
                  const q = quotes[stock.symbol];
                  const chg  = q ? (q.c - q.pc).toFixed(2) : null;
                  const pct  = q ? ((q.c - q.pc) / q.pc * 100).toFixed(2) : null;
                  const up   = parseFloat(chg) >= 0;
                  return (
                    <tr key={stock._id} className="table-row">
                      <td className="px-5 py-3.5">
                        <Link to={`/stocks/${stock.symbol}`} className="flex items-center gap-2 group">
                          <div className="w-8 h-8 rounded bg-night-300 flex items-center justify-center text-xs font-mono text-teal font-bold group-hover:bg-teal-dim transition-colors">
                            {stock.symbol[0]}
                          </div>
                          <span className="font-mono text-white font-semibold text-sm">{stock.symbol}</span>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 text-sm hidden sm:table-cell">{stock.companyName}</td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="text-xs bg-night-300 text-slate-400 px-2 py-0.5 rounded">{stock.sector}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-white font-medium">
                        {quotesLoading ? <span className="w-16 h-4 bg-night-300 rounded animate-pulse inline-block"></span>
                          : q ? `$${q.c.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {chg !== null ? (
                          <div className={`text-right ${up ? 'text-teal' : 'text-crimson'}`}>
                            <p className="font-mono text-sm font-medium">{up ? '+' : ''}{chg}</p>
                            <p className="text-xs">{up ? '▲' : '▼'} {Math.abs(pct)}%</p>
                          </div>
                        ) : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-right hidden md:table-cell">
                        {q ? (
                          <div className="font-mono text-xs text-slate-500">
                            <span className="text-teal">{q.h?.toFixed(2)}</span>
                            <span className="mx-1">/</span>
                            <span className="text-crimson">{q.l?.toFixed(2)}</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <Link to={`/stocks/${stock.symbol}`}
                          className="text-xs border border-teal text-teal hover:bg-teal hover:text-night px-3 py-1 rounded-lg transition-all font-medium">
                          Trade
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
