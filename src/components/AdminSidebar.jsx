import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Layers,
    Users,
    Package,
    ShoppingBag,
    LogOut,
    Menu,
    X,
    ChevronRight
} from 'lucide-react';
import logo from '../assets/logo.svg';

function AdminSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        // Get user data from localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser) {
            setUserData(storedUser);
        }

        // Close mobile menu when route changes
        setIsMobileMenuOpen(false);

        // Check window size for responsiveness
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsOpen(false);
            } else {
                setIsOpen(true);
            }
        };

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [location.pathname]);

    const isActive = (path) => {
        return location.pathname === path;
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

    const menuItems = [
        {
            name: 'Dashboard',
            path: '/admin',
            icon: <LayoutDashboard size={20} />
        },
        {
            name: 'Games',
            path: '/admin/games',
            icon: <Layers size={20} />
        },
        {
            name: 'Users',
            path: '/admin/users',
            icon: <Users size={20} />
        },
        {
            name: 'Inventory',
            path: '/admin/inventory',
            icon: <Package size={20} />
        },
        {
            name: 'Orders',
            path: '/admin/orders',
            icon: <ShoppingBag size={20} />
        }
    ];

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#1A1A1C] text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Overlay (Mobile) */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/80 z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1A1A1C] text-white transform transition-transform duration-300 ease-in-out ${(isOpen || isMobileMenuOpen) ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0 border-r border-white/10`}
            >
                {/* Logo and Header */}
                <div className="p-4 flex justify-between items-center border-b border-white/10">
                    <Link to="/admin" className="flex items-center gap-2">
                        <img src={logo} alt="ZOG Store" className="h-8" />
                        <span className="font-bold text-lg">Admin</span>
                    </Link>

                    {/* Toggle Button (Desktop) */}
                    <button
                        className="hidden lg:block p-1 rounded hover:bg-white/10"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <ChevronRight size={20} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#7C5DF9]/30 flex items-center justify-center text-[#7C5DF9] font-bold">
                            {userData?.username?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div>
                            <div className="font-medium">{userData?.username || 'Admin'}</div>
                            <div className="text-xs text-white/60">{userData?.email || 'admin@example.com'}</div>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="p-4">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive(item.path)
                                            ? 'bg-[#7C5DF9]/20 text-[#7C5DF9] font-medium'
                                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {item.icon}
                                    <span>{item.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Logout Button */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
}

export default AdminSidebar;
