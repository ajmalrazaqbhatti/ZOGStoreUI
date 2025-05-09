import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import overlay from '../assets/overlay.png';
import logo from '../assets/logo.svg';
import useAuthCheck from '../hooks/useAuthCheck';

function AdminPage() {
    // Check if the user is authenticated
    useAuthCheck();

    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        // Get user data from localStorage initially to prevent loading flicker
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser && storedUser.role === 'admin') {
            setUserData(storedUser);
        }

        // Check if user is admin - once only
        const checkAdmin = async () => {
            try {
                const response = await fetch('http://localhost:3000/auth/status', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.isAuthenticated && data.user.role === 'admin') {
                        setUserData(data.user);
                        // Update localStorage with latest data
                        localStorage.setItem('user', JSON.stringify(data.user));
                    } else {
                        localStorage.removeItem('user');
                        navigate('/');
                    }
                } else {
                    localStorage.removeItem('user');
                    navigate('/');
                }
            } catch (error) {
                console.error('Authentication check failed:', error);
                // On network error, don't redirect if we have stored user data
                if (!userData) {
                    navigate('/');
                }
            } finally {
                setLoading(false);
            }
        };

        checkAdmin();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:3000/auth/logout', {
                method: 'GET', // Consistent method across app
                credentials: 'include',
            });

            // Always clear local storage on logout attempt
            localStorage.removeItem('user');
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
            // Still clear storage and redirect on error
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

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white p-8"
            style={{ backgroundImage: `url(${overlay})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <img src={logo} alt="ZOG Store Logo" className="h-12" />
                        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-[#7C5DF9] rounded-lg hover:bg-[#6A4FF0] transition-all flex items-center"
                    >
                        Logout
                    </button>
                </header>

                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4">Welcome, {userData?.username || 'Admin'}</h2>
                    <p className="text-gray-400">This is the admin dashboard. Implement your admin functionality here.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Placeholder cards for admin features */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold mb-2">Manage Games</h3>
                        <p className="text-gray-400 mb-4">Add, edit or remove games from the store.</p>
                        <button className="w-full py-2 bg-[#7C5DF9] rounded-lg hover:bg-[#6A4FF0] transition-all">
                            Manage Games
                        </button>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold mb-2">Manage Orders</h3>
                        <p className="text-gray-400 mb-4">View and process customer orders.</p>
                        <button className="w-full py-2 bg-[#7C5DF9] rounded-lg hover:bg-[#6A4FF0] transition-all">
                            Manage Orders
                        </button>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold mb-2">Manage Users</h3>
                        <p className="text-gray-400 mb-4">View and manage user accounts.</p>
                        <button className="w-full py-2 bg-[#7C5DF9] rounded-lg hover:bg-[#6A4FF0] transition-all">
                            Manage Users
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminPage;
