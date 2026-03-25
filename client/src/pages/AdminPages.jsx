// AllOrders.jsx
import { useState, useEffect } from 'react';
import axiosInstance from '../components/axiosInstance';

export function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/orders/all').then(({ data }) => { setOrders(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="pt-14 min-h-screen bg-night">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="font-display text-2xl font-bold text-white mb-6">All Orders</h1>
        {loading ? <p className="text-slate-500">Loading...</p> : (
          <div className="card p-0 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-night-300 bg-night-300">
                  {['User','Type','Symbol','Qty','Price','Total','Status','Date'].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-xs text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o=>(
                  <tr key={o._id} className="table-row">
                    <td className="px-4 py-3 text-slate-300">{o.user?.username}</td>
                    <td className="px-4 py-3"><span className={o.orderType==='buy'?'badge-buy':'badge-sell'}>{o.orderType?.toUpperCase()}</span></td>
                    <td className="px-4 py-3 font-mono text-white font-semibold">{o.symbol}</td>
                    <td className="px-4 py-3 font-mono text-white">{o.quantity}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">${o.price?.toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono text-white">${o.totalAmount?.toFixed(2)}</td>
                    <td className="px-4 py-3"><span className="text-xs text-teal bg-teal-dim px-2 py-0.5 rounded">{o.status}</span></td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// AllTransactions.jsx
export function AllTransactions() {
  const [txns, setTxns]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/transactions/all').then(({ data }) => { setTxns(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="pt-14 min-h-screen bg-night">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="font-display text-2xl font-bold text-white mb-6">All Transactions</h1>
        {loading ? <p className="text-slate-500">Loading...</p> : (
          <div className="card p-0 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-night-300 bg-night-300">
                  {['User','Type','Symbol','Qty','Price','Total','Date'].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-xs text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {txns.map(t=>(
                  <tr key={t._id} className="table-row">
                    <td className="px-4 py-3 text-slate-300">{t.user?.username}</td>
                    <td className="px-4 py-3"><span className={t.type==='buy'?'badge-buy':'badge-sell'}>{t.type?.toUpperCase()}</span></td>
                    <td className="px-4 py-3 font-mono text-white font-semibold">{t.symbol}</td>
                    <td className="px-4 py-3 font-mono text-white">{t.quantity}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">${t.price?.toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono text-white">${t.totalAmount?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{new Date(t.timestamp).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Users.jsx
export function Users() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/users/all').then(({ data }) => { setUsers(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="pt-14 min-h-screen bg-night">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-display text-2xl font-bold text-white mb-6">All Users ({users.length})</h1>
        {loading ? <p className="text-slate-500">Loading...</p> : (
          <div className="card p-0 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-night-300 bg-night-300">
                  {['Username','Email','Balance','Role','Phone','Joined'].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-xs text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u=>(
                  <tr key={u._id} className="table-row">
                    <td className="px-4 py-3 font-mono text-white font-semibold">{u.username}</td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{u.email}</td>
                    <td className="px-4 py-3 font-mono text-teal text-sm">${u.balance?.toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${u.role==='admin'?'bg-gold/10 text-gold':'bg-night-300 text-slate-400'}`}>{u.role}</span></td>
                    <td className="px-4 py-3 text-slate-500 text-sm">{u.phone || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// AdminStockChart.jsx
export function AdminStockChart() {
  return (
    <div className="pt-14 min-h-screen bg-night flex items-center justify-center">
      <p className="text-slate-500">Use <a href="/stocks" className="text-teal">Stock Pages</a> to view charts.</p>
    </div>
  );
}

export default AllOrders;
