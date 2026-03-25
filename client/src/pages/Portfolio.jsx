import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import axiosInstance from '../components/axiosInstance';
import { useGeneral } from '../context/GeneralContext';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ['#00d4aa','#3b82f6','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#10b981','#f97316'];

export default function Portfolio() {
  const { user } = useGeneral();
  const [portfolio, setPortfolio] = useState(null);
  const [quotes, setQuotes]   = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPortfolio(); }, []);

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/transactions/portfolio');
      setPortfolio(data);
      if (data.holdings?.length > 0) {
        const syms = data.holdings.map(h => h.symbol).join(',');
        const { data: qData } = await axiosInstance.get(`/stocks/bulk-quotes?symbols=${syms}`);
        const map = {};
        qData.forEach(d => { if (d.quote) map[d.symbol] = d.quote; });
        setQuotes(map);
      }
    } catch {}
    setLoading(false);
  };

  const enriched = portfolio?.holdings?.map(h => {
    const q = quotes[h.symbol];
    const curPrice = q?.c || h.avgBuyPrice;
    const value    = curPrice * h.quantity;
    const cost     = h.avgBuyPrice * h.quantity;
    const pnl      = value - cost;
    const pct      = ((pnl / cost) * 100).toFixed(2);
    return { ...h, curPrice, value, cost, pnl, pct };
  }) || [];

  const totalValue  = enriched.reduce((s, h) => s + h.value, 0);
  const totalCost   = enriched.reduce((s, h) => s + h.cost,  0);
  const totalPnL    = totalValue - totalCost;
  const totalPnLPct = totalCost > 0 ? ((totalPnL / totalCost) * 100).toFixed(2) : 0;

  const donutData = enriched.length > 0 ? {
    labels: enriched.map(h => h.symbol),
    datasets: [{ data: enriched.map(h => h.value.toFixed(2)), backgroundColor: COLORS, borderWidth: 0 }]
  } : null;

  return (
    <div className="pt-14 min-h-screen bg-night">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-white">My Portfolio</h1>
          <p className="text-slate-500 text-sm mt-1">Track your virtual holdings and performance</p>
        </div>

        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_,i) => <div key={i} className="h-20 bg-night-200 rounded-xl animate-pulse"></div>)}</div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Portfolio Value', value: `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'text-white' },
                { label: 'Total Cost',      value: `$${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'text-slate-300' },
                { label: 'Unrealized P&L',  value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`, color: totalPnL >= 0 ? 'text-teal' : 'text-crimson' },
                { label: 'Return',          value: `${totalPnLPct >= 0 ? '+' : ''}${totalPnLPct}%`, color: totalPnLPct >= 0 ? 'text-teal' : 'text-crimson' },
              ].map(c => (
                <div key={c.label} className="stat-card">
                  <p className="label">{c.label}</p>
                  <p className={`font-mono text-xl font-bold ${c.color}`}>{c.value}</p>
                </div>
              ))}
            </div>

            {enriched.length === 0 ? (
              <div className="card text-center py-16">
                <p className="text-4xl mb-4">📭</p>
                <h2 className="font-display text-white text-lg font-bold mb-2">Your portfolio is empty</h2>
                <p className="text-slate-500 text-sm mb-5">Start buying stocks to build your virtual portfolio.</p>
                <Link to="/stocks" className="btn-primary px-8">Browse Stocks →</Link>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Holdings table */}
                <div className="lg:col-span-2 card p-0 overflow-hidden">
                  <div className="px-5 py-4 border-b border-night-300">
                    <h2 className="font-display text-white font-semibold">Holdings ({enriched.length})</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-night-300 bg-night-300">
                          {['Stock','Qty','Avg Buy','Current','Value','P&L','%'].map(h => (
                            <th key={h} className="px-4 py-2.5 text-left text-xs text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {enriched.map(h => (
                          <tr key={h.symbol} className="table-row">
                            <td className="px-4 py-3">
                              <Link to={`/stocks/${h.symbol}`} className="flex items-center gap-2 group">
                                <div className="w-7 h-7 rounded bg-night-300 flex items-center justify-center text-xs font-mono text-teal group-hover:bg-teal-dim">
                                  {h.symbol[0]}
                                </div>
                                <span className="font-mono text-white font-semibold text-sm">{h.symbol}</span>
                              </Link>
                            </td>
                            <td className="px-4 py-3 font-mono text-white text-sm">{h.quantity}</td>
                            <td className="px-4 py-3 font-mono text-slate-400 text-sm">${h.avgBuyPrice.toFixed(2)}</td>
                            <td className="px-4 py-3 font-mono text-white text-sm">${h.curPrice.toFixed(2)}</td>
                            <td className="px-4 py-3 font-mono text-white text-sm font-medium">${h.value.toFixed(2)}</td>
                            <td className={`px-4 py-3 font-mono text-sm font-medium ${h.pnl >= 0 ? 'text-teal' : 'text-crimson'}`}>
                              {h.pnl >= 0 ? '+' : ''}${h.pnl.toFixed(2)}
                            </td>
                            <td className={`px-4 py-3 font-mono text-sm ${h.pct >= 0 ? 'text-teal' : 'text-crimson'}`}>
                              {h.pct >= 0 ? '+' : ''}{h.pct}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Donut chart */}
                <div className="card flex flex-col">
                  <h2 className="font-display text-white font-semibold mb-4">Allocation</h2>
                  {donutData && (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-56 h-56">
                        <Doughnut data={donutData} options={{
                          plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 11 }, padding: 10 } } },
                          cutout: '65%'
                        }} />
                      </div>
                    </div>
                  )}
                  <div className="mt-4 space-y-2">
                    {enriched.map((h, i) => (
                      <div key={h.symbol} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></span>
                          <span className="font-mono text-slate-400">{h.symbol}</span>
                        </div>
                        <span className="font-mono text-slate-300">{totalValue > 0 ? ((h.value/totalValue)*100).toFixed(1) : 0}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
