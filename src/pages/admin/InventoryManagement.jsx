/********************************************************
 * InventoryManagement Component
 * Admin interface for managing game stock levels
 ********************************************************/
import { useState, useEffect } from 'react';
import { Search, RefreshCw, Package, AlertCircle, Check, X, Plus, Minus } from 'lucide-react';
import overlay from '../../assets/overlay.png';
import useAuthCheck from '../../hooks/useAuthCheck';
import AdminSidebar from '../../components/AdminSidebar';
import MobileAdminRedirect from '../../components/MobileAdminRedirect';
import Loader from '../../components/Loader';
import Toast from '../../components/Toast';

function InventoryManagement() {
  // Check admin authentication
  useAuthCheck();

  // State management
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success',
  });
  const [updatingItem, setUpdatingItem] = useState(null);
  const [stockChanges, setStockChanges] = useState({});
  const [debounceTimers, setDebounceTimers] = useState({});
  const [searchTimer, setSearchTimer] = useState(null);

  /********************************************************
   * Data Loading and Searching
   ********************************************************/
  // Load inventory on component mount
  useEffect(() => {
    fetchInventory();
  }, []);

  // Debounced search processing
  useEffect(() => {
    if (searchTimer) {
      clearTimeout(searchTimer);
    }

    if (!searchTerm.trim()) {
      // If search is cleared, show all inventory
      fetchInventory();
      return;
    }

    // Debounce search to prevent excessive API calls
    const timer = setTimeout(() => {
      fetchInventoryBySearch(searchTerm);
    }, 500);

    setSearchTimer(timer);

    return () => {
      if (searchTimer) clearTimeout(searchTimer);
    };
  }, [searchTerm]);

  // Get all inventory items
  const fetchInventory = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        'https://zogstorebackend-production.up.railway.app/admin/inventory',
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }

      const data = await response.json();
      setInventory(data);
      setFilteredInventory(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError('Failed to load inventory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Search inventory by game title
  const fetchInventoryBySearch = async (title) => {
    if (!title.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://zogstorebackend-production.up.railway.app/games/search?title=${encodeURIComponent(title)}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search inventory');
      }

      const data = await response.json();
      setInventory(data);
      setFilteredInventory(data);
    } catch (error) {
      console.error('Error searching inventory:', error);
      setError('Failed to search inventory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /********************************************************
   * Notification Functions
   ********************************************************/
  // Show toast notification
  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({ visible: true, message, type });

    // Only set timeout to hide for success/error messages, not for "updating" messages
    if (type !== 'updating') {
      setTimeout(() => {
        setToast({ visible: false, message: '', type: 'success' });
      }, duration);
    }
  };

  // Hide toast notification
  const closeToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  /********************************************************
   * Inventory Management Functions
   ********************************************************/
  // Debounce stock updates to prevent API flooding
  const debounceStockUpdate = (gameId, stockQuantity) => {
    // Cancel any existing timer for this gameId
    if (debounceTimers[gameId]) {
      clearTimeout(debounceTimers[gameId]);
    }

    // Show updating toast
    showToast(`Updating stock for game #${gameId}...`, 'updating');

    // Set a new timer
    const timerId = setTimeout(() => {
      updateStockQuantity(gameId, stockQuantity);
      // Remove this timer from the timers object when done
      setDebounceTimers((prev) => {
        const newTimers = { ...prev };
        delete newTimers[gameId];
        return newTimers;
      });
    }, 800); // 800ms debounce time

    // Store the timer id
    setDebounceTimers((prev) => ({
      ...prev,
      [gameId]: timerId,
    }));
  };

  // Handle stock quantity change
  const handleStockChange = (gameId, operation) => {
    // Find the current inventory item
    const inventoryItem = inventory.find((item) => item.game_id === gameId);
    const currentStock =
      stockChanges[gameId] !== undefined ? stockChanges[gameId] : inventoryItem.stock_quantity;

    let newValue = currentStock;

    if (operation === 'increase') {
      newValue = newValue + 1;
    } else if (operation === 'decrease') {
      newValue = Math.max(0, newValue - 1);
    }

    // Update local state immediately for responsive UI
    setStockChanges({
      ...stockChanges,
      [gameId]: newValue,
    });

    // Update the inventory item in the database with debounce
    setUpdatingItem(gameId);
    debounceStockUpdate(gameId, newValue);
  };

  // Direct input for stock quantity
  const handleStockInputChange = (gameId, value) => {
    const numericValue = Math.max(0, parseInt(value) || 0);

    // Update local state immediately for responsive UI
    setStockChanges({
      ...stockChanges,
      [gameId]: numericValue,
    });

    // Update the inventory item in the database with debounce
    setUpdatingItem(gameId);
    debounceStockUpdate(gameId, numericValue);
  };

  // Get current stock value (from local state or original)
  const getCurrentStock = (gameId, defaultStock) => {
    return stockChanges[gameId] !== undefined ? stockChanges[gameId] : defaultStock;
  };

  // Update stock quantity in database
  const updateStockQuantity = async (gameId, stockQuantity) => {
    try {
      const response = await fetch(
        `https://zogstorebackend-production.up.railway.app/admin/inventory?gameId=${gameId}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            stockQuantity: stockQuantity,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update inventory');
      }

      // Update local inventory data
      setInventory(
        inventory.map((item) =>
          item.game_id === gameId ? { ...item, stock_quantity: stockQuantity } : item
        )
      );

      showToast('Inventory updated successfully', 'success');
    } catch (error) {
      console.error('Error updating inventory:', error);
      showToast(`Failed to update inventory: ${error.message}`, 'error');

      // Revert the change in the UI
      const inventoryItem = inventory.find((item) => item.game_id === gameId);
      if (inventoryItem) {
        setStockChanges((prev) => ({
          ...prev,
          [gameId]: inventoryItem.stock_quantity,
        }));
      }
    } finally {
      setUpdatingItem(null);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#0A0A0B] text-white"
      style={{
        backgroundImage: `url(${overlay})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Mobile Redirect */}
      <MobileAdminRedirect />

      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Toast Component */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />

      {/* Main Content */}
      <div className="lg:ml-64 transition-all duration-300">
        <div className="p-4 md:p-8">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-2xl font-bold">Inventory Management</h1>
            <p className="text-gray-400">Manage stock levels for all games</p>
          </header>

          {/* Search Bar */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by game title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C5DF9]/50"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchInventory}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-3xl p-4 mb-6 text-center">
              <p className="text-red-200 flex items-center justify-center gap-2">
                <AlertCircle size={16} />
                {error}
              </p>
              <button
                className="mt-2 text-sm text-white/80 hover:text-white underline cursor-pointer"
                onClick={fetchInventory}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <Loader size="large" logoSize="small" />
            </div>
          )}

          {/* Inventory Table */}
          {!loading && !error && (
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
              {filteredInventory.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#7C5DF9]/20 rounded-full mb-4">
                    <Package size={24} className="text-[#7C5DF9]" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No inventory found</h3>
                  <p className="text-gray-400 mb-4">
                    {searchTerm
                      ? `No inventory items match your search for "${searchTerm}"`
                      : 'There are no inventory items in the database'}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="px-4 py-2 bg-[#7C5DF9] hover:bg-[#6A4FF0] rounded-xl transition-colors cursor-pointer"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-black/20">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Game ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Stock Quantity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredInventory.map((item) => (
                        <tr
                          key={item.inventory_id}
                          className={`hover:bg-white/5 ${
                            updatingItem === item.game_id ? 'bg-[#7C5DF9]/5' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {item.game_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {item.gameicon ? (
                                <img
                                  src={item.gameicon}
                                  alt={item.title}
                                  className="h-10 w-10 rounded-xl mr-3 object-cover bg-black/30"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-3xl mr-3 bg-[#7C5DF9]/20 flex items-center justify-center">
                                  <span className="text-[#7C5DF9]">{item.title.charAt(0)}</span>
                                </div>
                              )}
                              <div className="font-medium">{item.title}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <button
                                onClick={() => handleStockChange(item.game_id, 'decrease')}
                                className={`p-1.5 bg-white/10 hover:bg-white/20 rounded-l-lg transition-colors ${
                                  updatingItem === item.game_id ? 'opacity-50' : 'cursor-pointer'
                                }`}
                                disabled={updatingItem === item.game_id}
                              >
                                <Minus size={16} />
                              </button>
                              <input
                                type="number"
                                min="0"
                                value={getCurrentStock(item.game_id, item.stock_quantity)}
                                onChange={(e) =>
                                  handleStockInputChange(item.game_id, e.target.value)
                                }
                                className={`w-16 text-center bg-black/30 py-1 focus:outline-none focus:ring-0 
                                                                ${
                                                                  updatingItem === item.game_id
                                                                    ? 'text-[#7C5DF9] animate-pulse cursor-not-allowed'
                                                                    : 'text-white cursor-text'
                                                                }`}
                                disabled={updatingItem === item.game_id}
                              />
                              <button
                                onClick={() => handleStockChange(item.game_id, 'increase')}
                                className={`p-1.5 bg-white/10 hover:bg-white/20 rounded-r-lg transition-colors ${
                                  updatingItem === item.game_id ? 'opacity-50' : 'cursor-pointer'
                                }`}
                                disabled={updatingItem === item.game_id}
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InventoryManagement;
