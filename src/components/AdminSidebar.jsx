/********************************************************
 * AdminSidebar Component
 * Navigation sidebar for admin section
 ********************************************************/
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
import overlay from '../assets/overlay.png';

function AdminSidebar() {
    // Router and state
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userData, setUserData] = useState(null);

    /********************************************************
     * Effects and Initialization
     ********************************************************/
    useEffect(() => {
        // Load user data from storage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser) {
            setUserData(storedUser);
        }

        // Close mobile menu on route change
        setIsMobileMenuOpen(false);

        // Handle responsive behavior
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

    // Check if a path is currently active
    const isActive = (path) => {
        return location.pathname === path;
    };

    // Handle user logout
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

    // Navigation menu items
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
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#0A0A0B]/80 backdrop-blur-md border border-white/10 text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Overlay (Mobile) */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64  backdrop-blur-md text-white transform transition-transform duration-300 ease-in-out ${(isOpen || isMobileMenuOpen) ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0 border-r border-white/10`}
                style={{
                    backgroundImage: `url(${overlay})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundBlendMode: 'overlay'
                }}
            >
                {/* Logo and Header */}
                <div className="p-4 flex justify-between items-center border-b border-white/10">
                    <Link to="/admin" className="flex items-center gap-2">
                        <img src={logo} alt="ZOG Store" className="h-8 drop-shadow-[0_0_10px_rgba(167,139,250,0.3)]" />
                        <span className="font-bold text-lg">ZOGStore</span>
                    </Link>

                </div>

                {/* User Info */}
                <div className="p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#7C5DF9]/20 flex items-center justify-center text-[#7C5DF9] font-bold">
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
                                    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${isActive(item.path)
                                        ? 'bg-[#7C5DF9]/20 text-[#7C5DF9] border border-[#7C5DF9]/30 font-medium'
                                        : 'text-white/70 hover:bg-white/5 hover:text-white border border-transparent'
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
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20 cursor-pointer"
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
