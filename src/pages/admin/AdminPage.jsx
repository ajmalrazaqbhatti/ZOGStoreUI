import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import overlay from '../../assets/overlay.png';
import useAuthCheck from '../../hooks/useAuthCheck';
import AdminSidebar from '../../components/AdminSidebar';
import { Users, ShoppingBag, Package, Layers, DollarSign, Activity, CreditCard, BarChart3, AlertCircle } from 'lucide-react';

function AdminPage() {
    // Check if the user is authenticated and has admin role
    useAuthCheck();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [topGames, setTopGames] = useState([]);
    const [dashboardError, setDashboardError] = useState(null);

    useEffect(() => {
        // Fetch all dashboard data
        Promise.all([
            fetchDashboardStats(),
            fetchTopGames()
        ])
            .finally(() => {
                setLoading(false);
            });
    }, []);

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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0B] flex flex-col justify-center items-center p-4"
                style={{ backgroundImage: `url(${overlay})`, backgroundSize: 'cover' }}>
                <div className="relative h-20 w-20">
                    <div className="absolute inset-0 rounded-full border-t-2 border-[#7C5DF9] animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-t-2 border-[#7C5DF9]/60 animate-spin" style={{ animationDuration: '1.5s' }}></div>
                    <div className="absolute inset-4 rounded-full border-t-2 border-[#7C5DF9]/30 animate-spin" style={{ animationDuration: '2s' }}></div>
                </div>
                <p className="mt-6 text-white/70 text-sm animate-pulse">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white"
            style={{ backgroundImage: `url(${overlay})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>

            {/* Admin Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <div className="lg:ml-64 transition-all duration-300">
                <div className="p-4 md:p-8 pt-20">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-gray-400">Welcome to your ZogStore dashboard</p>
                    </header>

                    {dashboardError && (
                        <div className="bg-red-500/20 border border-red-500/30 rounded-3xl p-4 mb-6 text-red-200 flex items-center gap-3">
                            <AlertCircle size={18} />
                            <p>{dashboardError}</p>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-5 flex items-center gap-4 hover:bg-white/10 transition-colors">
                            <div className="bg-[#7C5DF9]/20 rounded-full p-3">
                                <Users size={24} className="text-[#7C5DF9]" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Total Users</p>
                                <h3 className="text-3xl font-bold">{stats?.totalUsers || 0}</h3>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-5 flex items-center gap-4 hover:bg-white/10 transition-colors">
                            <div className="bg-[#7C5DF9]/20 rounded-full p-3">
                                <Layers size={24} className="text-[#7C5DF9]" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Total Games</p>
                                <h3 className="text-3xl font-bold">{stats?.totalGames || 0}</h3>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-5 flex items-center gap-4 hover:bg-white/10 transition-colors">
                            <div className="bg-[#7C5DF9]/20 rounded-full p-3">
                                <ShoppingBag size={24} className="text-[#7C5DF9]" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Total Orders</p>
                                <h3 className="text-3xl font-bold">{stats?.totalOrders || 0}</h3>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-5 flex items-center gap-4 hover:bg-white/10 transition-colors">
                            <div className="bg-[#7C5DF9]/20 rounded-full p-3">
                                <DollarSign size={24} className="text-[#7C5DF9]" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Total Sales</p>
                                <h3 className="text-3xl font-bold">{formatCurrency(stats?.totalSales)}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Data Cards Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Recent Orders */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Activity size={18} className="text-[#7C5DF9]" />
                                    Recent Orders
                                </h3>
                                <Link to="/admin/orders" className="text-sm text-[#7C5DF9] hover:text-[#9F7AFF] transition-colors hover:underline">
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
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors">
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
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 mb-8 hover:bg-white/10 transition-colors">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <BarChart3 size={18} className="text-[#7C5DF9]" />
                                    Top Selling Games
                                </h3>
                                <Link to="/admin/games" className="text-sm text-[#7C5DF9] hover:text-[#9F7AFF] transition-colors hover:underline">
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
                                            <tr key={game.game_id} className="hover:bg-white/5 transition-colors">
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
        </div>
    );
}

export default AdminPage;
