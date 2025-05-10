import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Filter, RefreshCw, AlertCircle, Check, X, Save } from 'lucide-react';
import overlay from '../../assets/overlay.png';
import useAuthCheck from '../../hooks/useAuthCheck';
import AdminSidebar from '../../components/AdminSidebar';

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

    // Edit game modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [gameToEdit, setGameToEdit] = useState(null);
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        price: '',
        platform: '',
        genre: '',
        gameicon: '',
        stock_quantity: ''
    });
    const [editFormErrors, setEditFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Add game modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({
        title: '',
        description: '',
        price: '',
        genre: '',
        platform: '',
        stock_quantity: '0',
        gameicon: ''
    });
    const [addFormErrors, setAddFormErrors] = useState({});
    const [addingGame, setAddingGame] = useState(false);

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
            const response = await fetch(`http://localhost:3000/admin/games/delete/${gameToDelete.game_id}`, {
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

    // Initialize edit modal
    const openEditModal = (game) => {
        setGameToEdit(game);
        setEditForm({
            title: game.title || '',
            description: game.description || '',
            price: game.price || '',
            genre: game.genre || '',
            platform: game.platform || '',
            stock_quantity: game.stock_quantity || '',
            gameicon: game.gameicon || ''
        });
        setEditFormErrors({});
        setShowEditModal(true);
    };

    // Close edit modal
    const closeEditModal = () => {
        setShowEditModal(false);
        setGameToEdit(null);
        setEditForm({
            title: '',
            description: '',
            price: '',
            genre: '',
            platform: '',
            stock_quantity: '',
            gameicon: ''
        });
        setEditFormErrors({});
    };

    // Handle edit form changes
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for the field being edited
        if (editFormErrors[name]) {
            setEditFormErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    // Validate edit form
    const validateEditForm = () => {
        const errors = {};

        if (!editForm.title.trim()) {
            errors.title = 'Title is required';
        }

        if (!editForm.genre.trim()) {
            errors.genre = 'Genre is required';
        }

        if (!editForm.platform.trim()) {
            errors.platform = 'Platform is required';
        }

        if (!editForm.price.trim()) {
            errors.price = 'Price is required';
        } else if (isNaN(parseFloat(editForm.price))) {
            errors.price = 'Price must be a valid number';
        }

        if (!editForm.stock_quantity.toString().trim()) {
            errors.stock_quantity = 'Stock quantity is required';
        } else if (isNaN(parseInt(editForm.stock_quantity))) {
            errors.stock_quantity = 'Stock quantity must be a valid number';
        }

        setEditFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit edit form
    const handleEditSubmit = async (e) => {
        e.preventDefault();

        if (!validateEditForm()) {
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch(`http://localhost:3000/admin/games/update/${gameToEdit.game_id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: editForm.title,
                    description: editForm.description,
                    price: editForm.price,
                    genre: editForm.genre,
                    platform: editForm.platform,
                    stock_quantity: parseInt(editForm.stock_quantity),
                    gameicon: editForm.gameicon
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update game');
            }

            // Update game in the list
            setGames(games.map(game =>
                game.game_id === gameToEdit.game_id
                    ? {
                        ...game,
                        title: editForm.title,
                        description: editForm.description,
                        price: editForm.price,
                        genre: editForm.genre,
                        platform: editForm.platform,
                        stock_quantity: parseInt(editForm.stock_quantity),
                        gameicon: editForm.gameicon
                    }
                    : game
            ));

            showToast(`"${editForm.title}" updated successfully`, 'success');
            closeEditModal();
        } catch (error) {
            console.error('Error updating game:', error);
            showToast(`Failed to update game: ${error.message}`, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Initialize add modal
    const openAddModal = () => {
        setAddForm({
            title: '',
            description: '',
            price: '',
            genre: '',
            platform: '',
            stock_quantity: '0',
            gameicon: ''
        });
        setAddFormErrors({});
        setShowAddModal(true);
    };

    // Close add modal
    const closeAddModal = () => {
        setShowAddModal(false);
        setAddForm({
            title: '',
            description: '',
            price: '',
            genre: '',
            platform: '',
            stock_quantity: '0',
            gameicon: ''
        });
        setAddFormErrors({});
    };

    // Handle add form changes
    const handleAddChange = (e) => {
        const { name, value } = e.target;
        setAddForm(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for the field being edited
        if (addFormErrors[name]) {
            setAddFormErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    // Validate add form
    const validateAddForm = () => {
        const errors = {};

        if (!addForm.title.trim()) {
            errors.title = 'Title is required';
        }

        if (!addForm.genre.trim()) {
            errors.genre = 'Genre is required';
        }

        if (!addForm.platform.trim()) {
            errors.platform = 'Platform is required';
        }

        if (!addForm.price.trim()) {
            errors.price = 'Price is required';
        } else if (isNaN(parseFloat(addForm.price))) {
            errors.price = 'Price must be a valid number';
        }

        if (!addForm.stock_quantity.toString().trim()) {
            errors.stock_quantity = 'Stock quantity is required';
        } else if (isNaN(parseInt(addForm.stock_quantity))) {
            errors.stock_quantity = 'Stock quantity must be a valid number';
        }

        setAddFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit add form
    const handleAddSubmit = async (e) => {
        e.preventDefault();

        if (!validateAddForm()) {
            return;
        }

        setAddingGame(true);

        try {
            const response = await fetch(`http://localhost:3000/admin/games/insert`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: addForm.title,
                    description: addForm.description,
                    price: addForm.price,
                    genre: addForm.genre,
                    platform: addForm.platform,
                    stock_quantity: parseInt(addForm.stock_quantity),
                    gameicon: addForm.gameicon
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add game');
            }

            const newGame = await response.json();

            // Add the new game to the list
            setGames(prevGames => [newGame, ...prevGames]);

            showToast(`"${addForm.title}" added successfully`, 'success');
            closeAddModal();

            // Refresh games list to ensure we have the latest data
            fetchGames();
        } catch (error) {
            console.error('Error adding game:', error);
            showToast(`Failed to add game: ${error.message}`, 'error');
        } finally {
            setAddingGame(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white"
            style={{ backgroundImage: `url(${overlay})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>

            {/* Admin Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <div className="lg:ml-64 transition-all duration-300">
                <div className="p-4 md:p-8">
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

                    {/* Edit Game Modal */}
                    {showEditModal && gameToEdit && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                            <div className="bg-[#1A1A1C] rounded-2xl p-6 max-w-3xl w-full shadow-xl border border-white/10 my-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold">Edit Game</h3>
                                    <button
                                        onClick={closeEditModal}
                                        className="text-white/70 hover:text-white"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleEditSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                Title *
                                            </label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={editForm.title}
                                                onChange={handleEditChange}
                                                className={`w-full px-4 py-2 bg-black/30 border rounded-lg focus:outline-none focus:ring-2 ${editFormErrors.title
                                                    ? 'border-red-500/50 focus:ring-red-500/30'
                                                    : 'border-white/10 focus:ring-[#7C5DF9]/50'
                                                    }`}
                                            />
                                            {editFormErrors.title && (
                                                <p className="mt-1 text-sm text-red-400">{editFormErrors.title}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                Genre *
                                            </label>
                                            <select
                                                name="genre"
                                                value={editForm.genre}
                                                onChange={handleEditChange}
                                                className={`w-full px-4 py-2 bg-black/30 border rounded-lg focus:outline-none focus:ring-2 ${editFormErrors.genre
                                                    ? 'border-red-500/50 focus:ring-red-500/30'
                                                    : 'border-white/10 focus:ring-[#7C5DF9]/50'
                                                    }`}
                                            >
                                                <option value="">Select Genre</option>
                                                {genres.map((genre, index) => (
                                                    <option key={index} value={genre.genre}>
                                                        {genre.genre}
                                                    </option>
                                                ))}
                                            </select>
                                            {editFormErrors.genre && (
                                                <p className="mt-1 text-sm text-red-400">{editFormErrors.genre}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                Platform *
                                            </label>
                                            <input
                                                type="text"
                                                name="platform"
                                                value={editForm.platform}
                                                onChange={handleEditChange}
                                                className={`w-full px-4 py-2 bg-black/30 border rounded-lg focus:outline-none focus:ring-2 ${editFormErrors.platform
                                                    ? 'border-red-500/50 focus:ring-red-500/30'
                                                    : 'border-white/10 focus:ring-[#7C5DF9]/50'
                                                    }`}
                                            />
                                            {editFormErrors.platform && (
                                                <p className="mt-1 text-sm text-red-400">{editFormErrors.platform}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                Price *
                                            </label>
                                            <input
                                                type="text"
                                                name="price"
                                                value={editForm.price}
                                                onChange={handleEditChange}
                                                className={`w-full px-4 py-2 bg-black/30 border rounded-lg focus:outline-none focus:ring-2 ${editFormErrors.price
                                                    ? 'border-red-500/50 focus:ring-red-500/30'
                                                    : 'border-white/10 focus:ring-[#7C5DF9]/50'
                                                    }`}
                                            />
                                            {editFormErrors.price && (
                                                <p className="mt-1 text-sm text-red-400">{editFormErrors.price}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                Stock Quantity *
                                            </label>
                                            <input
                                                type="number"
                                                name="stock_quantity"
                                                value={editForm.stock_quantity}
                                                onChange={handleEditChange}
                                                className={`w-full px-4 py-2 bg-black/30 border rounded-lg focus:outline-none focus:ring-2 ${editFormErrors.stock_quantity
                                                    ? 'border-red-500/50 focus:ring-red-500/30'
                                                    : 'border-white/10 focus:ring-[#7C5DF9]/50'
                                                    }`}
                                            />
                                            {editFormErrors.stock_quantity && (
                                                <p className="mt-1 text-sm text-red-400">{editFormErrors.stock_quantity}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                Game Icon URL
                                            </label>
                                            <input
                                                type="text"
                                                name="gameicon"
                                                value={editForm.gameicon}
                                                onChange={handleEditChange}
                                                className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C5DF9]/50"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={editForm.description}
                                            onChange={handleEditChange}
                                            rows={5}
                                            className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C5DF9]/50"
                                        ></textarea>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={closeEditModal}
                                            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/15 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="px-4 py-2 bg-[#7C5DF9] rounded-lg hover:bg-[#6A4FF0] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submitting ? (
                                                <>
                                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={16} />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Add Game Modal */}
                    {showAddModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                            <div className="bg-[#1A1A1C] rounded-2xl p-6 max-w-3xl w-full shadow-xl border border-white/10 my-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold">Add New Game</h3>
                                    <button
                                        onClick={closeAddModal}
                                        className="text-white/70 hover:text-white"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleAddSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                Title *
                                            </label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={addForm.title}
                                                onChange={handleAddChange}
                                                className={`w-full px-4 py-2 bg-black/30 border rounded-lg focus:outline-none focus:ring-2 ${addFormErrors.title
                                                    ? 'border-red-500/50 focus:ring-red-500/30'
                                                    : 'border-white/10 focus:ring-[#7C5DF9]/50'
                                                    }`}
                                            />
                                            {addFormErrors.title && (
                                                <p className="mt-1 text-sm text-red-400">{addFormErrors.title}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                Genre *
                                            </label>
                                            <select
                                                name="genre"
                                                value={addForm.genre}
                                                onChange={handleAddChange}
                                                className={`w-full px-4 py-2 bg-black/30 border rounded-lg focus:outline-none focus:ring-2 ${addFormErrors.genre
                                                    ? 'border-red-500/50 focus:ring-red-500/30'
                                                    : 'border-white/10 focus:ring-[#7C5DF9]/50'
                                                    }`}
                                            >
                                                <option value="">Select Genre</option>
                                                {genres.map((genre, index) => (
                                                    <option key={index} value={genre.genre}>
                                                        {genre.genre}
                                                    </option>
                                                ))}
                                            </select>
                                            {addFormErrors.genre && (
                                                <p className="mt-1 text-sm text-red-400">{addFormErrors.genre}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                Platform *
                                            </label>
                                            <input
                                                type="text"
                                                name="platform"
                                                value={addForm.platform}
                                                onChange={handleAddChange}
                                                className={`w-full px-4 py-2 bg-black/30 border rounded-lg focus:outline-none focus:ring-2 ${addFormErrors.platform
                                                    ? 'border-red-500/50 focus:ring-red-500/30'
                                                    : 'border-white/10 focus:ring-[#7C5DF9]/50'
                                                    }`}
                                            />
                                            {addFormErrors.platform && (
                                                <p className="mt-1 text-sm text-red-400">{addFormErrors.platform}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                Price *
                                            </label>
                                            <input
                                                type="text"
                                                name="price"
                                                value={addForm.price}
                                                onChange={handleAddChange}
                                                className={`w-full px-4 py-2 bg-black/30 border rounded-lg focus:outline-none focus:ring-2 ${addFormErrors.price
                                                    ? 'border-red-500/50 focus:ring-red-500/30'
                                                    : 'border-white/10 focus:ring-[#7C5DF9]/50'
                                                    }`}
                                            />
                                            {addFormErrors.price && (
                                                <p className="mt-1 text-sm text-red-400">{addFormErrors.price}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                Stock Quantity *
                                            </label>
                                            <input
                                                type="number"
                                                name="stock_quantity"
                                                value={addForm.stock_quantity}
                                                onChange={handleAddChange}
                                                className={`w-full px-4 py-2 bg-black/30 border rounded-lg focus:outline-none focus:ring-2 ${addFormErrors.stock_quantity
                                                    ? 'border-red-500/50 focus:ring-red-500/30'
                                                    : 'border-white/10 focus:ring-[#7C5DF9]/50'
                                                    }`}
                                            />
                                            {addFormErrors.stock_quantity && (
                                                <p className="mt-1 text-sm text-red-400">{addFormErrors.stock_quantity}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                Game Icon URL
                                            </label>
                                            <input
                                                type="text"
                                                name="gameicon"
                                                value={addForm.gameicon}
                                                onChange={handleAddChange}
                                                className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C5DF9]/50"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={addForm.description}
                                            onChange={handleAddChange}
                                            rows={5}
                                            className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C5DF9]/50"
                                        ></textarea>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={closeAddModal}
                                            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/15 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={addingGame}
                                            className="px-4 py-2 bg-[#7C5DF9] rounded-lg hover:bg-[#6A4FF0] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {addingGame ? (
                                                <>
                                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
                                                    Adding...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus size={16} />
                                                    Add Game
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <header className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold">Game Management</h1>
                            <p className="text-gray-400">Manage games in your store</p>
                        </div>
                        <button
                            onClick={openAddModal}
                            className="bg-[#7C5DF9] hover:bg-[#6A4FF0] transition-colors px-4 py-2 rounded-xl flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Add New Game
                        </button>
                    </header>

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
                                                            <button
                                                                onClick={() => openEditModal(game)}
                                                                className="p-1.5 bg-[#7C5DF9]/20 text-[#7C5DF9] rounded-lg hover:bg-[#7C5DF9]/30 transition-colors"
                                                                title="Edit Game"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
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
        </div>
    );
}

export default GameManagement;
