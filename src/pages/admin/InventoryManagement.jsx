import { useState, useEffect } from 'react';
import { Search, RefreshCw, Package, AlertCircle, Check, X, Plus, Minus, Save } from 'lucide-react';
import overlay from '../../assets/overlay.png';
import useAuthCheck from '../../hooks/useAuthCheck';
import AdminSidebar from '../../components/AdminSidebar';

function InventoryManagement() {
    // Check if the user is authenticated and has admin role
    useAuthCheck();

    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredInventory, setFilteredInventory] = useState([]);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
    const [updatingItem, setUpdatingItem] = useState(null);
    const [stockChanges, setStockChanges] = useState({});

    // Fetch inventory
    useEffect(() => {
        fetchInventory();
    }, []);

    // Filter inventory based on search term
    useEffect(() => {
        if (!inventory) return;

        let filtered = [...inventory];

        // Apply search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(search) ||
                String(item.game_id).includes(search)
            );
        }

        setFilteredInventory(filtered);
    }, [searchTerm, inventory]);

    const fetchInventory = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:3000/admin/inventory', {
                credentials: 'include'
            });

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

    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
        setTimeout(() => {
            setToast({ visible: false, message: '', type: 'success' });
        }, 3000);
    };

    // Handle stock quantity change
    const handleStockChange = (gameId, operation) => {
        // Initialize if not already set
        if (!stockChanges[gameId]) {
            const inventoryItem = inventory.find(item => item.game_id === gameId);
            stockChanges[gameId] = inventoryItem.stock_quantity;
        }

        let newValue = stockChanges[gameId];

        if (operation === 'increase') {
            newValue = newValue + 1;
        } else if (operation === 'decrease') {
            newValue = Math.max(0, newValue - 1);
        }

        setStockChanges({
            ...stockChanges,
            [gameId]: newValue
        });
    };

    // Handle direct input of stock quantity
    const handleStockInputChange = (gameId, value) => {
        const numericValue = Math.max(0, parseInt(value) || 0);

        setStockChanges({
            ...stockChanges,
            [gameId]: numericValue
        });
    };

    // Get current stock quantity (actual or changed)
    const getCurrentStock = (gameId, defaultStock) => {
        return stockChanges[gameId] !== undefined ? stockChanges[gameId] : defaultStock;
    };

    // Check if stock has changed
    const hasStockChanged = (gameId, originalStock) => {
        return stockChanges[gameId] !== undefined && stockChanges[gameId] !== originalStock;
    };

    // Update stock quantity
    const updateStockQuantity = async (gameId) => {
        if (!stockChanges[gameId] && stockChanges[gameId] !== 0) return;

        setUpdatingItem(gameId);

        try {
            const response = await fetch(`http://localhost:3000/admin/inventory/${gameId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    stockQuantity: stockChanges[gameId]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update inventory');
            }

            // Update local inventory data
            setInventory(inventory.map(item =>
                item.game_id === gameId
                    ? { ...item, stock_quantity: stockChanges[gameId] }
                    : item
            ));

            // Remove from changes after successful update
            const newChanges = { ...stockChanges };
            delete newChanges[gameId];
            setStockChanges(newChanges);

            showToast('Inventory updated successfully', 'success');
        } catch (error) {
            console.error('Error updating inventory:', error);
            showToast(`Failed to update inventory: ${error.message}`, 'error');
        } finally {
            setUpdatingItem(null);
        }
    };

    // Reset stock change for a specific item
    const resetStockChange = (gameId) => {
        const newChanges = { ...stockChanges };
        delete newChanges[gameId];
        setStockChanges(newChanges);
    };

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white"
            style={{ backgroundImage: `url(${overlay})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>

            {/* Admin Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <div className="lg:ml-64 transition-all duration-300">
                <div className="p-4 md:p-8">
                    {/* Toast Notification */}
                    {toast.visible && (
                        <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 animate-fadeIn
                            bg-black/80 backdrop-blur-md border ${toast.type === 'success' ? 'border-green-500/30' : 'border-red-500/30'} max-w-md`}>
                            {toast.type === 'success' ? (
                                <Check className="h-5 w-5 text-green-400" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-red-400" />
                            )}
                            <span className="text-white text-sm">{toast.message}</span>
                            <button
                                onClick={() => setToast(prev => ({ ...prev, visible: false }))}
                                className="ml-2 text-white/50 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {/* Header */}
                    <header className="mb-8">
                        <h1 className="text-2xl font-bold">Inventory Management</h1>
                        <p className="text-gray-400">Manage stock levels for all games</p>
                    </header>

                    {/* Search Bar */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search Input */}
                            <div className="relative flex-grow">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={16} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by game title or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C5DF9]/50"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Refresh Button */}
                            <button
                                onClick={fetchInventory}
                                className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <RefreshCw size={16} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6 text-center">
                            <p className="text-red-200 flex items-center justify-center gap-2">
                                <AlertCircle size={16} />
                                {error}
                            </p>
                            <button
                                className="mt-2 text-sm text-white/80 hover:text-white underline"
                                onClick={fetchInventory}
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Loading Indicator */}
                    {loading && (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7C5DF9]"></div>
                        </div>
                    )}

                    {/* Inventory Table */}
                    {!loading && !error && (
                        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
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
                                            className="px-4 py-2 bg-[#7C5DF9] hover:bg-[#6A4FF0] rounded-lg transition-colors"
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
                                                    Current Stock
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/10">
                                            {filteredInventory.map(item => (
                                                <tr key={item.inventory_id} className="hover:bg-white/5">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                        {item.game_id}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            {item.gameicon ? (
                                                                <img
                                                                    src={item.gameicon}
                                                                    alt={item.title}
                                                                    className="h-10 w-10 rounded-lg mr-3 object-cover bg-black/30"
                                                                />
                                                            ) : (
                                                                <div className="h-10 w-10 rounded-lg mr-3 bg-[#7C5DF9]/20 flex items-center justify-center">
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
                                                                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-l-lg transition-colors"
                                                            >
                                                                <Minus size={16} />
                                                            </button>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={getCurrentStock(item.game_id, item.stock_quantity)}
                                                                onChange={(e) => handleStockInputChange(item.game_id, e.target.value)}
                                                                className={`w-16 text-center bg-black/30 border-y border-white/10 py-1.5 focus:outline-none focus:ring-0 
                                                                  ${hasStockChanged(item.game_id, item.stock_quantity) ? 'text-[#7C5DF9] font-bold' : 'text-white'}`}
                                                            />
                                                            <button
                                                                onClick={() => handleStockChange(item.game_id, 'increase')}
                                                                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-r-lg transition-colors"
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            {hasStockChanged(item.game_id, item.stock_quantity) && (
                                                                <>
                                                                    <button
                                                                        onClick={() => updateStockQuantity(item.game_id)}
                                                                        disabled={updatingItem === item.game_id}
                                                                        className="p-1.5 bg-[#7C5DF9]/20 text-[#7C5DF9] rounded-lg hover:bg-[#7C5DF9]/30 transition-colors"
                                                                        title="Save Changes"
                                                                    >
                                                                        {updatingItem === item.game_id ? (
                                                                            <div className="h-4 w-4 border-2 border-[#7C5DF9] border-t-transparent rounded-full animate-spin"></div>
                                                                        ) : (
                                                                            <Save size={16} />
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => resetStockChange(item.game_id)}
                                                                        className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                                                        title="Cancel Changes"
                                                                    >
                                                                        <X size={16} />
                                                                    </button>
                                                                </>
                                                            )}
                                                            {/* Removed the edit/view button */}
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
