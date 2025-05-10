import { useState, useEffect } from 'react';
import { Search, RefreshCw, Eye, Edit, AlertCircle, Check, X, User, Trash2, Save, ShoppingBag } from 'lucide-react';
import overlay from '../../assets/overlay.png';
import useAuthCheck from '../../hooks/useAuthCheck';
import AdminSidebar from '../../components/AdminSidebar';

function UserManagement() {
    // Check if the user is authenticated and has admin role
    useAuthCheck();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [roleFilter, setRoleFilter] = useState('All');
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, userId: null, username: '' });

    // States for user detail modal
    const [showUserDetails, setShowUserDetails] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userOrders, setUserOrders] = useState([]);
    const [userDetailsLoading, setUserDetailsLoading] = useState(false);

    // States for user edit modal
    const [showUserEdit, setShowUserEdit] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [editForm, setEditForm] = useState({
        username: '',
        email: '',
        role: '',
        password: '',
        confirmPassword: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Fetch users
    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter users based on search term and role
    useEffect(() => {
        if (!users) return;

        let filtered = [...users];

        // Apply role filter
        if (roleFilter !== 'All') {
            filtered = filtered.filter(user => user.role === roleFilter.toLowerCase());
        }

        // Apply search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(user =>
                user.username.toLowerCase().includes(search) ||
                user.email.toLowerCase().includes(search) ||
                String(user.user_id).includes(search)
            );
        }

        setFilteredUsers(filtered);
    }, [searchTerm, roleFilter, users]);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:3000/admin/users', {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Failed to load users. Please try again.');
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

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    // Delete user confirmation
    const confirmDeleteUser = (userId, username) => {
        setDeleteConfirm({
            show: true,
            userId,
            username
        });
    };

    const cancelDelete = () => {
        setDeleteConfirm({
            show: false,
            userId: null,
            username: ''
        });
    };

    // Delete user
    const deleteUser = async () => {
        if (!deleteConfirm.userId) return;

        try {
            const response = await fetch(`http://localhost:3000/admin/users/${deleteConfirm.userId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete user');
            }

            // Remove user from state
            setUsers(users.filter(user => user.user_id !== deleteConfirm.userId));
            showToast(`User deleted successfully`, 'success');

            // Close user details modal if the deleted user was being viewed
            if (selectedUser && selectedUser.user_id === deleteConfirm.userId) {
                setShowUserDetails(false);
                setSelectedUser(null);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            showToast(`Failed to delete user: ${error.message}`, 'error');
        } finally {
            setDeleteConfirm({
                show: false,
                userId: null,
                username: ''
            });
        }
    };

    // Open user details modal
    const openUserDetails = async (user) => {
        setSelectedUser(user);
        setShowUserDetails(true);
        setUserDetailsLoading(true);

        try {
            // Fetch user details if needed
            const response = await fetch(`http://localhost:3000/admin/users/${user.user_id}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const userData = await response.json();
                setSelectedUser(userData);
            }

            // Fetch user orders if available
            try {
                const ordersResponse = await fetch(`http://localhost:3000/orders/user/${user.user_id}`, {
                    credentials: 'include'
                });

                if (ordersResponse.ok) {
                    const ordersData = await ordersResponse.json();
                    setUserOrders(ordersData);
                }
            } catch (orderError) {
                console.error('Error fetching user orders:', orderError);
                setUserOrders([]);
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            showToast('Failed to load user details', 'error');
        } finally {
            setUserDetailsLoading(false);
        }
    };

    // Close user details modal
    const closeUserDetails = () => {
        setShowUserDetails(false);
        setSelectedUser(null);
        setUserOrders([]);
    };

    // Open user edit modal
    const openUserEdit = (user) => {
        setEditUser(user);
        setEditForm({
            username: user.username,
            email: user.email,
            role: user.role,
            password: '',
            confirmPassword: ''
        });
        setFormErrors({});
        setShowUserEdit(true);
    };

    // Close user edit modal
    const closeUserEdit = () => {
        setShowUserEdit(false);
        setEditUser(null);
        setEditForm({
            username: '',
            email: '',
            role: '',
            password: '',
            confirmPassword: ''
        });
        setFormErrors({});
    };

    // Handle edit form changes
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear field errors when user types
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    // Validate edit form
    const validateEditForm = () => {
        const errors = {};

        if (!editForm.username.trim()) {
            errors.username = 'Username is required';
        }

        if (!editForm.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(editForm.email)) {
            errors.email = 'Email is invalid';
        }

        if (!editForm.role) {
            errors.role = 'Role is required';
        }

        // Only validate password if it's provided
        if (editForm.password) {
            if (editForm.password.length < 6) {
                errors.password = 'Password must be at least 6 characters';
            }

            if (editForm.password !== editForm.confirmPassword) {
                errors.confirmPassword = 'Passwords do not match';
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit edit form
    const handleEditSubmit = async (e) => {
        e.preventDefault();

        if (!validateEditForm()) {
            return;
        }

        setSubmitting(true);

        try {
            // Update user info
            const userData = {
                username: editForm.username,
                email: editForm.email,
                role: editForm.role
            };

            const response = await fetch(`http://localhost:3000/users/${editUser.user_id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                throw new Error('Failed to update user information');
            }

            // If password is provided, update the password separately
            if (editForm.password) {
                const passwordResponse = await fetch(`http://localhost:3000/users/${editUser.user_id}/password`, {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ newPassword: editForm.password }),
                });

                if (!passwordResponse.ok) {
                    throw new Error('Failed to update password');
                }
            }

            // Update user in the list
            setUsers(users.map(user =>
                user.user_id === editUser.user_id
                    ? { ...user, username: editForm.username, email: editForm.email, role: editForm.role }
                    : user
            ));

            // If user details modal is open and showing this user, update it too
            if (selectedUser && selectedUser.user_id === editUser.user_id) {
                setSelectedUser({
                    ...selectedUser,
                    username: editForm.username,
                    email: editForm.email,
                    role: editForm.role
                });
            }

            showToast('User updated successfully', 'success');
            closeUserEdit();
        } catch (error) {
            console.error('Error updating user:', error);
            showToast(`Failed to update user: ${error.message}`, 'error');
        } finally {
            setSubmitting(false);
        }
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

                    {/* Delete Confirmation Modal */}
                    {deleteConfirm.show && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-[#1C1C24] border border-white/10 rounded-xl p-6 max-w-md w-full mx-4">
                                <h3 className="text-xl font-bold mb-2">Delete User</h3>
                                <p className="text-gray-400 mb-4">
                                    Are you sure you want to delete <span className="text-white">{deleteConfirm.username}</span>?
                                    This action cannot be undone.
                                </p>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        onClick={cancelDelete}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={deleteUser}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* User Details Modal */}
                    {showUserDetails && selectedUser && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                            <div className="bg-[#1C1C24] border border-white/10 rounded-xl max-w-4xl w-full mx-auto my-8">
                                {/* Modal Header */}
                                <div className="flex justify-between items-center p-6 border-b border-white/10">
                                    <h3 className="text-xl font-bold">User Details</h3>
                                    <button
                                        onClick={closeUserDetails}
                                        className="text-white/70 hover:text-white"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {userDetailsLoading ? (
                                    <div className="flex justify-center items-center p-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7C5DF9]"></div>
                                    </div>
                                ) : (
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            {/* User Information Card */}
                                            <div className="lg:col-span-1">
                                                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                                    <div className="flex flex-col items-center mb-6">
                                                        <div className="h-20 w-20 rounded-full bg-[#7C5DF9]/20 flex items-center justify-center mb-4">
                                                            <span className="text-[#7C5DF9] text-2xl font-bold">{selectedUser.username.charAt(0).toUpperCase()}</span>
                                                        </div>
                                                        <h2 className="text-xl font-bold mb-1">{selectedUser.username}</h2>
                                                        <span className={`px-2 py-1 text-xs rounded-full ${selectedUser.role === 'admin'
                                                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                            }`}>
                                                            {selectedUser.role === 'admin' ? 'Admin' : 'User'}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="flex justify-between border-b border-white/10 pb-2">
                                                            <span className="text-gray-400">User ID</span>
                                                            <span>{selectedUser.user_id}</span>
                                                        </div>
                                                        <div className="flex justify-between border-b border-white/10 pb-2">
                                                            <span className="text-gray-400">Email</span>
                                                            <span className="text-right">{selectedUser.email}</span>
                                                        </div>
                                                        <div className="flex justify-between border-b border-white/10 pb-2">
                                                            <span className="text-gray-400">Joined Date</span>
                                                            <span>{formatDate(selectedUser.created_at)}</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-6 flex flex-col gap-3">
                                                        <button
                                                            onClick={() => {
                                                                closeUserDetails();
                                                                openUserEdit(selectedUser);
                                                            }}
                                                            className="w-full py-2 bg-[#7C5DF9]/20 text-[#7C5DF9] rounded-lg hover:bg-[#7C5DF9]/30 transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <Edit size={16} />
                                                            Edit User
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                closeUserDetails();
                                                                confirmDeleteUser(selectedUser.user_id, selectedUser.username);
                                                            }}
                                                            className="w-full py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <Trash2 size={16} />
                                                            Delete User
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Orders and Activity */}
                                            <div className="lg:col-span-2">
                                                <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                                        <ShoppingBag size={18} className="text-[#7C5DF9]" />
                                                        Order History
                                                    </h3>

                                                    {userOrders.length > 0 ? (
                                                        <div className="overflow-x-auto">
                                                            <table className="min-w-full">
                                                                <thead>
                                                                    <tr className="border-b border-white/10">
                                                                        <th className="text-left py-3 text-xs text-gray-400 uppercase">Order ID</th>
                                                                        <th className="text-left py-3 text-xs text-gray-400 uppercase">Date</th>
                                                                        <th className="text-left py-3 text-xs text-gray-400 uppercase">Status</th>
                                                                        <th className="text-right py-3 text-xs text-gray-400 uppercase">Amount</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {userOrders.map(order => (
                                                                        <tr key={order.order_id} className="border-b border-white/10 hover:bg-white/5">
                                                                            <td className="py-3">{order.order_id}</td>
                                                                            <td className="py-3">{formatDate(order.order_date)}</td>
                                                                            <td className="py-3">
                                                                                <span className={`px-2 py-1 text-xs rounded-full ${order.status === 'completed'
                                                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                                                    : order.status === 'processing'
                                                                                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                                                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                                                    }`}>
                                                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                                                </span>
                                                                            </td>
                                                                            <td className="py-3 text-right">{formatCurrency(order.total_amount)}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-10 text-gray-400">
                                                            <ShoppingBag size={40} className="mx-auto mb-4 text-gray-500/50" />
                                                            <p>This user has not placed any orders yet.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* User Edit Modal */}
                    {showUserEdit && editUser && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                            <div className="bg-[#1C1C24] border border-white/10 rounded-xl max-w-2xl w-full mx-auto my-8">
                                {/* Modal Header */}
                                <div className="flex justify-between items-center p-6 border-b border-white/10">
                                    <h3 className="text-xl font-bold">Edit User</h3>
                                    <button
                                        onClick={closeUserEdit}
                                        className="text-white/70 hover:text-white"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-16 w-16 rounded-full bg-[#7C5DF9]/20 flex items-center justify-center">
                                            <User size={24} className="text-[#7C5DF9]" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold">{editUser.username}</h2>
                                            <p className="text-gray-400">User ID: {editUser.user_id}</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleEditSubmit}>
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                                    Username
                                                </label>
                                                <input
                                                    type="text"
                                                    name="username"
                                                    value={editForm.username}
                                                    onChange={handleEditChange}
                                                    className={`w-full px-4 py-2 bg-black/30 border rounded-lg focus:outline-none focus:ring-2 ${formErrors.username
                                                        ? 'border-red-500/50 focus:ring-red-500/30'
                                                        : 'border-white/10 focus:ring-[#7C5DF9]/50'
                                                        }`}
                                                />
                                                {formErrors.username && (
                                                    <p className="mt-1 text-sm text-red-400">{formErrors.username}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={editForm.email}
                                                    onChange={handleEditChange}
                                                    className={`w-full px-4 py-2 bg-black/30 border rounded-lg focus:outline-none focus:ring-2 ${formErrors.email
                                                        ? 'border-red-500/50 focus:ring-red-500/30'
                                                        : 'border-white/10 focus:ring-[#7C5DF9]/50'
                                                        }`}
                                                />
                                                {formErrors.email && (
                                                    <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                                    Role
                                                </label>
                                                <select
                                                    name="role"
                                                    value={editForm.role}
                                                    onChange={handleEditChange}
                                                    className={`w-full px-4 py-2 bg-black/30 border rounded-lg focus:outline-none focus:ring-2 ${formErrors.role
                                                        ? 'border-red-500/50 focus:ring-red-500/30'
                                                        : 'border-white/10 focus:ring-[#7C5DF9]/50'
                                                        }`}
                                                >
                                                    <option value="">Select Role</option>
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                                {formErrors.role && (
                                                    <p className="mt-1 text-sm text-red-400">{formErrors.role}</p>
                                                )}
                                            </div>

                                            <div className="border-t border-white/10 pt-6">
                                                <h3 className="text-lg font-medium mb-4">Change Password</h3>
                                                <p className="text-gray-400 text-sm mb-4">
                                                    Leave the password fields empty if you don't want to change the password.
                                                </p>

                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                                            New Password
                                                        </label>
                                                        <input
                                                            type="password"
                                                            name="password"
                                                            value={editForm.password}
                                                            onChange={handleEditChange}
                                                            className={`w-full px-4 py-2 bg-black/30 border rounded-lg focus:outline-none focus:ring-2 ${formErrors.password
                                                                ? 'border-red-500/50 focus:ring-red-500/30'
                                                                : 'border-white/10 focus:ring-[#7C5DF9]/50'
                                                                }`}
                                                        />
                                                        {formErrors.password && (
                                                            <p className="mt-1 text-sm text-red-400">{formErrors.password}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                                            Confirm New Password
                                                        </label>
                                                        <input
                                                            type="password"
                                                            name="confirmPassword"
                                                            value={editForm.confirmPassword}
                                                            onChange={handleEditChange}
                                                            className={`w-full px-4 py-2 bg-black/30 border rounded-lg focus:outline-none focus:ring-2 ${formErrors.confirmPassword
                                                                ? 'border-red-500/50 focus:ring-red-500/30'
                                                                : 'border-white/10 focus:ring-[#7C5DF9]/50'
                                                                }`}
                                                        />
                                                        {formErrors.confirmPassword && (
                                                            <p className="mt-1 text-sm text-red-400">{formErrors.confirmPassword}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-3 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={closeUserEdit}
                                                    className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/15 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={submitting}
                                                    className="px-4 py-2 bg-[#7C5DF9] rounded-lg hover:bg-[#6A4FF0] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {submitting ? (
                                                        <>
                                                            <div className="h-4 w-4 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save size={16} />
                                                            Save Changes
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <header className="mb-8">
                        <h1 className="text-2xl font-bold">User Management</h1>
                        <p className="text-gray-400">Manage user accounts and permissions</p>
                    </header>

                    {/* Search and Filter Bar */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search Input */}
                            <div className="relative flex-grow">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={16} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search users by name, email or ID..."
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

                            {/* Role Filter Dropdown */}
                            <div className="min-w-[160px]">
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#7C5DF9]/50 appearance-none"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 10px center',
                                        backgroundSize: '16px'
                                    }}
                                >
                                    <option value="All">All Roles</option>
                                    <option value="User">User</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>

                            {/* Refresh Button */}
                            <button
                                onClick={fetchUsers}
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
                                onClick={fetchUsers}
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

                    {/* Users Table */}
                    {!loading && !error && (
                        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                            {filteredUsers.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#7C5DF9]/20 rounded-full mb-4">
                                        <User size={24} className="text-[#7C5DF9]" />
                                    </div>
                                    <h3 className="text-xl font-medium mb-2">No users found</h3>
                                    <p className="text-gray-400 mb-4">
                                        {searchTerm
                                            ? `No users match your search for "${searchTerm}"`
                                            : roleFilter !== 'All'
                                                ? `No users found with role "${roleFilter}"`
                                                : 'There are no users in the database'}
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setRoleFilter('All');
                                        }}
                                        className="px-4 py-2 bg-[#7C5DF9] hover:bg-[#6A4FF0] rounded-lg transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-white/10">
                                        <thead className="bg-black/20">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                    ID
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                    Username
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                    Email
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                    Role
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                    Joined
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/10">
                                            {filteredUsers.map(user => (
                                                <tr key={user.user_id} className="hover:bg-white/5">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                        {user.user_id}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-8 w-8 rounded-full mr-3 bg-[#7C5DF9]/20 flex items-center justify-center">
                                                                <span className="text-[#7C5DF9]">{user.username.charAt(0).toUpperCase()}</span>
                                                            </div>
                                                            <div className="font-medium">{user.username}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        {user.email}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'admin'
                                                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                            }`}>
                                                            {user.role === 'admin' ? 'Admin' : 'User'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                        {formatDate(user.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <button
                                                                onClick={() => openUserDetails(user)}
                                                                className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                                                                title="View User Details"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => openUserEdit(user)}
                                                                className="p-1.5 bg-[#7C5DF9]/20 text-[#7C5DF9] rounded-lg hover:bg-[#7C5DF9]/30 transition-colors"
                                                                title="Edit User"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => confirmDeleteUser(user.user_id, user.username)}
                                                                className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                                                title="Delete User"
                                                            >
                                                                <Trash2 size={16} />
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

export default UserManagement;
