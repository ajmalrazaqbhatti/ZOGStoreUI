import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import overlay from '../../assets/overlay.png';
import logo from '../../assets/logo.svg';
import useAuthCheck from '../../hooks/useAuthCheck';
import { BarChart3, Users, ShoppingBag, Package, PieChart, CreditCard, DollarSign, Layers, Activity } from 'lucide-react';

function AdminPage() {
    // Check if the user is authenticated and has admin role
    useAuthCheck();

    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState(null);
    const [topGames, setTopGames] = useState([]);
    const [dashboardError, setDashboardError] = useState(null);

    useEffect(() => {
        // Get user data from localStorage initially to prevent loading flicker
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser && storedUser.role === 'admin') {
            setUserData(storedUser);
        }

        // Fetch all dashboard data
        Promise.all([
            fetchUserData(),
            fetchDashboardStats(),

            fetchTopGames()
        ])
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // Fetch user data
    const fetchUserData = async () => {
        try {
            const response = await fetch('http://localhost:3000/auth/status', {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                if (data.isAuthenticated && data.user.role === 'admin') {
                    setUserData(data.user);
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    // Fetch dashboard statistics
    const fetchDashboardStats = async () => {
        try {
            const response = await fetch('http://localhost:3000/dashboard/stats', {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard statistics');
            }

            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            setDashboardError('Failed to load dashboard statistics');
        }
    };



    // Fetch top selling games
    const fetchTopGames = async () => {
        try {
            const response = await fetch('http://localhost:3000/dashboard/top-games', {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch top games');
            }

            const data = await response.json();
            setTopGames(data);
        } catch (error) {
            console.error('Error fetching top games:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:3000/auth/logout', {
                method: 'GET',
                credentials: 'include',
            });

            localStorage.removeItem('user');
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
            localStorage.removeItem('user');
            navigate('/');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0B] flex flex-col justify-center items-center p-4"
                style={{ backgroundImage: `url(${overlay})`, backgroundSize: 'cover' }}>
                <img src={logo} alt="ZOG Store Logo" className="h-16 mb-8 animate-pulse" />
                <div className="relative h-20 w-20">
                    <div className="absolute inset-0 rounded-full border-t-2 border-[#7C5DF9] animate-spin"></div>
                </div>
                <p className="mt-6 text-white/70 text-sm animate-pulse">Loading admin panel...</p>
            </div>
        );
    }

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white p-4 md:p-8"
            style={{ backgroundImage: `url(${overlay})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <img src={logo} alt="ZOG Store Logo" className="h-12" />
                        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-[#7C5DF9] rounded-lg hover:bg-[#6A4FF0] transition-all flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Logout
                    </button>
                </header>

                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4">Welcome, {userData?.username || 'Admin'}</h2>
                    <p className="text-gray-400">
                        This is your admin dashboard. Here you can manage games, users, inventory, and process orders.
                    </p>
                </div>

                {dashboardError && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6 text-red-200 flex items-center gap-3">
                        <AlertCircle size={18} />
                        <p>{dashboardError}</p>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 flex items-center gap-4">
                        <div className="bg-[#7C5DF9]/20 rounded-full p-3">
                            <Users size={24} className="text-[#7C5DF9]" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Users</p>
                            <h3 className="text-2xl font-bold">{stats?.totalUsers || 0}</h3>
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 flex items-center gap-4">
                        <div className="bg-[#7C5DF9]/20 rounded-full p-3">
                            <Layers size={24} className="text-[#7C5DF9]" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Games</p>
                            <h3 className="text-2xl font-bold">{stats?.totalGames || 0}</h3>
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 flex items-center gap-4">
                        <div className="bg-[#7C5DF9]/20 rounded-full p-3">
                            <ShoppingBag size={24} className="text-[#7C5DF9]" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Orders</p>
                            <h3 className="text-2xl font-bold">{stats?.totalOrders || 0}</h3>
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 flex items-center gap-4">
                        <div className="bg-[#7C5DF9]/20 rounded-full p-3">
                            <DollarSign size={24} className="text-[#7C5DF9]" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Sales</p>
                            <h3 className="text-2xl font-bold">{formatCurrency(stats?.totalSales)}</h3>
                        </div>
                    </div>
                </div>

                {/* Management Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Link
                        to="/admin/games"
                        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer"
                    >
                        <div className="bg-indigo-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                            <Layers size={24} className="text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Game Management</h3>
                        <p className="text-gray-400 mb-4 text-sm">Add, edit or remove games from the store inventory.</p>
                        <div className="text-[#7C5DF9] text-sm font-medium">
                            {stats?.totalGames || 0} Games Available →
                        </div>
                    </Link>

                    <Link
                        to="/admin/users"
                        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer"
                    >
                        <div className="bg-green-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                            <Users size={24} className="text-green-400" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">User Management</h3>
                        <p className="text-gray-400 mb-4 text-sm">View and manage user accounts and permissions.</p>
                        <div className="text-[#7C5DF9] text-sm font-medium">
                            {stats?.totalUsers || 0} Registered Users →
                        </div>
                    </Link>

                    <Link
                        to="/admin/inventory"
                        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer"
                    >
                        <div className="bg-purple-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                            <Package size={24} className="text-purple-400" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Inventory Management</h3>
                        <p className="text-gray-400 mb-4 text-sm">Update stock levels and manage game inventory.</p>
                        <div className="text-[#7C5DF9] text-sm font-medium">
                            Manage Inventory →
                        </div>
                    </Link>

                    <Link
                        to="/admin/orders"
                        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer"
                    >
                        <div className="bg-yellow-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                            <ShoppingBag size={24} className="text-yellow-400" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Order Processing</h3>
                        <p className="text-gray-400 mb-4 text-sm">View and process customer orders.</p>
                        <div className="text-[#7C5DF9] text-sm font-medium">
                            {stats?.totalOrders || 0} Orders to Manage →
                        </div>
                    </Link>
                </div>

                {/* Data Cards Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Recent Orders */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Activity size={18} className="text-[#7C5DF9]" />
                                Recent Orders
                            </h3>
                            <Link to="/admin/orders" className="text-sm text-[#7C5DF9] hover:underline">
                                View All
                            </Link>
                        </div>

                        {stats?.recentOrders?.length > 0 ? (
                            <div className="space-y-4">
                                {stats.recentOrders.map(order => (
                                    <div key={order.order_id} className="flex justify-between border-b border-white/10 pb-3 last:border-0">
                                        <div>
                                            <div className="font-medium">Order #{order.order_id}</div>
                                            <div className="text-sm text-gray-400">{order.username}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium">{formatCurrency(order.total_amount)}</div>
                                            <div className="text-sm text-gray-400">{formatDate(order.order_date)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-400">
                                No recent orders found.
                            </div>
                        )}
                    </div>

                    {/* Payment Methods */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <CreditCard size={18} className="text-[#7C5DF9]" />
                                Payment Methods
                            </h3>
                        </div>

                        {stats?.paymentMethodStats?.length > 0 ? (
                            <div className="space-y-4">
                                {stats.paymentMethodStats.map((payment, index) => (
                                    <div key={index} className="flex justify-between border-b border-white/10 pb-3 last:border-0">
                                        <div className="font-medium">{payment.payment_method}</div>
                                        <div className="text-right">
                                            <div className="font-medium">{formatCurrency(payment.total)}</div>
                                            <div className="text-sm text-gray-400">{payment.count} orders</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-400">
                                No payment data available.
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Games Card */}
                {topGames.length > 0 && (
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <BarChart3 size={18} className="text-[#7C5DF9]" />
                                Top Selling Games
                            </h3>
                            <Link to="/admin/games" className="text-sm text-[#7C5DF9] hover:underline">
                                View All Games
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-white/10">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Game
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Units Sold
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Revenue
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {topGames.map(game => (
                                        <tr key={game.game_id} className="hover:bg-white/5">
                                            <td className="px-4 py-3 whitespace-nowrap font-medium">
                                                {game.title}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {game.units_sold}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {formatCurrency(game.revenue)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminPage;
