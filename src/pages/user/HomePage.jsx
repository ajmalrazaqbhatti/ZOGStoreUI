import { useState, useEffect, } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import overlay from '../../assets/overlay.png'
import { Eye, ChevronRight, Gamepad2, X } from 'lucide-react'
import Navbar from '../../components/Navbar'
import useAuthCheck from '../../hooks/useAuthCheck'
import Loader from '../../components/Loader';

/********************************************************
 * HomePage Component
 * Main landing page showing game catalog with search and filtering
 ********************************************************/
function HomePage() {
    // State for UI interactions and data
    const [hoveredCard, setHoveredCard] = useState(null);
    const [recentGames, setRecentGames] = useState([]);
    const [allGames, setAllGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [genres, setGenres] = useState([]);
    const [activeGenre, setActiveGenre] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    // Authentication check
    useAuthCheck();

    // Get current cart item count
    const fetchCartCount = async () => {
        try {
            const response = await fetch('http://localhost:3000/cart/count', {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setCartCount(data.itemCount); // Changed from data.count to data.itemCount
            }
        } catch (error) {
            console.error('Error fetching cart count:', error);
        }
    };

    // Update cart count on component mount
    useEffect(() => {
        fetchCartCount();
    }, []);

    // Handle game card click to show details
    const navigateToGameDetails = (game) => {
        navigate(`/game/${game.game_id}`, { state: { game } });
    };

    // Process URL search parameters
    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const search = query.get('search');
        const reset = query.get('reset');

        if (search) {
            setSearchTerm(search);
            setIsSearching(true);
            handleSearchWithTerm(search);
        } else if (reset === 'true') {
            // Reset the game state to show all games
            setSearchTerm('');
            setIsSearching(false);
            setActiveGenre('All');

            // Fetch all games
            setLoading(true);
            fetch('http://localhost:3000/games', {
                credentials: 'include'
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    setAllGames(data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Error fetching games:", error);
                    setError("Failed to load games. Please try again later.");
                    setLoading(false);
                });
        }
    }, [location.search]);

    // Load available game genres
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await fetch('http://localhost:3000/games/genres', {
                    credentials: 'include'
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch genres');
                }
                const data = await response.json();
                setGenres(data);
            } catch (error) {
                console.error("Error fetching genres:", error);
            }
        };

        fetchGenres();
    }, []);

    // Apply genre filter to game list
    const filterGamesByGenre = async (genre) => {
        setLoading(true);
        setActiveGenre(genre);

        try {
            let response;
            if (genre === 'All') {
                response = await fetch('http://localhost:3000/games', {
                    credentials: 'include'
                });
            } else {
                response = await fetch(`http://localhost:3000/games/filter?genre=${genre}`, {
                    credentials: 'include'
                });
            }

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setAllGames(data);
            setLoading(false);
        } catch (error) {
            console.error("Error filtering games:", error);
            setError("Failed to load filtered games. Please try again later.");
            setLoading(false);
        }
    };

    // Initial data loading
    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await fetch('http://localhost:3000/games', {
                    credentials: 'include'
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setRecentGames(data.slice(0, 2));
                setAllGames(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching games:", error);
                setError("Failed to load games. Please try again later.");
                setLoading(false);
            }
        };

        fetchGames();
    }, []);

    // Search functionality
    const handleSearchWithTerm = async (term) => {
        if (!term.trim()) return;

        setIsSearching(true);
        setLoading(true);

        try {
            const response = await fetch(`http://localhost:3000/games/search?title=${encodeURIComponent(term)}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Search request failed');
            }

            const data = await response.json();
            setSearchResults(data);
            setAllGames(data);
            setActiveGenre('Search Results');
            setLoading(false);
        } catch (error) {
            console.error('Error searching games:', error);
            setError('Failed to search games. Please try again.');
            setLoading(false);
        } finally {
            setIsSearching(false);
        }
    };

    // Reset search to show all games
    const clearSearch = async () => {
        setSearchTerm('');
        setIsSearching(false);
        setActiveGenre('All');
        setLoading(true);

        // Clear search parameter from URL
        navigate('/', { replace: true });

        try {
            const response = await fetch('http://localhost:3000/games', {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setAllGames(data);
            setLoading(false);
        } catch (error) {
            console.error('Error restoring games:', error);
            setError('Failed to restore games. Please try again.');
            setLoading(false);
        }
    };

    // Show loading indicator while data is being fetched
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0B] flex flex-col justify-center items-center p-4"
                style={{ backgroundImage: `url(${overlay})`, backgroundSize: 'cover' }}>
                <Loader />
            </div>
        );
    }

    return (
        <div className="bg-[#0A0A0B] min-h-screen text-white font-['Product_Sans',sans-serif] overflow-hidden pt-20"
            style={{
                backgroundImage: `url(${overlay})`,
                backgroundSize: 'cover', backgroundPosition: 'center'
            }}>

            {/* Navbar with Cart Count - removed genre filter */}
            <Navbar cartCount={cartCount} />

            {/* Hero Section - Enhanced Recent Uploads */}
            <section className="pt-16 pb-24 px-4 max-w-7xl mx-auto relative">
                {/* Decorative background elements */}
                <div className="absolute top-20 -left-64 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 -right-64 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

                <div className="mb-6 flex justify-between items-end relative">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">
                            Recent Uploads
                        </h1>
                    </div>
                </div>
                <p className="text-white/70 mb-10 text-lg max-w-2xl backdrop-blur-sm">
                    Check out the latest games added to our collection, fresh and ready for your discovery.
                </p>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#7C5DF9]"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-center">
                        {error}
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row gap-8 overflow-visible">
                        {recentGames.map((game) => (
                            <div
                                key={game.game_id}
                                className={`w-full rounded-[40px] overflow-hidden group relative 
                                  transition-all duration-300 
                                  bg-[#1A1A1C]/10 border border-white/10 cursor-pointer`}
                                onMouseEnter={() => setHoveredCard(`game-${game.game_id}`)}
                                onMouseLeave={() => setHoveredCard(null)}
                            >
                                {/* Decorative card elements */}
                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#7C5DF9]/10 rounded-full blur-xl 
                                  group-hover:bg-[#7C5DF9]/20 transition-all duration-500 overflow-visible"></div>
                                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#9b5ffb]/0 rounded-full blur-xl 
                                  group-hover:bg-[#9b5ffb]/20 transition-all duration-500 overflow-visible"></div>

                                <div className="p-4 sm:p-6 md:p-8 relative">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 mb-4 sm:mb-6">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 w-full sm:w-auto">
                                            {game.gameicon ? (
                                                <img
                                                    src={game.gameicon}
                                                    alt={`${game.title} icon`}
                                                    className="h-14 w-14 sm:h-16 sm:w-16 object-contain rounded-2xl bg-[#121214]"
                                                />
                                            ) : (
                                                <div className="p-0.5 rounded-2xl bg-gradient-to-br from-[#7C5DF9] to-[#2f00ff]">
                                                    <div className="h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-2xl bg-[#121214]">
                                                        <Gamepad2 className="h-8 w-8 sm:h-10 sm:w-10 text-[#9b5ffb]" />
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <span className="bg-gradient-to-r from-[#7C5DF9] to-[#8528ff] px-3 py-1 rounded-full text-xs font-medium">New Release</span>
                                                    {game.price === "0.00" ? (
                                                        <span className="bg-gradient-to-r from-green-500 to-emerald-400 px-3 py-1 rounded-full text-xs font-medium">Free</span>
                                                    ) : (
                                                        <span className="bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium">${game.price}</span>
                                                    )}
                                                </div>
                                                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white transition-all duration-300">{game.title}</h2>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-white/80 text-sm md:text-base mb-6 sm:mb-8 max-w-xl line-clamp-3">
                                        {game.description}
                                    </p>

                                    <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-4 xs:gap-0">
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-xs bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full">{game.genre}</span>
                                            <span className="text-xs bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full">{game.platform}</span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                className="bg-[#7C5DF9] text-white rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium transition-all flex items-center gap-2 cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigateToGameDetails(game);
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* All Games Section */}
            <section className="py-12 px-4 max-w-7xl mx-auto">
                <div className="mb-2 flex justify-between items-end">
                    <h2 className="text-3xl font-bold">
                        {activeGenre === 'All' ? 'All Games' :
                            activeGenre === 'Search Results' ? `Search Results for "${searchTerm}"` :
                                `${activeGenre} Games`}
                    </h2>
                    {isSearching && searchResults.length > 0 && (
                        <button
                            onClick={clearSearch}
                            className="text-[#7C5DF9] hover:text-[#9B82FC] transition-colors flex items-center"
                        >
                            Clear search <X className="h-4 w-4 ml-1" />
                        </button>
                    )}
                    {!isSearching && (
                        <Link to="/all-games" className="hidden md:flex items-center text-[#7C5DF9] hover:text-[#9B82FC] transition-colors">
                            View all <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                    )}
                </div>
                <p className="text-white/60 mb-8 text-lg">
                    {activeGenre === 'All' ? 'Browse our complete collection of games across all genres.' :
                        activeGenre === 'Search Results' ? 'Games matching your search criteria.' :
                            `Explore our selection of ${activeGenre.toLowerCase()} titles curated just for you.`}
                </p>

                {/* Genre Tabs - New Addition */}
                <div className="mb-8 overflow-x-auto no-scrollbar">
                    <div className="flex space-x-2 min-w-max pb-2">
                        <button
                            onClick={() => filterGamesByGenre('All')}
                            className={`px-4 py-2 rounded-xl transition-all duration-200 ${activeGenre === 'All'
                                ? 'bg-gradient-to-r cursor-pointer from-[#7C5DF9]/20 to-[#7C5DF9]/10 text-[#7C5DF9] font-medium border border-[#7C5DF9]/30'
                                : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10'
                                }`}
                        >
                            All Genres
                        </button>

                        {genres.map((genreObj) => (
                            <button
                                key={genreObj.genre}
                                onClick={() => filterGamesByGenre(genreObj.genre)}
                                className={`px-4 py-2 rounded-xl cursor-pointer transition-all duration-200 ${activeGenre === genreObj.genre
                                    ? 'bg-gradient-to-r from-[#7C5DF9]/20 to-[#7C5DF9]/10 text-[#7C5DF9] font-medium border border-[#7C5DF9]/30'
                                    : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10'
                                    }`}
                            >
                                {genreObj.genre}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#7C5DF9]"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-center">
                        {error}
                    </div>
                ) : allGames.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
                        <p className="text-lg text-white/70">
                            {activeGenre === 'Search Results'
                                ? `No games found matching "${searchTerm}". Try a different search term.`
                                : 'No games found in this category.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {allGames.map((game) => (
                            <div
                                key={game.game_id}
                                className={`group relative rounded-3xl overflow-hidden  ${hoveredCard === `all-game-${game.game_id}` ? 'ring-2 ring-[#7C5DF9] shadow shadow-[#7C5DF9]/20' : 'ring-1 ring-white/10 hover:ring-[#7C5DF9]/30 hover:bg-[#1A1A1A]'} transition-all duration-300 min-h-[200px] h-full flex flex-col cursor-pointer`}
                                onMouseEnter={() => setHoveredCard(`all-game-${game.game_id}`)}
                                onMouseLeave={() => setHoveredCard(null)}
                                onClick={() => navigateToGameDetails(game)}
                            >
                                <div className="p-3 sm:p-4 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                                        {game.gameicon ? (
                                            <img
                                                src={game.gameicon}
                                                alt={`${game.title} icon`}
                                                className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl sm:rounded-3xl object-contain p-1 sm:p-1.5"
                                            />
                                        ) : (
                                            <Gamepad2 className="h-16 w-16 sm:h-20 sm:w-20 text-[#7C5DF9]" />
                                        )}
                                        <div className="bg-white/10 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
                                            {game.price === "0.00" ? "Free" : `$${game.price}`}
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 line-clamp-1">{game.title}</h3>

                                    <div className="flex flex-wrap gap-1 sm:gap-2 mt-auto">
                                        <span className="text-xs bg-white/10 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">{game.genre}</span>
                                        <span className="text-xs bg-white/10 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">{game.platform.split(', ')[0]}</span>
                                    </div>
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