import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.svg'
import overlay from '../assets/overlay.png'
import { Search, ShoppingCart, User, Menu, X, Heart, ChevronRight } from 'lucide-react'

function HomePage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const [setHoveredCard] = useState(null);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const accountMenuRef = useRef(null);
    const navigate = useNavigate();

    // Close the account menu when clicking outside of it
    useEffect(() => {
        function handleClickOutside(event) {
            if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
                setIsAccountMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle logout functionality
    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:3000/logout', {
                method: 'POST',
                credentials: 'include', // Include cookies for authentication
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                console.log('User logged out successfully');
                setIsAccountMenuOpen(false);
                navigate('/login');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    // Fetch games data from API
    // In your React component
    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await fetch('http://localhost:3000/games', {
                    credentials: 'include' // This sends cookies with the request
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setGames(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching games:", error);
                setError("Failed to load games. Please try again later.");
                setLoading(false);
            }
        };

        fetchGames();
    }, []);

    // Get recent games (first 2)
    const recentGames = games.slice(0, 2);

    // Get trending games (next 4)
    const trendingGames = games.slice(2, 6);

    return (
        <div className="bg-[#0A0A0B] min-h-screen text-white font-['Inter',sans-serif]"
            style={{
                backgroundImage: `url(${overlay})`,
                backgroundSize: 'cover', backgroundPosition: 'center'
            }}>

            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-md  border-b border-white/5">
                <nav className='flex justify-between items-center p-5 max-w-7xl mx-auto'>

                    <div className='flex items-center gap-4'>
                        <div className="flex items-center gap-8">
                            <Link to="/">
                                <img src={logo} alt="ZOG Store Logo" className="h-10 drop-shadow-[0_0_10px_rgba(167,139,250,0.3)]" />
                            </Link>
                            <div className="hidden md:flex space-x-6">
                                <Link to="/store" className="text-white/80 hover:text-white transition-colors">Store</Link>
                                <Link to="/library" className="text-white/80 hover:text-white transition-colors">Library</Link>
                                <Link to="/community" className="text-white/80 hover:text-white transition-colors">Community</Link>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-white/50 group-focus-within:text-[#7C5DF9]" />
                            </div>
                            <input
                                type="search"
                                placeholder="Search games..."
                                className="w-64 pl-10 px-4 py-2 bg-white/5 border border-white/10 rounded-full 
                                placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-[#7C5DF9]/50 focus:border-[#7C5DF9]
                                transition-all duration-300"
                            />
                        </div>


                    </div>



                    <div className='flex gap-4'>
                        <button className="relative p-2.5 rounded-2xl bg-[#7C5DF9] border border-white/10 hover:bg-[#7C5DF9]/70 transition-colors cursor-pointer">
                            <ShoppingCart className="h-5 w-5 text-white" />

                        </button>

                        <div className="relative" ref={accountMenuRef}>
                            <button
                                className="flex items-center gap-2 py-2 px-4 rounded-2xl bg-[#7C5DF9] border border-white/10 hover:bg-[#7C5DF9]/70 transition-colors cursor-pointer"
                                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                            >
                                <User className="h-5 w-5 text-white" />
                                <span className="hidden sm:inline">Account</span>
                            </button>

                            {/* Account dropdown menu */}
                            {isAccountMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[#1A1A1C] border border-white/10 z-50">
                                    <div className="py-1">
                                        <Link to="/profile" className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                                            Profile
                                        </Link>
                                        <Link to="/settings" className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                                            Settings
                                        </Link>
                                        <div className="border-t border-white/10 my-1"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 hover:text-red-300 transition-colors"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <button
                            className="md:hidden p-2 rounded-full bg-white/5 border border-white/10"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </nav>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-[#0A0A0B] border-b border-white/5 p-4">
                        <div className="flex flex-col space-y-4">
                            <Link to="/store" className="text-white/80 hover:text-white transition-colors py-2">Store</Link>
                            <Link to="/library" className="text-white/80 hover:text-white transition-colors py-2">Library</Link>
                            <Link to="/community" className="text-white/80 hover:text-white transition-colors py-2">Community</Link>

                            <div className="relative my-2">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-white/50" />
                                </div>
                                <input
                                    type="search"
                                    placeholder="Search games..."
                                    className="w-full pl-10 px-4 py-2 bg-white/5 border border-white/10 rounded-full 
                                    placeholder-white/50 text-white focus:outline-none"
                                />
                            </div>

                            <div className="flex space-x-3">
                                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full bg-white/5 border border-white/10">
                                    <ShoppingCart className="h-5 w-5 text-white" />
                                    <span>Cart</span>
                                </button>

                                <div className="flex-1">
                                    <button
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-white/5 border border-white/10"
                                        onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                                    >
                                        <User className="h-5 w-5 text-white" />
                                        <span>Account</span>
                                    </button>

                                    {/* Mobile account dropdown */}
                                    {isAccountMenuOpen && (
                                        <div className="mt-2 bg-[#1A1A1C] border border-white/10 rounded-lg">
                                            <div className="py-1">
                                                <Link to="/profile" className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors">
                                                    Profile
                                                </Link>
                                                <Link to="/settings" className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors">
                                                    Settings
                                                </Link>
                                                <div className="border-t border-white/10 my-1"></div>
                                                <button
                                                    onClick={handleLogout}
                                                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 transition-colors"
                                                >
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section className="pt-16 pb-24 px-4 max-w-7xl mx-auto">
                <div className="mb-6 flex justify-between items-end">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                        Recent Uploads
                    </h1>
                    <Link to="/all-games" className="hidden md:flex items-center text-[#7C5DF9] hover:text-[#9B82FC] transition-colors">
                        View all <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#7C5DF9]"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-center">
                        {error}
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row gap-6">
                        {recentGames.map((game) => (
                            <div
                                key={game.game_id}
                                className="w-full rounded-2xl overflow-hidden group"
                                onMouseEnter={() => setHoveredCard(`game-${game.game_id}`)}
                                onMouseLeave={() => setHoveredCard(null)}
                            >
                                <div className="relative aspect-[16/9] overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10"></div>
                                    <img
                                        src={game.gamecover}
                                        alt={game.title}
                                        className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                                    />
                                    <div className="absolute top-4 left-4 z-20 flex gap-2">
                                        <span className="bg-[#7C5DF9] px-3 py-1.5 rounded-full text-xs font-medium">New Release</span>
                                        {game.price === "0.00" ? (
                                            <span className="bg-green-500/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium">Free</span>
                                        ) : (
                                            <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium">${game.price}</span>
                                        )}
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                                        <div className="transform translate-y-0 group-hover:translate-y-[-8px] transition-transform duration-300">
                                            <h2 className="text-2xl md:text-3xl font-bold mb-2">{game.title}</h2>
                                            <p className="text-white/80 text-sm md:text-base mb-4 max-w-xl">
                                                {game.description}
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <div className="flex gap-2">
                                                    <span className="text-xs bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full">{game.genre}</span>
                                                    <span className="text-xs bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full">{game.platform}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 mt-5 transform opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                            <button className="bg-[#7C5DF9] hover:bg-[#6A4FF0] text-white rounded-full px-6 py-3 font-medium transition-colors flex-1 md:flex-none">
                                                {game.price === "0.00" ? "Get Free" : `Buy $${game.price}`}
                                            </button>
                                            <button className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors">
                                                <Heart className="h-5 w-5" />
                                            </button>
                                            <button className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors">
                                                <ShoppingCart className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Trending Section */}
            <section className="py-12 px-4 max-w-7xl mx-auto">
                <div className="mb-8 flex justify-between items-end">
                    <h2 className="text-3xl font-bold">Trending Now</h2>
                    <Link to="/trending" className="hidden md:flex items-center text-[#7C5DF9] hover:text-[#9B82FC] transition-colors">
                        View all <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#7C5DF9]"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-center">
                        {error}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {trendingGames.map((game) => (
                            <div key={game.game_id} className="group relative rounded-xl overflow-hidden bg-white/5 border border-white/5 hover:border-[#7C5DF9]/30 transition-all duration-300">
                                <div className="aspect-[3/4] overflow-hidden">
                                    <img
                                        src={game.gamecover}
                                        alt={game.title}
                                        className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-105 transition-transform duration-500 ease-out"
                                    />
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <button className="p-2 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/70 transition-colors">
                                            <Heart className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg">{game.title}</h3>
                                        <div className="bg-white/10 px-2 py-1 rounded text-sm font-medium">
                                            {game.price === "0.00" ? "Free" : `$${game.price}`}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mb-4">
                                        <span className="text-xs bg-white/10 px-2 py-1 rounded-full">{game.genre}</span>
                                        <span className="text-xs bg-white/10 px-2 py-1 rounded-full">{game.platform.split(', ')[0]}</span>
                                    </div>
                                    <button className="w-full bg-white/10 hover:bg-[#7C5DF9] text-white rounded-lg px-4 py-2 transition-colors duration-300">
                                        {game.price === "0.00" ? "Download" : "Add to Cart"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

export default HomePage