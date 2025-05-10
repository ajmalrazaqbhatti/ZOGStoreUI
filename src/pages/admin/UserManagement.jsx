import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowLeft, RefreshCw, Eye, Edit, AlertCircle, Check, X, User } from 'lucide-react';
import overlay from '../../assets/overlay.png';
import useAuthCheck from '../../hooks/useAuthCheck';

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
            const response = await fetch('http://localhost:3000/users', {
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
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Toggle user active status
    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            const response = await fetch(`http://localhost:3000/users/${userId}/status`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ active: !currentStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update user status');
            }

            // Update users list
            setUsers(users.map(user =>
                user.user_id === userId
                    ? { ...user, active: !currentStatus }
                    : user
            ));

            showToast(`User status updated successfully`, 'success');
        } catch (error) {
            console.error('Error updating user status:', error);
            showToast(`Failed to update user status: ${error.message}`, 'error');
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white p-4 md:p-8"
            style={{ backgroundImage: `url(${overlay})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="max-w-7xl mx-auto">
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

                {/* Header with Back Button */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/admin"
                            className="bg-white/10 hover:bg-white/15 transition-colors p-2 rounded-full"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-2xl font-bold">User Management</h1>
                    </div>
                </div>

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
                                                Status
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
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${user.active
                                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                        }`}>
                                                        {user.active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {formatDate(user.created_at)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <Link
                                                            to={`/admin/users/${user.user_id}`}
                                                            className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                                                            title="View User Details"
                                                        >
                                                            <Eye size={16} />
                                                        </Link>
                                                        <Link
                                                            to={`/admin/users/edit/${user.user_id}`}
                                                            className="p-1.5 bg-[#7C5DF9]/20 text-[#7C5DF9] rounded-lg hover:bg-[#7C5DF9]/30 transition-colors"
                                                            title="Edit User"
                                                        >
                                                            <Edit size={16} />
                                                        </Link>
                                                        <button
                                                            onClick={() => toggleUserStatus(user.user_id, user.active)}
                                                            className={`p-1.5 rounded-lg transition-colors ${user.active
                                                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                                }`}
                                                            title={user.active ? 'Deactivate User' : 'Activate User'}
                                                        >
                                                            {user.active ? <X size={16} /> : <Check size={16} />}
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
    );
}

export default UserManagement;
