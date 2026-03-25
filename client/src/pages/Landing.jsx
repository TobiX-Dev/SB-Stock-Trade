import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '◈', title: 'Real-Time Data',     desc: 'Live US market quotes powered by Finnhub API.' },
  { icon: '◉', title: 'Virtual Portfolio',  desc: 'Practice with $100,000 virtual funds, zero risk.' },
  { icon: '◷', title: 'Trade History',      desc: 'Full log of every buy & sell transaction.' },
  { icon: '◎', title: 'Performance Charts', desc: 'Visualize stock performance with interactive charts.' },
  { icon: '⬡', title: 'Strategy Testing',   desc: 'Analyze past data and refine your approach.' },
  { icon: '★', title: 'Admin Panel',        desc: 'Full control over users, stocks, and platform data.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-night flex flex-col font-sans">
      {/* Header */}
      <header className="fixed top-0 w-full z-40 border-b border-night-300 bg-night/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-teal flex items-center justify-center">
              <span className="text-night font-display font-bold text-xs">SB</span>
            </div>
            <span className="font-display text-white font-bold text-lg">SB<span className="text-teal">Stocks</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"    className="btn-ghost text-sm py-2 px-4">Login</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-3xl mx-auto animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-teal-dim border border-teal/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse"></span>
            <span className="text-teal text-xs font-mono font-medium">Live US Market Data via Finnhub</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
            Paper Trade.<br />
            <span className="text-teal">Build Confidence.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10 font-sans leading-relaxed">
            Practice buying and selling real US stocks with $100,000 virtual funds.
            Zero risk, real market data, unlimited learning.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-primary text-base py-3 px-8 rounded-xl">
              Start Trading Free →
            </Link>
            <Link to="/login" className="btn-ghost text-base py-3 px-8 rounded-xl">
              Sign In
            </Link>
          </div>
        </div>

        {/* Mock terminal */}
        <div className="relative mt-16 max-w-2xl mx-auto bg-night-200 border border-night-300 rounded-2xl p-5 text-left animate-fade-in shadow-2xl">
          <div className="flex gap-1.5 mb-4">
            <span className="w-3 h-3 rounded-full bg-crimson/60"></span>
            <span className="w-3 h-3 rounded-full bg-gold/60"></span>
            <span className="w-3 h-3 rounded-full bg-teal/60"></span>
          </div>
          <div className="font-mono text-sm space-y-1.5 text-slate-300">
            {[
              { sym: 'AAPL',  price: '182.63', chg: '+1.24', pct: '+0.68%', up: true },
              { sym: 'TSLA',  price: '248.42', chg: '-3.18', pct: '-1.26%', up: false },
              { sym: 'NVDA',  price: '492.18', chg: '+8.74', pct: '+1.81%', up: true },
              { sym: 'GOOGL', price: '140.93', chg: '+0.52', pct: '+0.37%', up: true },
              { sym: 'MSFT',  price: '374.51', chg: '-1.20', pct: '-0.32%', up: false },
            ].map(s => (
              <div key={s.sym} className="flex justify-between items-center py-1 border-b border-night-300">
                <span className="text-white w-16">{s.sym}</span>
                <span className="text-slate-400 text-xs">${s.price}</span>
                <span className={s.up ? 'text-teal' : 'text-crimson'}>{s.chg}</span>
                <span className={`text-xs ${s.up ? 'text-teal' : 'text-crimson'}`}>{s.pct}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-night-300">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center font-display text-3xl font-bold text-white mb-3">Everything You Need to Trade</h2>
          <p className="text-center text-slate-500 mb-12">A complete paper trading platform for beginners and experienced traders.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="card hover:border-teal/30 transition-colors group">
                <div className="text-2xl text-teal mb-3 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="font-display text-white font-semibold mb-1.5">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center border-t border-night-300">
        <h2 className="font-display text-3xl font-bold text-white mb-4">Ready to Start Trading?</h2>
        <p className="text-slate-500 mb-8">Join SB Stocks and get $100,000 in virtual funds instantly.</p>
        <Link to="/register" className="btn-primary text-base py-3 px-10 rounded-xl">
          Create Free Account
        </Link>
      </section>

      <footer className="border-t border-night-300 py-6 text-center text-slate-600 text-sm font-sans">
        © 2024 SB Stocks · Paper Trading Platform · Built with MERN Stack
      </footer>
    </div>
  );
}
