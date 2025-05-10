import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ShoppingBag, Package, Clock, CheckCircle, AlertCircle, X, ChevronDown, ChevronUp,
    ArrowLeft, Filter, Truck, Ban, Search, Calendar, DollarSign,
    Inbox, RefreshCw, CreditCard
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import overlay from '../../assets/overlay.png';
import useAuthCheck from '../../hooks/useAuthCheck';

function OrdersPage() {
    // Check if the user is authenticated
    useAuthCheck();

    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [statusCounts, setStatusCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const navigate = useNavigate();

    // Fetch orders from API
    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                let queryString = '';
                if (activeFilter !== 'All') {
                    queryString = `?status=${activeFilter}`;
                }

                const response = await fetch(`http://localhost:3000/orders${queryString}`, {
                    credentials: 'include'
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

        fetchOrders();
    }, [activeFilter]);

    const toggleOrderExpand = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    // Format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Get status icon based on status
    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed':
                return <CheckCircle size={16} />;
            case 'Processing':
                return <RefreshCw size={16} />;
            case 'Pending':
                return <Clock size={16} />;
            case 'Shipped':
                return <Truck size={16} />;
            case 'Failed':
                return <Ban size={16} />;
            default:
                return <Clock size={16} />;
        }
    };

    // Get status badge styling
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'Processing':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'Pending':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'Shipped':
                return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
            case 'Failed':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };



    // Render skeleton loaders during loading state
    const renderSkeletonLoaders = () => {
        return Array(3).fill().map((_, index) => (
            <div key={`skeleton-${index}`} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden animate-pulse">
                <div className="p-6 border-b border-white/10">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-6 w-32 bg-white/10 rounded-md"></div>
                                <div className="h-6 w-20 bg-white/10 rounded-full"></div>
                            </div>
                            <div className="h-4 w-48 bg-white/10 rounded-md"></div>
                        </div>
                        <div className="flex flex-col sm:items-end">
                            <div className="h-6 w-20 bg-white/10 rounded-md mb-2"></div>
                            <div className="h-4 w-16 bg-white/10 rounded-md"></div>
                        </div>
                    </div>
                    <div className="mt-4 h-10 w-full bg-white/10 rounded-lg"></div>
                </div>
            </div>
        ));
    };

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white"
            style={{ backgroundImage: `url(${overlay})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>

            {/* Toast Notification */}
            {toast.visible && (
                <div className="fixed bottom-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fadeIn
                    bg-black/80 backdrop-blur-md border border-white/10 max-w-md">
                    {toast.type === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-[#7C5DF9]" />
                    ) : (
                        <AlertCircle className="h-5 w-5 text-red-400" />
                    )}
                    <span className="text-white text-sm">{toast.message}</span>
                    <button
                        onClick={() => setToast(prev => ({ ...prev, visible: false }))}
                        className="ml-2 text-white/50 hover:text-white transition-colors cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <div className="relative z-20 px-4 md:px-12 py-8 max-w-4xl pt-24 mx-auto">
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
                {loading && (
                    <div className="space-y-6">
                        {renderSkeletonLoaders()}
                    </div>
                )}

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
                                ? "No Orders Match Your Search"
                                : activeFilter !== 'All'
                                    ? `No ${activeFilter} Orders Found`
                                    : "No Orders Found"}
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
                                    onClick={() => setSearchTerm('')}
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
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 mb-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Search Bar */}
                                <div className="relative flex-grow">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search by order ID or item name"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C5DF9]/50"
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
                                        ${activeFilter === 'All'
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
                                            ${activeFilter === status
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

                        {/* Orders List with enhanced styling */}
                        <div className="space-y-6">
                            {filteredOrders.map(order => (
                                <div
                                    key={order.order_id}
                                    className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden transition-all duration-300 shadow-lg 
                                    ${expandedOrder === order.order_id ? 'ring-2 ring-[#7C5DF9]/50' : 'hover:border-white/20'}`}
                                >
                                    {/* Order Header */}
                                    <div className="p-4 sm:p-6 border-b border-white/10">
                                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-lg font-semibold">
                                                        Order #{order.order_id}
                                                    </h3>
                                                    <span className={`px-3 py-1 text-xs rounded-full border ${getStatusBadge(order.payment_status)} flex items-center gap-1.5`}>
                                                        {getStatusIcon(order.payment_status)}
                                                        {order.payment_status || 'Processing'}
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
                                                ${expandedOrder === order.order_id
                                                        ? 'bg-[#7C5DF9]/20 text-[#7C5DF9] border border-[#7C5DF9]/30'
                                                        : 'bg-white/10 hover:bg-white/15 text-white'
                                                    }`}
                                            >
                                                {expandedOrder === order.order_id ? (
                                                    <>Hide Details <ChevronUp size={14} /></>
                                                ) : (
                                                    <>View Details <ChevronDown size={14} /></>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Order Details (Expandable) */}
                                    {expandedOrder === order.order_id && (
                                        <div className="p-4 sm:p-6 bg-gradient-to-b from-[#7C5DF9]/5 to-transparent animate-fadeIn">
                                            {/* Items Section */}
                                            <div className="bg-black/20 border border-white/10 rounded-xl p-4 mb-6">
                                                <h4 className="font-medium mb-4 flex items-center gap-2 text-[#7C5DF9]">
                                                    <Package size={16} />
                                                    Order Items
                                                </h4>
                                                <div className="space-y-4">
                                                    {order.items.map(item => (
                                                        <div
                                                            key={item.order_item_id}
                                                            className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#7C5DF9]/20 text-[#7C5DF9] font-medium text-sm">
                                                                    {item.quantity}
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium">{item.title}</div>
                                                                    <div className="text-sm text-gray-400 flex items-center gap-1">
                                                                        <DollarSign size={12} />
                                                                        {parseFloat(item.price).toFixed(2)} each
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="font-medium">${parseFloat(item.subtotal).toFixed(2)}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Order Summary Section */}
                                            <div className="flex flex-col sm:flex-row gap-6">
                                                <div className="flex-grow">
                                                    <div className="bg-black/20 border border-white/10 rounded-xl p-4">
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
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-gray-400">Payment ID:</span>
                                                                <span className="font-mono bg-white/10 px-3 py-1 rounded-lg text-xs">
                                                                    {order.payment_id}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-gray-400">Status:</span>
                                                                <span className={`px-3 py-1 text-xs rounded-lg flex items-center gap-1.5 ${getStatusBadge(order.payment_status)}`}>
                                                                    {getStatusIcon(order.payment_status)}
                                                                    {order.payment_status || 'Processing'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="sm:w-64">
                                                    <div className="bg-black/20 border border-white/10 rounded-xl p-4">
                                                        <h4 className="font-medium mb-4 flex items-center gap-2 text-[#7C5DF9]">
                                                            <DollarSign size={16} />
                                                            Order Summary
                                                        </h4>
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-400">Subtotal</span>
                                                                <span>${parseFloat(order.total_amount).toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-400">Tax</span>
                                                                <span>$0.00</span>
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
        </div>
    );
}

export default OrdersPage;
