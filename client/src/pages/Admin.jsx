import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../components/axiosInstance';
import StockSearchModal from '../components/StockSearchModal';
import { useGeneral } from '../context/GeneralContext';

const TABS = ['Overview', 'Users', 'Stocks', 'Transactions', 'Orders', 'Feedback', 'Bonus'];

export default function Admin() {
  const { fetchStocks } = useGeneral();
  const [tab, setTab]           = useState('Overview');
  const [users, setUsers]       = useState([]);
  const [stocks, setStocks]     = useState([]);
  const [transactions, setTxns] = useState([]);
  const [orders, setOrders]     = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [newStock, setNewStock] = useState({ symbol: '', companyName: '', exchange: 'NASDAQ', sector: 'Technology' });
  const [addLoading, setAddLoading] = useState(false);
  const [showStockSearch, setShowStockSearch] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.allSettled([loadUsers(), loadStocks(), loadTxns(), loadOrders(), loadStats()]);
    setLoading(false);
  };

  const loadUsers  = async () => { try { const { data } = await axiosInstance.get('/users/all'); setUsers(data); } catch {} };
  const loadStocks = async () => { try { const { data } = await axiosInstance.get('/stocks'); setStocks(data); } catch {} };
  const loadTxns   = async () => { try { const { data } = await axiosInstance.get('/transactions/all'); setTxns(data); } catch {} };
  const loadOrders = async () => { try { const { data } = await axiosInstance.get('/orders/all'); setOrders(data); } catch {} };
  const loadStats  = async () => { try { const { data } = await axiosInstance.get('/orders/stats'); setStats(data); } catch {} };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try { await axiosInstance.delete(`/users/${id}`); loadUsers(); toast.success('User deleted'); } catch { toast.error('Failed'); }
  };

  const deleteStock = async (id) => {
    if (!confirm('Remove this stock?')) return;
    try { await axiosInstance.delete(`/stocks/${id}`); loadStocks(); fetchStocks(); toast.success('Stock removed'); } catch { toast.error('Failed'); }
  };

  const addStock = async (e) => {
    e.preventDefault();
    if (!newStock.symbol || !newStock.companyName) return toast.error('Symbol and company name required');
    setAddLoading(true);
    try {
      await axiosInstance.post('/stocks', newStock);
      toast.success(`${newStock.symbol} added!`);
      setNewStock({ symbol: '', companyName: '', exchange: 'NASDAQ', sector: 'Technology' });
      loadStocks(); fetchStocks();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setAddLoading(false);
  };

  const totalVolume = transactions.reduce((s, t) => s + t.totalAmount, 0);

  return (
    <div className="pt-14 min-h-screen bg-night">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-bold">★</div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-500 text-sm">Platform management &amp; oversight</p>
          </div>
        </div>

        {/* Overview stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users',     value: users.length,          color: 'text-teal',    icon: '👤' },
            { label: 'Listed Stocks',   value: stocks.length,         color: 'text-blue-400', icon: '📈' },
            { label: 'Transactions',    value: transactions.length,   color: 'text-gold',    icon: '💼' },
            { label: 'Trading Volume',  value: `$${(totalVolume/1000).toFixed(1)}K`, color: 'text-white', icon: '💰' },
          ].map(c => (
            <div key={c.label} className="stat-card">
              <span className="text-xl">{c.icon}</span>
              <p className={`font-mono text-2xl font-bold ${c.color}`}>{loading ? '—' : c.value}</p>
              <p className="label mt-0">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                tab === t ? 'bg-teal-dim text-teal border border-teal/20' : 'text-slate-500 hover:text-white'
              }`}>{t}</button>
          ))}
        </div>

        {/* Tab: Users */}
        {tab === 'Users' && (
          <div className="card p-0 overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-night-300 bg-night-300">
                    {['Username','Email','Balance','Role','Joined','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className="table-row">
                      <td className="px-4 py-3 font-mono text-white font-semibold">{u.username}</td>
                      <td className="px-4 py-3 text-slate-400 text-sm">{u.email}</td>
                      <td className="px-4 py-3 font-mono text-teal text-sm">${u.balance?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${u.role === 'admin' ? 'bg-gold/10 text-gold' : 'bg-night-300 text-slate-400'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        {u.role !== 'admin' && (
                          <button onClick={() => deleteUser(u._id)} className="text-xs text-crimson hover:underline">Delete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Stocks */}
        {tab === 'Stocks' && (
          <div className="space-y-5 animate-fade-in">
            {/* Search Button */}
            <button onClick={() => setShowStockSearch(true)} className="btn-primary">
              🔍 Search & Add Stocks from Finnhub
            </button>

            {/* Add stock form */}
            <div className="card">
              <h3 className="font-display text-white font-semibold mb-4">Add New Stock Manually</h3>
              <form onSubmit={addStock} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="label">Symbol *</label>
                  <input value={newStock.symbol} onChange={e => setNewStock({...newStock, symbol: e.target.value.toUpperCase()})}
                    placeholder="AAPL" className="input" />
                </div>
                <div>
                  <label className="label">Company Name *</label>
                  <input value={newStock.companyName} onChange={e => setNewStock({...newStock, companyName: e.target.value})}
                    placeholder="Apple Inc." className="input" />
                </div>
                <div>
                  <label className="label">Exchange</label>
                  <select value={newStock.exchange} onChange={e => setNewStock({...newStock, exchange: e.target.value})}
                    className="input">
                    <option>NASDAQ</option><option>NYSE</option><option>AMEX</option>
                  </select>
                </div>
                <div>
                  <label className="label">Sector</label>
                  <input value={newStock.sector} onChange={e => setNewStock({...newStock, sector: e.target.value})}
                    placeholder="Technology" className="input" />
                </div>
                <div className="sm:col-span-2 lg:col-span-4">
                  <button type="submit" disabled={addLoading} className="btn-primary px-8">
                    {addLoading ? 'Adding...' : '+ Add Stock'}
                  </button>
                </div>
              </form>
            </div>

            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-night-300 bg-night-300">
                      {['Symbol','Company','Exchange','Sector','Status','Action'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stocks.map(s => (
                      <tr key={s._id} className="table-row">
                        <td className="px-4 py-3 font-mono text-white font-bold">{s.symbol}</td>
                        <td className="px-4 py-3 text-slate-400 text-sm">{s.companyName}</td>
                        <td className="px-4 py-3 text-slate-400 text-sm">{s.exchange}</td>
                        <td className="px-4 py-3 text-slate-400 text-sm">{s.sector}</td>
                        <td className="px-4 py-3"><span className="text-xs text-teal bg-teal-dim px-2 py-0.5 rounded">Active</span></td>
                        <td className="px-4 py-3">
                          <button onClick={() => deleteStock(s._id)} className="text-xs text-crimson hover:underline">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Transactions */}
        {tab === 'Transactions' && (
          <div className="card p-0 overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-night-300 bg-night-300">
                    {['User','Type','Symbol','Qty','Price','Total','Date'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t._id} className="table-row">
                      <td className="px-4 py-3 text-slate-300 text-sm">{t.user?.username || '—'}</td>
                      <td className="px-4 py-3"><span className={t.type === 'buy' ? 'badge-buy' : 'badge-sell'}>{t.type.toUpperCase()}</span></td>
                      <td className="px-4 py-3 font-mono text-white font-semibold">{t.symbol}</td>
                      <td className="px-4 py-3 font-mono text-white">{t.quantity}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">${t.price?.toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono text-white font-medium">${t.totalAmount?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{new Date(t.timestamp).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Orders */}
        {tab === 'Orders' && (
          <div className="card p-0 overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-night-300 bg-night-300">
                    {['User','Order','Symbol','Qty','Price','Total','Status','Date'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id} className="table-row">
                      <td className="px-4 py-3 text-slate-300 text-sm">{o.user?.username || '—'}</td>
                      <td className="px-4 py-3"><span className={o.orderType === 'buy' ? 'badge-buy' : 'badge-sell'}>{o.orderType?.toUpperCase()}</span></td>
                      <td className="px-4 py-3 font-mono text-white font-semibold">{o.symbol}</td>
                      <td className="px-4 py-3 font-mono text-white">{o.quantity}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">${o.price?.toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono text-white font-medium">${o.totalAmount?.toFixed(2)}</td>
                      <td className="px-4 py-3"><span className="text-xs text-teal bg-teal-dim px-2 py-0.5 rounded capitalize">{o.status}</span></td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Feedback */}
        {tab === 'Feedback' && (
          <div className="animate-fade-in">
            <div className="mb-4">
              <a href="/admin/feedback" className="inline-block bg-teal hover:bg-teal-dim px-4 py-2 rounded text-night font-semibold transition">
                Go to Feedback Dashboard →
              </a>
            </div>
          </div>
        )}

        {tab === 'Bonus' && (
          <div className="animate-fade-in">
            <div className="mb-4">
              <a href="/admin/bonus" className="inline-block bg-teal hover:bg-teal-dim px-4 py-2 rounded text-night font-semibold transition">
                Go to Bonus Management →
              </a>
            </div>
          </div>
        )}

        {/* Tab: Overview */}
        {tab === 'Overview' && (
          <div className="grid lg:grid-cols-2 gap-5 animate-fade-in">
            <div className="card">
              <h3 className="font-display text-white font-semibold mb-4">Platform Summary</h3>
              <div className="space-y-3">
                {[
                  { label: 'Total Users Registered',    value: users.length },
                  { label: 'Active Stocks Listed',      value: stocks.length },
                  { label: 'Total Transactions',         value: transactions.length },
                  { label: 'Buy Orders',                 value: transactions.filter(t=>t.type==='buy').length },
                  { label: 'Sell Orders',                value: transactions.filter(t=>t.type==='sell').length },
                  { label: 'Total Trading Volume',       value: `$${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
                ].map(s => (
                  <div key={s.label} className="flex justify-between items-center py-2 border-b border-night-300">
                    <span className="text-slate-400 text-sm">{s.label}</span>
                    <span className="font-mono text-white font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 className="font-display text-white font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-2">
                {transactions.slice(0, 8).map(t => (
                  <div key={t._id} className="flex items-center justify-between py-2 border-b border-night-300 text-sm">
                    <div className="flex items-center gap-2">
                      <span className={t.type === 'buy' ? 'badge-buy' : 'badge-sell'}>{t.type.toUpperCase()}</span>
                      <span className="font-mono text-white">{t.symbol}</span>
                      <span className="text-slate-500 text-xs">by {t.user?.username}</span>
                    </div>
                    <span className="font-mono text-slate-300 text-xs">${t.totalAmount?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stock Search Modal */}
      <StockSearchModal 
        isOpen={showStockSearch} 
        onClose={() => setShowStockSearch(false)}
        onAddStock={() => {
          loadStocks();
          fetchStocks();
        }}
      />
    </div>
  );
}
