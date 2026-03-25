import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../components/axiosInstance';

const GeneralContext = createContext();

export const GeneralProvider = ({ children }) => {
  const [user, setUser]     = useState(() => JSON.parse(localStorage.getItem('sbUser') || 'null'));
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('sbUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sbUser');
  };

  const refreshUser = async () => {
    try {
      const { data } = await axiosInstance.get('/users/profile');
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem('sbUser', JSON.stringify(updated));
    } catch {}
  };

  const fetchStocks = async () => {
    try {
      const { data } = await axiosInstance.get('/stocks');
      setStocks(data);
    } catch {}
  };

  useEffect(() => {
    if (user) fetchStocks();
  }, [user]);

  return (
    <GeneralContext.Provider value={{ user, login, logout, refreshUser, stocks, fetchStocks, loading, setLoading }}>
      {children}
    </GeneralContext.Provider>
  );
};

export const useGeneral = () => useContext(GeneralContext);
export default GeneralContext;
