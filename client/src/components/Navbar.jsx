import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGeneral } from '../context/GeneralContext';

const NAV = [
  { label: 'Dashboard', href: '/home',        icon: '⬡' },
  { label: 'Stocks',    href: '/stocks',       icon: '◈' },
  { label: 'Portfolio', href: '/portfolio',    icon: '◉' },
  { label: 'History',   href: '/history',      icon: '◷' },
  { label: 'Profile',   href: '/profile',      icon: '◎' },
];

export default function Navbar() {
  const { user, logout } = useGeneral();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-night-300 bg-night-100/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded bg-teal flex items-center justify-center">
            <span className="text-night font-display font-bold text-xs">SB</span>
          </div>
          <span className="font-display text-white font-bold text-lg tracking-tight">
            SB<span className="text-teal">Stocks</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(n => (
            <Link key={n.href} to={n.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-sans font-medium transition-all duration-150
                ${location.pathname === n.href
                  ? 'bg-teal-dim text-teal'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-night-300'}`}>
              {n.label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/admin" className={`px-3 py-1.5 rounded-lg text-sm font-sans font-medium transition-all duration-150
              ${location.pathname === '/admin' ? 'bg-gold/10 text-gold' : 'text-slate-400 hover:text-gold hover:bg-gold/5'}`}>
              Admin
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-night-300 rounded-lg px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-teal animate-pulse-slow"></span>
            <span className="font-mono text-xs text-teal font-medium">
              ${user?.balance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-night-300 border border-night-300 flex items-center justify-center text-xs font-mono text-teal font-bold">
              {user?.username?.[0]?.toUpperCase()}
            </div>
          </div>
          <button onClick={handleLogout}
            className="hidden sm:block text-xs text-slate-500 hover:text-crimson transition-colors font-sans">
            Logout
          </button>
          {/* Mobile hamburger */}
          <button className="md:hidden text-slate-400" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-night-300 bg-night-200 px-4 py-3 flex flex-col gap-2 animate-fade-in">
          {NAV.map(n => (
            <Link key={n.href} to={n.href} onClick={() => setMenuOpen(false)}
              className="text-sm font-sans text-slate-300 py-2 border-b border-night-300">
              {n.icon} {n.label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-sm text-gold py-2 border-b border-night-300">
              ★ Admin
            </Link>
          )}
          <div className="flex justify-between items-center pt-1">
            <span className="font-mono text-xs text-teal">${user?.balance?.toLocaleString()}</span>
            <button onClick={handleLogout} className="text-xs text-crimson">Logout</button>
          </div>
        </div>
      )}
    </header>
  );
}
