import { Routes, Route, Navigate } from 'react-router-dom';
import { useGeneral } from './context/GeneralContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './components/Login';
import Register from './components/Register';
import Home from './pages/Home';
import StocksPage from './pages/Stocks';
import StockChart from './pages/StockChart';
import Portfolio from './pages/Portfolio';
import History from './pages/History';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import { AllOrders, AllTransactions, Users, AdminStockChart } from './pages/AdminPages';

const Private = ({ children }) => {
  const { user } = useGeneral();
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useGeneral();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/home" replace />;
  return children;
};

export default function App() {
  const { user } = useGeneral();

  return (
    <>
      {user && <Navbar />}
      <Routes>
        {/* Public */}
        <Route path="/"         element={user ? <Navigate to="/home" /> : <Landing />} />
        <Route path="/login"    element={user ? <Navigate to="/home" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/home" /> : <Register />} />

        {/* Protected User Routes */}
        <Route path="/home"        element={<Private><Home /></Private>} />
        <Route path="/stocks"      element={<Private><StocksPage /></Private>} />
        <Route path="/stocks/:symbol" element={<Private><StockChart /></Private>} />
        <Route path="/portfolio"   element={<Private><Portfolio /></Private>} />
        <Route path="/history"     element={<Private><History /></Private>} />
        <Route path="/profile"     element={<Private><Profile /></Private>} />

        {/* Admin Routes */}
        <Route path="/admin"             element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="/admin/orders"      element={<AdminRoute><AllOrders /></AdminRoute>} />
        <Route path="/admin/transactions"element={<AdminRoute><AllTransactions /></AdminRoute>} />
        <Route path="/admin/users"       element={<AdminRoute><Users /></AdminRoute>} />
        <Route path="/admin/stocks"      element={<AdminRoute><AdminStockChart /></AdminRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}
