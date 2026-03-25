import { useState, useEffect } from 'react';
import axiosInstance from '../components/axiosInstance';

export default function History() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  useEffect(() => { loadTransactions(); }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/transactions/my');
      setTransactions(data);
    } catch {}
    setLoading(false);
  };

  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.type === filter);

  const totalBought = transactions.filter(t => t.type === 'buy').reduce((s, t) => s + t.totalAmount, 0);
  const totalSold   = transactions.filter(t => t.type === 'sell').reduce((s, t) => s + t.totalAmount, 0);

  return (
    <div className="pt-14 min-h-screen bg-night">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-white">Transaction History</h1>
          <p className="text-slate-500 text-sm mt-1">{transactions.length} total transactions</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Bought', value: `$${totalBought.toFixed(2)}`, color: 'text-teal' },
            { label: 'Total Sold',   value: `$${totalSold.toFixed(2)}`,   color: 'text-crimson' },
            { label: 'Transactions', value: transactions.length,          color: 'text-white' },
          ].map(c => (
            <div key={c.label} className="stat-card">
              <p className="label">{c.label}</p>
              <p className={`font-mono text-xl font-bold ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-5">
          {['all', 'buy', 'sell'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                filter === f ? (f === 'buy' ? 'bg-teal-dim text-teal' : f === 'sell' ? 'bg-crimson-dim text-crimson' : 'bg-night-300 text-white')
                  : 'text-slate-500 hover:text-white'
              }`}>{f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="h-16 bg-night-200 rounded-xl animate-pulse"></div>)}</div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-slate-500">No {filter === 'all' ? '' : filter} transactions yet</p>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-night-300 bg-night-300">
                    {['Type','Symbol','Company','Shares','Price','Total','Date'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t._id} className="table-row animate-fade-in">
                      <td className="px-4 py-3.5">
                        <span className={t.type === 'buy' ? 'badge-buy' : 'badge-sell'}>{t.type.toUpperCase()}</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-white font-semibold">{t.symbol}</td>
                      <td className="px-4 py-3.5 text-slate-400 text-sm max-w-xs truncate">{t.companyName}</td>
                      <td className="px-4 py-3.5 font-mono text-white">{t.quantity}</td>
                      <td className="px-4 py-3.5 font-mono text-slate-300">${t.price?.toFixed(2)}</td>
                      <td className="px-4 py-3.5 font-mono text-white font-medium">${t.totalAmount?.toFixed(2)}</td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs font-mono whitespace-nowrap">
                        {new Date(t.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        <br/>
                        {new Date(t.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
