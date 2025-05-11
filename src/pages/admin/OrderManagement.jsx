import React, { useState, useEffect } from 'react';
import {
    Search, RefreshCw, ShoppingBag, AlertCircle, Check, X,
    Edit, Trash2, Clock, Truck, PackageCheck, XCircle,
    Calendar, User, Info, ChevronDown, ChevronUp,
    Package, ShoppingCart
} from 'lucide-react';
import overlay from '../../assets/overlay.png';
import useAuthCheck from '../../hooks/useAuthCheck';
import AdminSidebar from '../../components/AdminSidebar';
import Loader from '../../components/Loader';
import Toast from '../../components/Toast';

function OrderManagement() {
    // Check if the user is authenticated and has admin role
    useAuthCheck();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState('All');
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [processingOrder, setProcessingOrder] = useState(null);
    const [showOrderDetails, setShowOrderDetails] = useState(null);
    const [statusChangeOrder, setStatusChangeOrder] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');

    // Valid order statuses
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'canceled'];

    // Fetch orders
    useEffect(() => {
        fetchOrders();
    }, []);

    // Filter orders based on status
    useEffect(() => {
        if (!orders.length) return;

        let filtered = [...orders];

        // Apply status filter
        if (statusFilter !== 'All') {
            filtered = filtered.filter(order =>
                order.status.toLowerCase() === statusFilter.toLowerCase()
            );
        }

        // Apply search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(order =>
                order.order_id.toString().includes(search) ||
                order.username.toLowerCase().includes(search) ||
                order.email.toLowerCase().includes(search) ||
                order.status.toLowerCase().includes(search)
            );
        }

        setFilteredOrders(filtered);
    }, [searchTerm, statusFilter, orders]);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:3000/admin/orders', {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();
            setOrders(data);
            setFilteredOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Show toast notification
    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
        setTimeout(() => {
            setToast({ visible: false, message: '', type: 'success' });
        }, 3000);
    };

    // Add this function to close the toast
    const closeToast = () => {
        setToast(prev => ({ ...prev, visible: false }));
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Get status badge styling
    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'processing':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'shipped':
                return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
            case 'delivered':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'canceled':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    // Get status icon
    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return <Clock size={16} />;
            case 'processing':
                return <RefreshCw size={16} />;
            case 'shipped':
                return <Truck size={16} />; // Changed from TruckDelivery to Truck
            case 'delivered':
                return <PackageCheck size={16} />;
            case 'canceled':
                return <XCircle size={16} />;
            default:
                return <Info size={16} />;
        }
    };

    // Prepare to delete an order
    const confirmDelete = (order) => {
        setOrderToDelete(order);
        setShowDeleteModal(true);
    };

    // Handle order deletion
    const handleDeleteConfirm = async () => {
        if (!orderToDelete) return;

        setProcessingOrder(orderToDelete.order_id);
        try {
            const response = await fetch(`http://localhost:3000/admin/orders/${orderToDelete.order_id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete order');
            }

            // Remove the deleted order from state
            setOrders(orders.filter(order => order.order_id !== orderToDelete.order_id));

            // Show success toast
            showToast(`Order #${orderToDelete.order_id} was successfully deleted`, 'success');
        } catch (error) {
            console.error('Error deleting order:', error);
            showToast(`Failed to delete order: ${error.message}`, 'error');
        } finally {
            setShowDeleteModal(false);
            setOrderToDelete(null);
            setProcessingOrder(null);
        }
    };

    // Open status change modal
    const openStatusChangeModal = (order) => {
        setStatusChangeOrder(order);
        setNewStatus(order.status.toLowerCase());
        setShowStatusModal(true);
    };

    // Handle status change
    const handleStatusChange = async () => {
        if (!statusChangeOrder || !newStatus) return;

        setProcessingOrder(statusChangeOrder.order_id);
        try {
            const response = await fetch(`http://localhost:3000/admin/orders/${statusChangeOrder.order_id}/status`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: newStatus
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update order status');
            }

            // Update the order status in the state
            setOrders(orders.map(order =>
                order.order_id === statusChangeOrder.order_id
                    ? { ...order, status: newStatus }
                    : order
            ));

            // Show success toast
            showToast(`Order #${statusChangeOrder.order_id} status updated to ${newStatus}`, 'success');
        } catch (error) {
            console.error('Error updating order status:', error);
            showToast(`Failed to update order status: ${error.message}`, 'error');
        } finally {
            setShowStatusModal(false);
            setStatusChangeOrder(null);
            setProcessingOrder(null);
        }
    };

    // Toggle order details view
    const toggleOrderDetails = (orderId) => {
        setShowOrderDetails(showOrderDetails === orderId ? null : orderId);
    };

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white"
            style={{ backgroundImage: `url(${overlay})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>

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

                    {/* Delete Confirmation Modal */}
                    {showDeleteModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                            <div className="bg-[#1A1A1C] rounded-xl p-5 max-w-sm w-full shadow-xl border border-white/10">
                                <h3 className="text-lg font-bold mb-2">Delete Order</h3>
                                <p className="text-gray-400 mb-4 text-sm">
                                    Are you sure you want to delete Order #{orderToDelete?.order_id}? This action cannot be undone.
                                </p>
                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-lg transition-colors text-sm cursor-pointer"
                                        disabled={processingOrder === orderToDelete?.order_id}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteConfirm}
                                        disabled={processingOrder === orderToDelete?.order_id}
                                        className="px-3 py-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors flex items-center gap-2 text-sm cursor-pointer"
                                    >
                                        {processingOrder === orderToDelete?.order_id ? (
                                            <>
                                                <div className="h-3 w-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 size={14} />
                                                Delete
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Status Change Modal */}
                    {showStatusModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                            <div className="bg-[#1A1A1C] rounded-xl p-5 max-w-sm w-full shadow-xl border border-white/10">
                                <h3 className="text-lg font-bold mb-2">Update Order Status</h3>
                                <p className="text-gray-400 mb-4 text-sm">
                                    Change the status for Order #{statusChangeOrder?.order_id}
                                </p>

                                <div className="mb-4">
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
                                        Status
                                    </label>
                                    <select
                                        id="status"
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#7C5DF9]/50 appearance-none text-sm"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'right 10px center',
                                            backgroundSize: '16px'
                                        }}
                                    >
                                        {validStatuses.map(status => (
                                            <option key={status} value={status}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => setShowStatusModal(false)}
                                        className="px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-lg transition-colors text-sm cursor-pointer"
                                        disabled={processingOrder === statusChangeOrder?.order_id}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleStatusChange}
                                        disabled={processingOrder === statusChangeOrder?.order_id || newStatus === statusChangeOrder?.status.toLowerCase()}
                                        className="px-3 py-1.5 bg-[#7C5DF9]/80 hover:bg-[#7C5DF9] rounded-lg transition-colors flex items-center gap-2 text-sm cursor-pointer"
                                    >
                                        {processingOrder === statusChangeOrder?.order_id ? (
                                            <>
                                                <div className="h-3 w-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Check size={14} />
                                                Update Status
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <header className="mb-8">
                        <h1 className="text-2xl font-bold">Order Management</h1>
                        <p className="text-gray-400">View and manage customer orders</p>
                    </header>

                    {/* Search and Filter Bar */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search Input */}
                            <div className="relative flex-grow">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={16} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by order ID, customer name or email..."
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

                            {/* Status Filter Dropdown */}
                            <div className="min-w-[160px]">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2  bg-[#1A1A1C] rounded-xl border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#7C5DF9]/50 appearance-none"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 10px center',
                                        backgroundSize: '16px'
                                    }}
                                >
                                    <option value="All">All Statuses</option>
                                    {validStatuses.map(status => (
                                        <option key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Refresh Button */}
                            <button
                                onClick={fetchOrders}
                                className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
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
                                className="mt-2 text-sm text-white/80 hover:text-white underline cursor-pointer"
                                onClick={fetchOrders}
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

                    {/* Orders Table */}
                    {!loading && !error && (
                        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                            {filteredOrders.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#7C5DF9]/20 rounded-full mb-4">
                                        <ShoppingBag size={24} className="text-[#7C5DF9]" />
                                    </div>
                                    <h3 className="text-xl font-medium mb-2">No orders found</h3>
                                    <p className="text-gray-400 mb-4">
                                        {searchTerm
                                            ? `No orders match your search for "${searchTerm}"`
                                            : statusFilter !== 'All'
                                                ? `No orders with status "${statusFilter}" found`
                                                : 'There are no orders in the database'}
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setStatusFilter('All');
                                        }}
                                        className="px-4 py-2 bg-[#7C5DF9] hover:bg-[#6A4FF0] rounded-lg transition-colors cursor-pointer"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-white/10">
                                        <thead className="bg-black/20">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                    Order ID
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                    Customer
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                    Total
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                    Items
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/10">
                                            {filteredOrders.map(order => (
                                                <React.Fragment key={order.order_id}>
                                                    <tr className={`hover:bg-white/5 transition-colors ${showOrderDetails === order.order_id ? 'bg-[#7C5DF9]/5' : ''}`}>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                                            #{order.order_id}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <div className="flex flex-col">
                                                                <div className="font-medium">{order.username}</div>
                                                                <div className="text-gray-400 text-xs">{order.email}</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                            {formatDate(order.order_date)}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span className={`px-2 py-1 text-xs rounded-full border flex items-center gap-1.5 w-fit ${getStatusBadge(order.status)}`}>
                                                                {getStatusIcon(order.status)}
                                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap font-medium">
                                                            {formatCurrency(order.total_amount)}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                                            <span className="bg-[#7C5DF9]/20 text-[#7C5DF9] rounded-full px-2 py-0.5 text-xs font-medium">
                                                                {order.items?.length || 0} items
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex items-center justify-end space-x-2">
                                                                <button
                                                                    onClick={() => toggleOrderDetails(order.order_id)}
                                                                    className={`p-1.5 transition-colors cursor-pointer ${showOrderDetails === order.order_id
                                                                        ? 'bg-[#7C5DF9]/20 text-[#7C5DF9] rounded-lg'
                                                                        : 'bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30'
                                                                        }`}
                                                                    title="View Details"
                                                                >
                                                                    {showOrderDetails === order.order_id ? (
                                                                        <ChevronUp size={16} />
                                                                    ) : (
                                                                        <ChevronDown size={16} />
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={() => openStatusChangeModal(order)}
                                                                    className="p-1.5 bg-[#7C5DF9]/20 text-[#7C5DF9] rounded-lg hover:bg-[#7C5DF9]/30 transition-colors cursor-pointer"
                                                                    title="Change Status"
                                                                >
                                                                    <Edit size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => confirmDelete(order)}
                                                                    className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors cursor-pointer"
                                                                    title="Delete Order"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    {/* Expanded Order Details */}
                                                    {showOrderDetails === order.order_id && (
                                                        <tr>
                                                            <td colSpan="7" className="px-4 py-4 bg-black/30">
                                                                <div className="grid grid-cols-1 gap-6">
                                                                    {/* Order Information Cards */}
                                                                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4 text-sm">
                                                                        <div className="bg-white/5 border border-white/10 rounded-3xl p-3">
                                                                            <h4 className="font-medium mb-2 flex items-center gap-1.5">
                                                                                <Calendar size={14} className="text-[#7C5DF9]" />
                                                                                Order Details
                                                                            </h4>
                                                                            <div className="space-y-2 text-gray-300">
                                                                                <div className="flex justify-between">
                                                                                    <span>Order ID:</span>
                                                                                    <span className="font-medium text-white">#{order.order_id}</span>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span>Date:</span>
                                                                                    <span>{formatDate(order.order_date)}</span>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span>Status:</span>
                                                                                    <span className={`px-2 py-0.5 text-xs rounded-full border ${getStatusBadge(order.status)}`}>
                                                                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span>Total:</span>
                                                                                    <span className="font-medium text-white">{formatCurrency(order.total_amount)}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Order Items Section */}
                                                                    {order.items && order.items.length > 0 && (
                                                                        <div className="bg-white/5 border border-white/10 rounded-3xl p-4">
                                                                            <h4 className="font-medium mb-3 flex items-center gap-1.5">
                                                                                <ShoppingCart size={16} className="text-[#7C5DF9]" />
                                                                                Order Items
                                                                            </h4>
                                                                            <div className="overflow-x-auto">
                                                                                <table className="min-w-full divide-y divide-white/10">
                                                                                    <thead className="bg-black/20">
                                                                                        <tr>
                                                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                                                                Game
                                                                                            </th>
                                                                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                                                                Quantity
                                                                                            </th>
                                                                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                                                                Price
                                                                                            </th>
                                                                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                                                                Subtotal
                                                                                            </th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody className="divide-y divide-white/10">
                                                                                        {order.items.map(item => (
                                                                                            <tr key={item.item_id} className="hover:bg-white/5">
                                                                                                <td className="px-4 py-3 whitespace-nowrap">
                                                                                                    <div className="flex items-center">
                                                                                                        {item.gameicon ? (
                                                                                                            <img
                                                                                                                src={item.gameicon}
                                                                                                                alt={item.title}
                                                                                                                className="h-8 w-8 rounded-md mr-3 object-cover bg-black/30"
                                                                                                            />
                                                                                                        ) : (
                                                                                                            <div className="h-8 w-8 rounded-md mr-3 bg-[#7C5DF9]/20 flex items-center justify-center">
                                                                                                                <Package size={14} className="text-[#7C5DF9]" />
                                                                                                            </div>
                                                                                                        )}
                                                                                                        <div className="font-medium text-sm">{item.title}</div>
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                                                                                                    {item.quantity}
                                                                                                </td>
                                                                                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                                                                                                    {formatCurrency(item.price)}
                                                                                                </td>
                                                                                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                                                                    {formatCurrency(item.price * item.quantity)}
                                                                                                </td>
                                                                                            </tr>
                                                                                        ))}
                                                                                    </tbody>
                                                                                    <tfoot className="bg-black/30">
                                                                                        <tr>
                                                                                            <td colSpan="3" className="px-4 py-2 text-right font-medium">
                                                                                                Total:
                                                                                            </td>
                                                                                            <td className="px-4 py-2 text-right font-bold text-[#7C5DF9]">
                                                                                                {formatCurrency(order.total_amount)}
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tfoot>
                                                                                </table>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
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

export default OrderManagement;
