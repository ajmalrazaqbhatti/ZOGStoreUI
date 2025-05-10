import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, ArrowLeft, Filter, RefreshCw, Eye, MoreHorizontal, AlertCircle, Check, X } from 'lucide-react';
import overlay from '../../assets/overlay.png';
import useAuthCheck from '../../hooks/useAuthCheck';

function GameManagement() {
    // Check if the user is authenticated and has admin role
    useAuthCheck();

    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredGames, setFilteredGames] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState('All');
    const [genres, setGenres] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [gameToDelete, setGameToDelete] = useState(null);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

    // Fetch games
    useEffect(() => {
        fetchGames();
        fetchGenres();
    }, []);

    // Filter games based on search term and genre
    useEffect(() => {
        if (!games) return;

        let filtered = [...games];

        // Apply genre filter
        if (selectedGenre !== 'All') {
            filtered = filtered.filter(game => game.genre === selectedGenre);
        }

        // Apply search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(game =>
                game.title.toLowerCase().includes(search) ||
                game.description.toLowerCase().includes(search) ||
                String(game.game_id).includes(search)
            );
        }

        setFilteredGames(filtered);
    }, [searchTerm, selectedGenre, games]);

    const fetchGames = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:3000/games', {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch games');
            }

            const data = await response.json();
            setGames(data);
            setFilteredGames(data);
        } catch (error) {
            console.error('Error fetching games:', error);
            setError('Failed to load games. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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
            console.error('Error fetching genres:', error);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!gameToDelete) return;

        try {
            const response = await fetch(`http://localhost:3000/games/${gameToDelete.game_id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to delete game');
            }

            // Remove the deleted game from state
            setGames(games.filter(game => game.game_id !== gameToDelete.game_id));

            // Show success toast
            showToast(`"${gameToDelete.title}" was successfully deleted`, 'success');
        } catch (error) {
            console.error('Error deleting game:', error);
            showToast(`Failed to delete game: ${error.message}`, 'error');
        } finally {
            setShowDeleteModal(false);
            setGameToDelete(null);
        }
    };

    const confirmDelete = (game) => {
        setGameToDelete(game);
        setShowDeleteModal(true);
    };

    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
        setTimeout(() => {
            setToast({ visible: false, message: '', type: 'success' });
        }, 3000);
    };

    // Format price
    const formatPrice = (price) => {
        return price === "0.00" ? "Free" : `$${parseFloat(price).toFixed(2)}`;
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
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

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-[#1A1A1C] rounded-2xl p-6 max-w-md w-full shadow-xl border border-white/10">
                            <h3 className="text-xl font-bold mb-2">Delete Game</h3>
                            <p className="text-gray-400 mb-4">
                                Are you sure you want to delete "{gameToDelete?.title}"? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    className="px-4 py-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
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
                        <h1 className="text-2xl font-bold">Game Management</h1>
                    </div>

                    <Link
                        to="/admin/games/new"
                        className="bg-[#7C5DF9] hover:bg-[#6A4FF0] transition-colors px-4 py-2 rounded-xl flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add New Game
                    </Link>
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
                                placeholder="Search games by title, ID or description..."
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

                        {/* Genre Filter Dropdown */}
                        <div className="min-w-[160px]">
                            <select
                                value={selectedGenre}
                                onChange={(e) => setSelectedGenre(e.target.value)}
                                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#7C5DF9]/50 appearance-none"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 10px center',
                                    backgroundSize: '16px'
                                }}
                            >
                                <option value="All">All Genres</option>
                                {genres.map((genre, index) => (
                                    <option key={index} value={genre.genre}>
                                        {genre.genre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={fetchGames}
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
                            onClick={fetchGames}
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

                {/* Games Table */}
                {!loading && !error && (
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        {filteredGames.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#7C5DF9]/20 rounded-full mb-4">
                                    <Filter size={24} className="text-[#7C5DF9]" />
                                </div>
                                <h3 className="text-xl font-medium mb-2">No games found</h3>
                                <p className="text-gray-400 mb-4">
                                    {searchTerm
                                        ? `No games match your search for "${searchTerm}"`
                                        : selectedGenre !== 'All'
                                            ? `No games found in the "${selectedGenre}" genre`
                                            : 'There are no games in the database'}
                                </p>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedGenre('All');
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
                                                Title
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Genre
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Price
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Stock
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Added
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {filteredGames.map(game => (
                                            <tr key={game.game_id} className="hover:bg-white/5">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {game.game_id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {game.gameicon ? (
                                                            <img
                                                                src={game.gameicon}
                                                                alt={game.title}
                                                                className="h-10 w-10 rounded-lg mr-3 object-cover bg-black/30"
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-lg mr-3 bg-[#7C5DF9]/20 flex items-center justify-center">
                                                                <span className="text-[#7C5DF9]">{game.title.charAt(0)}</span>
                                                            </div>
                                                        )}
                                                        <div className="font-medium">{game.title}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {game.genre}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {formatPrice(game.price)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={
                                                        game.stock_quantity <= 0 ? 'text-red-400' :
                                                            game.stock_quantity < 5 ? 'text-yellow-400' :
                                                                'text-green-400'
                                                    }>
                                                        {game.stock_quantity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {formatDate(game.created_at)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <Link
                                                            to={`/game/${game.game_id}`}
                                                            className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                                                            title="View Game"
                                                        >
                                                            <Eye size={16} />
                                                        </Link>
                                                        <Link
                                                            to={`/admin/games/edit/${game.game_id}`}
                                                            className="p-1.5 bg-[#7C5DF9]/20 text-[#7C5DF9] rounded-lg hover:bg-[#7C5DF9]/30 transition-colors"
                                                            title="Edit Game"
                                                        >
                                                            <Edit size={16} />
                                                        </Link>
                                                        <button
                                                            onClick={() => confirmDelete(game)}
                                                            className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                                            title="Delete Game"
                                                        >
                                                            <Trash2 size={16} />
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

export default GameManagement;
