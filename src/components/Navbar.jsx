import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';
import { Search, User, ChevronDown, ShoppingCart, X } from 'lucide-react';

function Navbar({ activeGenre = 'All', genres = [], filterGamesByGenre }) {
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const [isGenreMenuOpen, setIsGenreMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false);
    const accountMenuRef = useRef(null);
    const genreMenuRef = useRef(null);
    const searchInputRef = useRef(null);
    const searchPopupRef = useRef(null);
    const navigate = useNavigate();

    // Close menus when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
                setIsAccountMenuOpen(false);
            }
            if (genreMenuRef.current && !genreMenuRef.current.contains(event.target)) {
                setIsGenreMenuOpen(false);
            }
            if (searchPopupRef.current && !searchPopupRef.current.contains(event.target)) {
                setIsSearchPopupOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle logout
    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:3000/auth/logout', {
                method: 'GET',
                credentials: 'include',
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

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        // Navigate to home with search query
        navigate(`/?search=${encodeURIComponent(searchTerm)}`);
        setIsSearchPopupOpen(false);
    };

    // Toggle search popup
    const toggleSearchPopup = () => {
        setIsSearchPopupOpen(!isSearchPopupOpen);
        if (!isSearchPopupOpen) {
            setTimeout(() => {
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            }, 100);
        }
    };

    return (
        <header className="sticky top-0 z-50 backdrop-blur-md border-b border-white/5">
            <nav className='flex justify-between items-center p-5 max-w-7xl mx-auto'>
                <div className='flex items-center gap-4'>
                    <div className="flex items-center gap-8">
                        <Link to="/">
                            <img src={logo} alt="ZOG Store Logo" className="h-10 drop-shadow-[0_0_10px_rgba(167,139,250,0.3)]" />
                        </Link>

                        {/* Genre Filter Dropdown */}
                        {filterGamesByGenre && (
                            <div className="relative hidden md:block" ref={genreMenuRef}>
                                <button
                                    className="flex items-center gap-2 h-10 px-4 rounded-xl bg-white/5 border border-white/10 
                                    hover:bg-white/10 hover:border-[#7C5DF9]/40 transition-all duration-300 relative overflow-hidden group"
                                    onClick={() => setIsGenreMenuOpen(!isGenreMenuOpen)}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#7C5DF9]/0 via-[#7C5DF9]/5 to-[#7C5DF9]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                                    <span className="relative z-10">{activeGenre === 'All' ? 'All Genres' : activeGenre}</span>
                                    <ChevronDown className={`h-4 w-4 text-white/50 group-hover:text-white/80 transition-transform duration-300 ${isGenreMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
                                </button>

                                {/* Genre dropdown menu */}
                                {isGenreMenuOpen && (
                                    <div className="absolute left-0 mt-2 w-56 rounded-xl shadow-xl bg-[#1A1A1C] backdrop-blur-md border border-white/10 z-50 max-h-[70vh] overflow-y-auto no-scrollbar 
                                    animate-fadeIn origin-top-left border-t-2 border-t-[#7C5DF9]/50">
                                        <div className="py-2 px-1">
                                            <button
                                                onClick={() => {
                                                    filterGamesByGenre('All');
                                                    setIsGenreMenuOpen(false);
                                                }}
                                                className={`block w-full text-left px-4 py-2.5 text-sm rounded-lg mb-1 transition-all duration-200 
                                                ${activeGenre === 'All'
                                                        ? 'bg-gradient-to-r from-[#7C5DF9]/20 to-[#7C5DF9]/10 text-[#7C5DF9] font-medium'
                                                        : 'text-white/80 hover:bg-white/10 hover:translate-x-1'}`}
                                            >
                                                All Genres
                                            </button>
                                            {genres.map((genreObj) => (
                                                <button
                                                    key={genreObj.genre}
                                                    onClick={() => {
                                                        filterGamesByGenre(genreObj.genre);
                                                        setIsGenreMenuOpen(false);
                                                    }}
                                                    className={`block w-full text-left px-4 py-2.5 text-sm rounded-lg mb-1 transition-all duration-200 
                                                    ${activeGenre === genreObj.genre
                                                            ? 'bg-gradient-to-r from-[#7C5DF9]/20 to-[#7C5DF9]/10 text-[#7C5DF9] font-medium'
                                                            : 'text-white/80 hover:bg-white/10 hover:translate-x-1'}`}
                                                >
                                                    {genreObj.genre}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Desktop Search Bar */}
                    <div className="relative group hidden md:block">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-white/50 group-focus-within:text-[#7C5DF9]" />
                        </div>
                        <input
                            ref={searchInputRef}
                            type="search"
                            placeholder="Search games..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                            className="w-64 md:w-72 pl-10 px-4 h-10 bg-white/8 border border-white/10 rounded-xl 
                            placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-[#7C5DF9]/50 focus:border-[#7C5DF9]
                            transition-all duration-300 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none
                            shadow-sm shadow-black/10"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/40 hover:text-white/70 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                <div className='flex gap-4'>
                    {/* Mobile Search Button */}
                    <button
                        onClick={toggleSearchPopup}
                        className="md:hidden h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                        <Search className="h-5 w-5 text-white" />
                    </button>

                    <Link to="/cart" className="relative h-10 w-10 flex items-center justify-center rounded-xl bg-[#7C5DF9] border border-white/10 hover:bg-[#7C5DF9]/70 transition-colors cursor-pointer">
                        <ShoppingCart className="h-5 w-5 text-white" />
                    </Link>

                    <div className="relative" ref={accountMenuRef}>
                        <button
                            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#7C5DF9] border border-white/10 hover:bg-[#7C5DF9]/70 transition-colors cursor-pointer"
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
                </div>
            </nav>

            {/* Mobile Search Popup */}
            {isSearchPopupOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-start justify-center p-4 md:hidden" onClick={() => setIsSearchPopupOpen(false)}>
                    <div
                        ref={searchPopupRef}
                        className="w-full max-w-md bg-[#1A1A1C] border border-white/10 rounded-xl p-4 mt-16 animate-slideDown shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Search Games</h3>
                            <button onClick={() => setIsSearchPopupOpen(false)} className="text-white/60 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-white/50" />
                            </div>
                            <input
                                type="search"
                                placeholder="Search games..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch(e);
                                        setIsSearchPopupOpen(false);
                                    }
                                }}
                                className="w-full pl-10 px-4 py-3 bg-white/8 border border-white/10 rounded-lg 
                                placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-[#7C5DF9]/50 focus:border-[#7C5DF9]
                                transition-all duration-300 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/40 hover:text-white/70 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={(e) => {
                                    handleSearch(e);
                                    setIsSearchPopupOpen(false);
                                }}
                                className="bg-[#7C5DF9] px-4 py-2 rounded-lg font-medium transition-colors hover:bg-[#7C5DF9]/80"
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

export default Navbar;
