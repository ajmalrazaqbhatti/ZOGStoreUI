/********************************************************
 * Navbar Component
 * Main navigation bar with search and user controls
 ********************************************************/
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.svg';
import { Search, ShoppingCart, X, Package, LogOut } from 'lucide-react';

function Navbar({ cartCount = 0 }) {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false);
  const searchInputRef = useRef(null);
  const searchPopupRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if a given path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  /********************************************************
   * Event Handlers and Effects
   ********************************************************/
  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchPopupRef.current && !searchPopupRef.current.contains(event.target)) {
        setIsSearchPopupOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle user logout
  const handleLogout = async () => {
    try {
      const response = await fetch(
        'https://zogstorebackend-production.up.railway.app/auth/logout',
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        console.log('User logged out successfully');
        navigate('/');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Process search form submission
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      // Call the search API
      const response = await fetch(
        `https://zogstorebackend-production.up.railway.app/games/search?title=${encodeURIComponent(searchTerm)}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const searchResults = await response.json();
        // Navigate to search results page with the data
        navigate('/home', {
          state: { searchResults, searchTerm },
          search: `?search=${encodeURIComponent(searchTerm)}`,
        });
      } else {
        console.error('Search request failed');
      }
    } catch (error) {
      console.error('Error during search:', error);
    }

    setIsSearchPopupOpen(false);
  };

  // Toggle mobile search popup
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

  // Clear search and reset results
  const clearSearch = () => {
    setSearchTerm('');
    navigate('/home?reset=true', { replace: true });
  };

  return (
    <header className="fixed top-0 z-50 backdrop-blur-md border-b border-white/5 w-full">
      <nav className="flex justify-between items-center p-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-8">
            <Link to="/">
              <img
                src={logo}
                alt="ZOG Store Logo"
                className="h-10 drop-shadow-[0_0_10px_rgba(167,139,250,0.3)]"
              />
            </Link>
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
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/40 hover:text-white/70 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-3 items-center">
          {/* Mobile Search Button */}
          <button
            onClick={toggleSearchPopup}
            className="md:hidden h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Search className="h-5 w-5 text-white" />
          </button>

          {/* Orders Icon - Active State when on Orders page */}
          <Link
            to="/orders"
            className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-colors cursor-pointer ${
              isActive('/orders')
                ? 'bg-[#7C5DF9]/20 border-[#7C5DF9] text-[#7C5DF9]'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
            }`}
            title="My Orders"
          >
            <Package className="h-5 w-5" />
          </Link>

          {/* Cart Icon - Active State when on Cart page */}
          <Link
            to="/cart"
            className={`relative h-10 w-10 flex items-center justify-center rounded-xl border transition-all duration-300 cursor-pointer ${
              isActive('/cart')
                ? 'bg-[#7C5DF9]/20 border-[#7C5DF9] text-[#7C5DF9]'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
            }`}
          >
            <ShoppingCart className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transform transition-all duration-300 animate-fadeIn">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut className="h-5 w-5 text-red-400" />
          </button>
        </div>
      </nav>

      {/* Mobile Search Popup */}
      {isSearchPopupOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-999 flex items-start justify-center p-4 md:hidden"
          onClick={() => setIsSearchPopupOpen(false)}
        >
          <div
            ref={searchPopupRef}
            className="w-full max-w-md bg-[#1A1A1C] border border-white/10 rounded-3xl p-4 mt-20 animate-slideDown shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Search Games</h3>
              <button
                onClick={() => setIsSearchPopupOpen(false)}
                className="text-white/60 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none cursor-pointer">
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
                  onClick={clearSearch}
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
