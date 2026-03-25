import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import App from './App';
import { GeneralProvider } from './context/GeneralContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <GeneralProvider>
        <App />
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          theme="dark"
          toastStyle={{ background: '#141d35', border: '1px solid #1a2235', color: '#e2e8f0', fontFamily: 'DM Sans' }}
        />
      </GeneralProvider>
    </BrowserRouter>
  </React.StrictMode>
);
