import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, Clock, CheckCircle, AlertCircle, X, ChevronDown, ChevronUp, Filter, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import overlay from '../assets/overlay.png';
import logo from '../assets/logo.svg';

function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [statusCounts, setStatusCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

    // Fetch orders from API
    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                // Build query string for filters
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

    // Get status badge styling
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'Processing':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'Pending':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'Failed':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0B] flex flex-col justify-center items-center p-4"
                style={{ backgroundImage: `url(${overlay})`, backgroundSize: 'cover' }}>
                <img src={logo} alt="ZOG Store Logo" className="h-16 mb-8 animate-pulse" />
                <div className="relative h-20 w-20">
                    <div className="absolute inset-0 rounded-full border-t-2 border-[#7C5DF9] animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-t-2 border-[#7C5DF9]/60 animate-spin" style={{ animationDuration: '1.5s' }}></div>
                    <div className="absolute inset-4 rounded-full border-t-2 border-[#7C5DF9]/30 animate-spin" style={{ animationDuration: '2s' }}></div>
                </div>
                <p className="mt-6 text-white/70 text-sm animate-pulse">Loading your orders...</p>
            </div>
        );
    }

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
                        className="ml-2 text-white/50 hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <div className="relative z-20 px-4 md:px-12 py-8 max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <Link
                        to="/"
                        className="bg-white/10 hover:bg-white/15 transition-colors p-2 rounded-full"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <ShoppingBag className="h-7 w-7 text-[#7C5DF9]" />
                        Order History
                    </h1>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6 text-center">
                        <p className="text-red-200">{error}</p>
                        <button
                            className="mt-2 text-sm text-white/80 hover:text-white underline"
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!error && orders.length === 0 ? (
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center flex flex-col items-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#7C5DF9]/20 rounded-full mb-4">
                            <Package size={36} className="text-[#7C5DF9]" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">No Orders Found</h2>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">You haven't placed any orders yet. Start shopping to see your order history here!</p>
                        <Link
                            to="/"
                            className="bg-[#7C5DF9] hover:bg-[#6A4FF0] transition-colors px-6 py-3 rounded-xl font-medium"
                        >
                            Browse Games
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Status Filters */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            <button
                                onClick={() => setActiveFilter('All')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeFilter === 'All'
                                    ? 'bg-[#7C5DF9] text-white'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                                    }`}
                            >
                                All Orders
                            </button>
                            {Object.entries(statusCounts).map(([status, count]) => (
                                <button
                                    key={status}
                                    onClick={() => setActiveFilter(status)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center ${activeFilter === status
                                        ? 'bg-[#7C5DF9] text-white'
                                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                                        }`}
                                >
                                    {status} <span className="ml-2 bg-black/30 px-2 py-0.5 rounded-full text-xs">{count}</span>
                                </button>
                            ))}
                        </div>

                        {/* Orders List */}
                        <div className="space-y-6">
                            {orders.map(order => (
                                <div key={order.order_id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
                                    {/* Order Header */}
                                    <div className="p-4 sm:p-6 border-b border-white/10">
                                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-lg font-semibold">Order #{order.order_id}</h3>
                                                    <span className={`px-2.5 py-1 text-xs rounded-full border ${getStatusBadge(order.payment_status)}`}>
                                                        {order.payment_status || 'Processing'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-400 flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {formatDate(order.created_at)}
                                                </p>
                                            </div>
                                            <div className="flex flex-col sm:items-end">
                                                <div className="font-bold text-lg">${parseFloat(order.total_amount).toFixed(2)}</div>
                                                <div className="text-sm text-gray-400">{order.items.length} item(s)</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleOrderExpand(order.order_id)}
                                            className="mt-4 w-full flex items-center justify-center gap-1 py-2 px-4 bg-white/10 hover:bg-white/15 transition-colors rounded-lg text-sm"
                                        >
                                            {expandedOrder === order.order_id ? (
                                                <>Hide Details <ChevronUp size={14} /></>
                                            ) : (
                                                <>View Details <ChevronDown size={14} /></>
                                            )}
                                        </button>
                                    </div>

                                    {/* Order Details (Expandable) */}
                                    {expandedOrder === order.order_id && (
                                        <div className="p-4 sm:p-6 bg-white/2">
                                            <h4 className="font-medium mb-3">Order Items</h4>
                                            <div className="space-y-3">
                                                {order.items.map(item => (
                                                    <div key={item.order_item_id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-sm text-white/80">{item.quantity}x</div>
                                                            <div>
                                                                <div className="font-medium">{item.title}</div>
                                                                <div className="text-sm text-gray-400">${parseFloat(item.price).toFixed(2)} each</div>
                                                            </div>
                                                        </div>
                                                        <div className="font-medium">${parseFloat(item.subtotal).toFixed(2)}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-white/10">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-gray-400">Subtotal</span>
                                                    <span>${parseFloat(order.total_amount).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-gray-400">Tax</span>
                                                    <span>$0.00</span>
                                                </div>
                                                <div className="flex justify-between font-bold mt-2 pt-2 border-t border-white/10">
                                                    <span>Total</span>
                                                    <span>${parseFloat(order.total_amount).toFixed(2)}</span>
                                                </div>
                                            </div>

                                            <div className="mt-4 bg-white/5 rounded-lg p-3">
                                                <h4 className="text-sm font-medium mb-2">Payment Information</h4>
                                                <div className="text-sm text-gray-400">
                                                    <div>Method: {order.payment_method}</div>
                                                    <div>Payment ID: {order.payment_id}</div>
                                                    <div>Status: {order.payment_status || 'Processing'}</div>
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
