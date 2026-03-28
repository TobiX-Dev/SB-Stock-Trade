import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../components/axiosInstance';

const GeneralContext = createContext();

export const GeneralProvider = ({ children }) => {
  const [user, setUser]     = useState(() => JSON.parse(localStorage.getItem('sbUser') || 'null'));
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);

  const login = async (userData, token) => {
    try {
      // Extract token from userData if it exists
      if (userData?.token) {
        token = userData.token;
      }
      
      // Extract user object from userData if it's nested
      let userObj = userData?.user || userData;
      
      // If we have a token but no username, fetch the user profile
      if (token && !userObj?.username) {
        const { data } = await axiosInstance.get('/users/profile');
        userObj = data;
      }
      
      // Store token and user
      if (token) {
        localStorage.setItem('authToken', token);
      }
      
      setUser(userObj);
      localStorage.setItem('sbUser', JSON.stringify(userObj));
    } catch (err) {
      console.error('Login error:', err.message);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sbUser');
    localStorage.removeItem('authToken');
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
