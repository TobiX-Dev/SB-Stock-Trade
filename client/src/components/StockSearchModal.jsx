import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from './axiosInstance';

export default function StockSearchModal({ isOpen, onClose, onAddStock }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [addingStock, setAddingStock] = useState(false);

  useEffect(() => {
    if (searchQuery.length > 1) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const performSearch = async () => {
    setSearching(true);
    try {
      const { data } = await axiosInstance.post('/stocks/admin/search-finnhub', { query: searchQuery });
      setSearchResults(data.results || []);
    } catch (error) {
      toast.error('Failed to search stocks');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddStock = async (stock) => {
    setAddingStock(true);
    try {
      await axiosInstance.post('/stocks', {
        symbol: stock.symbol,
        companyName: stock.description || stock.displaySymbol,
        exchange: stock.mic || 'NASDAQ',
        sector: stock.sector || 'Technology',
        logo: stock.logo || '',
      });
      toast.success(`✅ Added ${stock.symbol} to platform!`);
      setSelectedStock(null);
      setSearchQuery('');
      setSearchResults([]);
      if (onAddStock) onAddStock();
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('already')) {
        toast.info('Stock already added to platform');
      } else {
        toast.error(error.response?.data?.message || 'Failed to add stock');
      }
    } finally {
      setAddingStock(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-night-300 rounded-2xl border border-night-300 w-full max-w-2xl max-h-96 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-night-300">
          <h2 className="text-xl font-bold text-white">Search & Add Stocks</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-night-300">
          <input
            type="text"
            placeholder="Search by symbol or company name (e.g., AAPL, Microsoft)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
            className="w-full bg-night rounded-lg px-4 py-2 text-white placeholder-slate-500 border border-night-300 focus:outline-none focus:border-teal"
            autoFocus
          />
          {searching && <p className="text-xs text-slate-500 mt-2">Searching Finnhub...</p>}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {searchResults.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              {searchQuery ? 'No stocks found' : 'Type to search...'}
            </div>
          ) : (
            <div className="divide-y divide-night-300">
              {searchResults.map((stock, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedStock(stock)}
                  className={`w-full text-left p-4 hover:bg-night-200 transition-colors ${
                    selectedStock?.symbol === stock.symbol ? 'bg-teal/10 border-l-2 border-teal' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-white">{stock.symbol}</p>
                      <p className="text-sm text-slate-400">{stock.description}</p>
                      <p className="text-xs text-slate-500 mt-1">{stock.mic || stock.exchange || 'NASDAQ'}</p>
                    </div>
                    {stock.logo && (
                      <img src={stock.logo} alt={stock.symbol} className="w-8 h-8 rounded" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Stock Preview & Action */}
        {selectedStock && (
          <div className="p-6 border-t border-night-300 bg-night-400">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-400">Selected Stock</p>
                <p className="font-bold text-white text-lg">{selectedStock.symbol}</p>
                <p className="text-sm text-slate-400">{selectedStock.description}</p>
              </div>
              <button
                onClick={() => handleAddStock(selectedStock)}
                disabled={addingStock}
                className="bg-teal hover:bg-teal-dim disabled:opacity-50 text-night font-bold py-2 px-6 rounded-lg transition"
              >
                {addingStock ? 'Adding...' : 'Add Stock'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
