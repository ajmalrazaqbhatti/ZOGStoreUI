import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Filter,
  Truck,
  Ban,
  Search,
  Calendar,
  DollarSign,
  Inbox,
  RefreshCw,
  CreditCard,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import overlay from '../../assets/overlay.png';
import useAuthCheck from '../../hooks/useAuthCheck';
import Loader from '../../components/Loader';
import Toast from '../../components/Toast';

/********************************************************
 * OrdersPage Component
 * Displays user's order history with filtering options
 ********************************************************/
function OrdersPage() {
  // Check if the user is authenticated
  useAuthCheck();

  // Get location and navigate for URL handling
  const location = useLocation();
  const navigate = useNavigate();

  // State management for orders and UI elements
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [searchResults, setSearchResults] = useState(null);

  // Check for URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get('orderId');

    if (orderId) {
      setSearchTerm(orderId);
    }
  }, [location.search]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let queryString = '';
      if (activeFilter !== 'All') {
        queryString = `?status=${activeFilter}`;
      }

      const response = await fetch(`http://localhost:3000/orders${queryString}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders);
      setFilteredOrders(data.orders);
      setStatusCounts(data.statusCounts || {});
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load your orders. Please try again.');
      setLoading(false);
    }
  };

  // Load orders on component mount and filter changes
  useEffect(() => {
    fetchOrders();
  }, [activeFilter]);

  // Function to search orders by ID through API
  const searchOrderById = async (orderId) => {
    setIsSearching(true);
    try {
      const response = await fetch(`http://localhost:3000/orders/search?orderId=${orderId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          setSearchResults([]);
          setFilteredOrders([]);
        } else {
          throw new Error('Failed to search order');
        }
        return;
      }

      const data = await response.json();
      // API returns a single order object
      if (data.order) {
        setSearchResults([data.order]);
        setFilteredOrders([data.order]);
        setExpandedOrder(data.order.order_id);
      } else {
        setSearchResults([]);
        setFilteredOrders([]);
      }
    } catch (err) {
      console.error('Error searching order:', err);
      setToast({
        visible: true,
        message: 'Failed to search for order. Please try again.',
        type: 'error',
      });
      setSearchResults([]);
      setFilteredOrders([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search and reset state
  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
    setSearchResults(null);

    // Apply active filter to show relevant orders
    setFilteredOrders(
      activeFilter === 'All'
        ? orders
        : orders.filter(
            (order) =>
              order.order_status && order.order_status.toLowerCase() === activeFilter.toLowerCase()
          )
    );
  };

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Skip empty searches
    if (!searchTerm.trim()) {
      // Reset filtered orders to show all orders with active filter
      setFilteredOrders(
        activeFilter === 'All'
          ? orders
          : orders.filter(
              (order) =>
                order.order_status &&
                order.order_status.toLowerCase() === activeFilter.toLowerCase()
            )
      );
      setIsSearching(false);
      setSearchResults(null);
      return;
    }

    // Set searching state
    setIsSearching(true);

    // Apply debounced search
    const timeout = setTimeout(() => {
      // Use the API search when the user is looking for an order ID
      if (/^\d+$/.test(searchTerm.trim())) {
        searchOrderById(searchTerm.trim());
      } else {
        // For non-numeric searches, do client-side filtering
        const results = orders.filter((order) =>
          order.order_id.toString().includes(searchTerm.trim())
        );

        // Apply active filter to search results
        const filteredResults =
          activeFilter === 'All'
            ? results
            : results.filter(
                (order) =>
                  order.order_status &&
                  order.order_status.toLowerCase() === activeFilter.toLowerCase()
              );

        setFilteredOrders(filteredResults);
        setIsSearching(false);
        setSearchResults(null);

        // Auto-expand if only one result
        if (filteredResults.length === 1) {
          setExpandedOrder(filteredResults[0].order_id);
        }
      }
    }, 300);

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTerm, orders, activeFilter]);

  // Update filtered orders when activeFilter changes (only if not searching)
  useEffect(() => {
    if (!searchTerm && !searchResults) {
      setFilteredOrders(
        activeFilter === 'All'
          ? orders
          : orders.filter(
              (order) =>
                order.order_status &&
                order.order_status.toLowerCase() === activeFilter.toLowerCase()
            )
      );
    }
  }, [activeFilter, orders, searchTerm, searchResults]);

  // Expand/collapse order details
  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Helper function to format date strings
  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get appropriate icon based on order status
  const getStatusIcon = (status) => {
    // Handle undefined or null status
    if (!status) return <Clock size={16} />;

    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle size={16} />;
      case 'processing':
        return <RefreshCw size={16} />;
      case 'pending':
        return <Clock size={16} />;
      case 'shipped':
        return <Truck size={16} />;
      case 'canceled':
        return <Ban size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  // Get CSS classes for status badges
  const getStatusBadge = (status) => {
    // Handle undefined or null status
    if (!status) return 'bg-gray-500/20 text-gray-400 border-gray-500/30';

    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'shipped':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'canceled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Display skeleton loaders during data fetching
  const renderSkeletonLoaders = () => {
    if (loading) {
      return (
        <div
          className="min-h-screen bg-[#0A0A0B] flex flex-col justify-center items-center p-4"
          style={{
            backgroundImage: `url(${overlay})`,
            backgroundSize: 'cover',
          }}
        >
          <Loader />
        </div>
      );
    }
  };

  // Hide toast notification
  const closeToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
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
      {/* Toast Notification */}
      {toast.visible && (
        <div
          className="fixed bottom-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fadeIn
                    bg-black/80 backdrop-blur-md border border-white/10 max-w-md"
        >
          {toast.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-[#7C5DF9]" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-400" />
          )}
          <span className="text-white text-sm">{toast.message}</span>
          <button
            onClick={() => setToast((prev) => ({ ...prev, visible: false }))}
            className="ml-2 text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="relative z-20 px-4 md:px-12 py-8 max-w-7xl mx-auto pt-24">
        {/* Header Section with Back Button */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/home')}
            className="bg-white/10 hover:bg-white/15 transition-colors p-2 rounded-full cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShoppingBag className="h-7 w-7 text-[#7C5DF9]" />
            Order History
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6 text-center">
            <p className="text-red-200">{error}</p>
            <button
              className="mt-2 text-sm text-white/80 hover:text-white underline cursor-pointer"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State - Skeleton Loaders */}
        {loading && <div className="space-y-6">{renderSkeletonLoaders()}</div>}

        {/* Empty State */}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center flex flex-col items-center shadow-xl">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-[#7C5DF9]/20 rounded-full mb-6">
              {searchTerm ? (
                <Search size={40} className="text-[#7C5DF9]" />
              ) : (
                <Package size={40} className="text-[#7C5DF9]" />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-3">
              {searchTerm
                ? 'No Orders Match Your Search'
                : activeFilter !== 'All'
                  ? `No ${activeFilter} Orders Found`
                  : 'No Orders Found'}
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
              {searchTerm
                ? `We couldn't find any orders matching "${searchTerm}". Try a different search term or clear your filters.`
                : activeFilter !== 'All'
                  ? `You don't have any orders with status "${activeFilter}". Try selecting a different status filter.`
                  : "You haven't placed any orders yet. Start shopping to see your order history here!"}
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="bg-white/10 hover:bg-white/15 transition-colors px-6 py-3 rounded-xl font-medium flex items-center gap-2 cursor-pointer"
                >
                  <X size={18} />
                  Clear Search
                </button>
              )}

              {activeFilter !== 'All' && (
                <button
                  onClick={() => setActiveFilter('All')}
                  className="bg-white/10 hover:bg-white/15 transition-colors px-6 py-3 rounded-xl font-medium flex items-center gap-2 cursor-pointer"
                >
                  <Filter size={18} />
                  Clear Filters
                </button>
              )}

              <Link
                to="/"
                className="bg-[#7C5DF9] hover:bg-[#6A4FF0] transition-colors px-6 py-3 rounded-xl font-medium flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag size={18} />
                Shop Now
              </Link>
            </div>
          </div>
        )}

        {/* Orders Content */}
        {!loading && !error && filteredOrders.length > 0 && (
          <>
            {/* Search, Filter and Sort Options */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Bar */}
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {isSearching ? (
                      <div className="h-4 w-4 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
                    ) : (
                      <Search size={16} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search by order ID (numbers only)"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C5DF9]/50"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Toggle Button for Mobile */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7C5DF9]/20 border border-[#7C5DF9]/30 rounded-lg text-[#7C5DF9] hover:bg-[#7C5DF9]/30 transition-colors cursor-pointer"
                >
                  <Filter size={16} />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
              </div>

              {/* Status Filters - Hidden on Mobile Unless Toggled */}
              <div className={`mt-4 md:block ${showFilters ? 'block' : 'hidden'}`}>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveFilter('All')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer 
                                        ${
                                          activeFilter === 'All'
                                            ? 'bg-[#7C5DF9] text-white'
                                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                                        }`}
                  >
                    <Inbox size={14} />
                    All Orders
                    <span className="ml-1 bg-black/30 px-2 py-0.5 rounded-full text-xs">
                      {orders.length}
                    </span>
                  </button>

                  {Object.entries(statusCounts).map(([status, count]) => (
                    <button
                      key={status}
                      onClick={() => setActiveFilter(status)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer 
                                            ${
                                              activeFilter === status
                                                ? 'bg-[#7C5DF9] text-white'
                                                : 'bg-white/10 text-white/70 hover:bg-white/20'
                                            }`}
                    >
                      {getStatusIcon(status)}
                      {status}
                      <span className="ml-1 bg-black/30 px-2 py-0.5 rounded-full text-xs">
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Searching indicator */}
            {isSearching && (
              <div className="bg-[#7C5DF9]/10 border border-[#7C5DF9]/30 rounded-3xl p-4 mb-6 flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#7C5DF9]"></div>
                <span className="text-[#7C5DF9]">Searching orders...</span>
              </div>
            )}

            {/* Orders List with enhanced styling */}
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <div
                  key={order.order_id}
                  className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden transition-all duration-300 shadow-lg 
                                    ${
                                      expandedOrder === order.order_id
                                        ? 'ring-2 ring-[#7C5DF9]/50'
                                        : 'hover:border-white/20'
                                    }`}
                >
                  {/* Order Header */}
                  <div className="p-4 sm:p-6 border-b border-white/10">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">Order #{order.order_id}</h3>
                          <span
                            className={`px-3 py-1 text-xs rounded-full border ${getStatusBadge(
                              order.order_status
                            )} flex items-center gap-1.5`}
                          >
                            {getStatusIcon(order.order_status)}
                            {order.order_status || 'Processing'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 flex items-center gap-1.5">
                          <Calendar size={14} />
                          {formatDate(order.order_date)}
                        </p>
                      </div>
                      <div className="flex flex-col sm:items-end">
                        <div className="font-bold text-xl flex items-center gap-1 text-white">
                          <DollarSign size={16} className="text-[#7C5DF9]" />
                          {parseFloat(order.total_amount).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-400 flex items-center gap-1.5">
                          <Package size={14} />
                          {order.items.length} item(s)
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleOrderExpand(order.order_id)}
                        className={`flex-grow flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg text-sm transition-all cursor-pointer
                                                ${
                                                  expandedOrder === order.order_id
                                                    ? 'bg-[#7C5DF9]/20 text-[#7C5DF9] border border-[#7C5DF9]/30'
                                                    : 'bg-white/10 hover:bg-white/15 text-white'
                                                }`}
                      >
                        {expandedOrder === order.order_id ? (
                          <>
                            Hide Details <ChevronUp size={14} />
                          </>
                        ) : (
                          <>
                            View Details <ChevronDown size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Order Details (Expandable) */}
                  {expandedOrder === order.order_id && (
                    <div className="p-4 sm:p-6 bg-gradient-to-b from-[#7C5DF9]/5 to-transparent animate-fadeIn">
                      {/* Items Section */}
                      <div className="bg-black/20 border border-white/10 rounded-3xl p-4 mb-6">
                        <h4 className="font-medium mb-4 flex items-center gap-2 text-[#7C5DF9]">
                          <Package size={16} />
                          Order Items
                        </h4>
                        <div className="space-y-4">
                          {order.items.length > 0 ? (
                            order.items.map((item) => (
                              <div
                                key={item?.order_item_id || `missing-item-${Math.random()}`}
                                className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#7C5DF9]/20 text-[#7C5DF9] font-medium text-sm">
                                    {item?.quantity || 0}
                                  </div>
                                  <div>
                                    <div className="font-medium">
                                      {item?.title || (
                                        <span className="text-red-400">Game Not Available</span>
                                      )}
                                    </div>
                                    {item ? (
                                      <div className="text-sm text-gray-400 flex items-center gap-1">
                                        <DollarSign size={12} />
                                        {parseFloat(item.price).toFixed(2)} each
                                      </div>
                                    ) : (
                                      <div className="text-sm text-gray-400">
                                        Item data unavailable
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="font-medium">
                                  {item ? `$${parseFloat(item.subtotal).toFixed(2)}` : 'N/A'}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-3 text-center">
                              <div className="inline-flex items-center justify-center w-10 h-10 bg-red-500/10 rounded-full mb-2">
                                <Ban size={20} className="text-red-400" />
                              </div>
                              <p className="text-red-400 font-medium">
                                Games Not Available or Deleted
                              </p>
                              <p className="text-sm text-gray-400 mt-1">
                                The items in this order are no longer available in our system.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Summary Section */}
                      <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex-grow">
                          <div className="bg-black/20 border border-white/10 rounded-3xl p-4">
                            <h4 className="font-medium mb-4 flex items-center gap-2 text-[#7C5DF9]">
                              <CreditCard size={16} />
                              Payment Information
                            </h4>
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-400">Method:</span>
                                <span className="font-medium bg-white/10 px-3 py-1 rounded-lg">
                                  {order.payment_method}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="sm:w-64">
                          <div className="bg-black/20 border border-white/10 rounded-3xl p-4">
                            <h4 className="font-medium mb-4 flex items-center gap-2 text-[#7C5DF9]">
                              <DollarSign size={16} />
                              Order Summary
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Subtotal</span>
                                <span>${parseFloat(order.total_amount).toFixed(2)}</span>
                              </div>

                              <div className="border-t border-white/10 my-2 pt-2">
                                <div className="flex justify-between font-bold">
                                  <span>Total</span>
                                  <span className="text-[#7C5DF9]">
                                    ${parseFloat(order.total_amount).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />
    </div>
  );
}

export default OrdersPage;
