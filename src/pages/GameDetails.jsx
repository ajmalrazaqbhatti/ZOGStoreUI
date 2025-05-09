import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShoppingCart, Heart, Minus, Plus, Share2, Play, ArrowLeft, Info, Clock, X, CheckCircle, AlertCircle } from 'lucide-react';
import logo from '../assets/logo.svg';
import overlay from '../assets/overlay.png';
import Navbar from '../components/Navbar';

function GameDetails() {
    const navigate = useNavigate();
    const { gameId } = useParams();
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [addToCartSuccess, setAddToCartSuccess] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

    // Fetch game data from API
    useEffect(() => {
        const fetchGameData = async () => {
            if (gameId) {
                try {
                    setLoading(true);
                    const response = await fetch(`http://localhost:3000/games/${gameId}`, {
                        credentials: 'include'
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.error || 'Game not found');
                    }

                    const data = await response.json();
                    setGame(data);
                    setLoading(false);
                } catch (err) {
                    console.error('Error fetching game:', err);
                    setError(err.message || 'Failed to load game details');
                    setLoading(false);
                }
            }
        };

        fetchGameData();
        // Also fetch cart count when component mounts
        fetchCartCount();
    }, [gameId]);

    // Fetch cart count when component mounts
    useEffect(() => {
        fetchCartCount();
    }, []);

    // Function to fetch cart count
    const fetchCartCount = async () => {
        try {
            const response = await fetch('http://localhost:3000/cart/count', {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setCartCount(data.itemCount);
            }
        } catch (error) {
            console.error('Error fetching cart count:', error);
        }
    };

    // Show toast notification
    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });

        // Auto-hide toast after 3 seconds
        setTimeout(() => {
            setToast(prev => ({ ...prev, visible: false }));
        }, 3000);
    };

    // Handle back navigation
    const handleBack = () => {
        navigate('/');
    };

    // Handle quantity change
    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const increaseQuantity = () => {
        // Check if increasing would exceed available stock
        if (game && game.stock_quantity && quantity < game.stock_quantity) {
            setQuantity(quantity + 1);
        }
    };

    // Handle adding to cart
    const handleAddToCart = async () => {
        if (!game || !game.stock_quantity || game.stock_quantity <= 0) return;

        setAddingToCart(true);
        try {
            const response = await fetch('http://localhost:3000/cart/add', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gameId: game.game_id,
                    quantity: quantity
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add item to cart');
            }

            await response.json();
            setAddToCartSuccess(true);

            // Update cart count
            await fetchCartCount();

            // Show success toast
            showToast(`${game.title} added to cart${quantity > 1 ? ` (${quantity})` : ''}`);

            setTimeout(() => setAddToCartSuccess(false), 3000);
        } catch (error) {
            console.error('Error adding to cart:', error);
            showToast(error.message || 'Failed to add to cart', 'error');
        } finally {
            setAddingToCart(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0B] flex flex-col justify-center items-center p-4"
                style={{ backgroundImage: `url(${overlay})`, backgroundSize: 'cover' }}>
                <img src={logo} alt="ZOG Store Logo" className="h-16 mb-8 animate-pulse" />
                <div className="relative h-20 w-20">
                    <div className="absolute inset-0 rounded-full border-t-2 border-[#7C5DF9] animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-t-2 border-[#7C5DF9]/60 animate-spin" style={{ animationDuration: '1.5s' }}></div>
                    <div className="absolute inset-4 rounded-full border-t-2 border-[#7C5DF9]/30 animate-spin" style={{ animationDuration: '2s' }}></div>
                </div>
                <p className="mt-6 text-white/70 text-sm animate-pulse">Loading game details...</p>
            </div>
        );
    }

    // Error state
    if (error || !game) {
        return (
            <div className="min-h-screen bg-[#0A0A0B] flex flex-col justify-center items-center p-4"
                style={{ backgroundImage: `url(${overlay})`, backgroundSize: 'cover' }}>
                <img src={logo} alt="ZOG Store Logo" className="h-16 mb-6" />
                <div className="bg-black/5  backdrop-blur-md border border-white/10 rounded-2xl p-8 max-w-md text-center shadow-xl">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
                        <Info size={28} className="text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-3">Game Not Found</h1>
                    <p className="text-gray-400 mb-8">{error || "The game you're looking for doesn't exist or couldn't be loaded."}</p>
                    <button
                        onClick={handleBack}
                        className="bg-[#7C5DF9] hover:bg-[#6A4FF0] transition-all px-6 py-3 rounded-xl text-white font-medium w-full flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30"
                    >
                        <ArrowLeft size={18} />
                        Back to Games
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white"
            style={{
                backgroundImage: `url(${game.gameicon})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                position: 'relative'
            }}>
            {/* Add an additional blurred overlay for better effect */}
            <div className="absolute inset-0 bg-[#0A0A0B]/70 backdrop-blur-md" style={{ zIndex: 1 }}></div>

            <div className="relative z-20">
                {/* Navbar with Cart Count */}
                <Navbar cartCount={cartCount} />

                {/* Toast Notification */}
                {toast.visible && (
                    <div className="fixed bottom-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fadeIn
                        bg-black/5 backdrop-blur-md border border-white/10 max-w-md">
                        {toast.type === 'success' ? (
                            <CheckCircle className="h-5 w-5 text-[#7C5DF9]" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-red-400" />
                        )}
                        <span className="text-white text-sm">{toast.message}</span>
                        <button
                            onClick={() => setToast(prev => ({ ...prev, visible: false }))}
                            className="ml-2 text-white/50 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}



                {/* Main Content */}
                <div className="relative z-20 px-4 md:px-12 py-2  max-w-7xl mx-auto" >

                    {/* Back Button */}
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors px-4 py-2 rounded-lg  hover:bg-black/5 backdrop-blur-lg cursor-pointer"
                    >
                        <ArrowLeft size={16} />
                        <span>Back to Store</span>
                    </button>

                    <div className="flex flex-wrap gap-3 mb-4 animate-fade-in">
                        {game.genre && (
                            <span className="bg-[#7C5DF9] px-3 py-1.5 rounded-full text-xs font-medium">
                                {game.genre}
                            </span>
                        )}
                        {game.platform && (
                            <span className="bg-black/5  backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium">
                                {game.platform}
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-up">{game.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 mb-6 animate-fade-up">
                        {game.created_at && (
                            <span className="text-sm text-gray-300 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center">
                                <Clock size={14} className="mr-1" />
                                Added: {new Date(game.created_at).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* Left Column - Game Info */}
                        <div className="w-full lg:w-2/3 bg-black/0 border border-white/10 rounded-[40px]">
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-4">About This Game</h3>
                                <div className=" py-5 mb-8">
                                    <p className="text-gray-300 leading-relaxed text-[15px]">
                                        {game.description || "No description available for this game."}
                                    </p>
                                </div>

                                {/* Game Info */}
                                <h3 className="text-lg font-bold mb-4 flex items-center">
                                    <Info size={18} className="mr-2 text-[#7C5DF9]" />
                                    Game Details
                                </h3>
                                <div className="p-6 rounded-xl mb-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-sm">Game ID:</span>
                                            <span className="text-white font-medium">{game.game_id}</span>
                                        </div>

                                        {game.platform && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400 text-sm">Platform:</span>
                                                <span className="text-white font-medium">{game.platform}</span>
                                            </div>
                                        )}

                                        {game.release_date && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400 text-sm">Release Date:</span>
                                                <span className="text-white font-medium">{new Date(game.release_date).toLocaleDateString()}</span>
                                            </div>
                                        )}

                                        {game.developer && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400 text-sm">Developer:</span>
                                                <span className="text-white font-medium">{game.developer}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Purchase Panel */}
                        <div className="w-full lg:w-1/3 border border-white/10 rounded-[40px]">
                            <div className="lg:sticky lg:top-24 p-6">
                                {/* Game Icon and Price */}
                                <div className="flex items-center justify-between mb-6">
                                    {game.gameicon ? (
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={game.gameicon}
                                                alt={`${game.title} icon`}
                                                className="h-16 w-16 object-contain rounded-3xl p-2"
                                            />
                                            <div>
                                                <h3 className="font-medium text-lg">{game.title}</h3>
                                                {game.platform && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                                        <span>{game.platform}</span>
                                                        <span>•</span>
                                                        <span>Digital Download</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <h3 className="font-medium text-lg">{game.title}</h3>
                                            {game.platform && (
                                                <div className="text-sm text-gray-400">
                                                    <span>{game.platform}</span> • Digital Download
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Price and Stock */}
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <div className="text-3xl font-bold text-white">
                                            {game.price === "0.00" ? "Free" : `$${game.price}`}
                                        </div>
                                        <div className="text-sm text-gray-300 mt-1">
                                            {game.stock_quantity > 0
                                                ? game.stock_quantity > 10
                                                    ? <span className="text-green-400">In Stock</span>
                                                    : <span className="text-yellow-400">Low Stock: {game.stock_quantity} left</span>
                                                : <span className="text-red-400 font-medium">Out of Stock</span>}
                                        </div>
                                    </div>
                                    {/* Removed share and favorite buttons */}
                                </div>

                                {/* Quantity Selector */}
                                {game.stock_quantity > 0 && game.price !== "0.00" && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Quantity
                                        </label>
                                        <div className="flex items-center">
                                            <button
                                                onClick={decreaseQuantity}
                                                disabled={quantity <= 1}
                                                className={`p-2 rounded-l-lg ${quantity <= 1 ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#7C5DF9]/20 hover:bg-[#7C5DF9]/30 text-white'}`}
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    if (!isNaN(val) && val >= 1 && val <= game.stock_quantity) {
                                                        setQuantity(val);
                                                    }
                                                }}
                                                min="1"
                                                max={game.stock_quantity}
                                                className="w-16 p-1 text-center bg-black/30  text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <button
                                                onClick={increaseQuantity}
                                                disabled={quantity >= game.stock_quantity}
                                                className={`p-2 rounded-r-lg ${quantity >= game.stock_quantity ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#7C5DF9]/20 hover:bg-[#7C5DF9]/30 text-white'}`}
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Purchase Button */}
                                <div className="space-y-3">
                                    <button
                                        onClick={handleAddToCart}
                                        className={`w-full flex items-center justify-center gap-2 py-3.5 cursor-pointer rounded-xl font-medium 
                                            ${(!game.stock_quantity || game.stock_quantity <= 0)
                                                ? 'bg-gray-600 cursor-not-allowed'
                                                : addToCartSuccess
                                                    ? 'bg-green-600 hover:bg-green-700'
                                                    : 'bg-[#7C5DF9] hover:bg-[#6A4FF0]'
                                            } transition-all relative overflow-hidden `}
                                        disabled={!game.stock_quantity || game.stock_quantity <= 0 || addingToCart}
                                    >
                                        {addingToCart ? (
                                            <>
                                                <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full mr-2"></div>
                                                Adding...
                                            </>
                                        ) : addToCartSuccess ? (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Added to Cart
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart size={18} />
                                                {game.price === "0.00"
                                                    ? ((!game.stock_quantity || game.stock_quantity <= 0) ? "Out of Stock" : "Get Free")
                                                    : ((!game.stock_quantity || game.stock_quantity <= 0) ? "Out of Stock" : `Add to Cart${quantity > 1 ? ` (${quantity})` : ''}`)}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GameDetails;
