import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Minus, Plus, ArrowLeft, ShoppingBag } from 'lucide-react';
import Navbar from '../components/Navbar';
import overlay from '../assets/overlay.png';
import logo from '../assets/logo.svg';

function CartPage() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingItem, setProcessingItem] = useState(null);
    const [checkingOut, setCheckingOut] = useState(false);

    // Fetch cart items
    useEffect(() => {
        const fetchCartItems = async () => {
            setLoading(true);
            try {
                // In a real app, you would fetch from your API
                // const response = await fetch('http://localhost:3000/cart', {
                //     credentials: 'include'
                // });

                // For demo purposes, use mock data or localStorage
                // Simulating API response delay
                await new Promise(resolve => setTimeout(resolve, 800));

                // Mock data for demonstration
                const mockCartItems = [
                    {
                        id: 1,
                        game_id: 101,
                        title: "Cyber Adventure 2077",
                        price: "59.99",
                        quantity: 1,
                        gameicon: "https://via.placeholder.com/150",
                        platform: "PC, PlayStation",
                        stock_quantity: 15
                    },
                    {
                        id: 2,
                        game_id: 102,
                        title: "Fantasy Quest XI",
                        price: "39.99",
                        quantity: 2,
                        gameicon: "https://via.placeholder.com/150",
                        platform: "PC, Xbox",
                        stock_quantity: 8
                    }
                ];

                setCartItems(mockCartItems);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching cart:', err);
                setError('Failed to load your cart. Please try again.');
                setLoading(false);
            }
        };

        fetchCartItems();
    }, []);

    // Update item quantity
    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        setProcessingItem(itemId);
        try {
            // In a real app, you would call your API
            // const response = await fetch(`http://localhost:3000/cart/update`, {
            //     method: 'PUT',
            //     credentials: 'include',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({
            //         id: itemId,
            //         quantity: newQuantity
            //     }),
            // });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            // Update local state
            setCartItems(cartItems.map(item =>
                item.id === itemId
                    ? { ...item, quantity: newQuantity }
                    : item
            ));
        } catch (error) {
            console.error('Error updating cart item:', error);
            // You could show an error toast here
        } finally {
            setProcessingItem(null);
        }
    };

    // Remove item from cart
    const removeItem = async (itemId) => {
        setProcessingItem(itemId);
        try {
            // In a real app, you would call your API
            // const response = await fetch(`http://localhost:3000/cart/remove`, {
            //     method: 'DELETE',
            //     credentials: 'include',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({
            //         id: itemId
            //     }),
            // });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 600));

            // Update local state
            setCartItems(cartItems.filter(item => item.id !== itemId));
        } catch (error) {
            console.error('Error removing cart item:', error);
            // You could show an error toast here
        } finally {
            setProcessingItem(null);
        }
    };

    // Calculate subtotal
    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) =>
            total + (parseFloat(item.price) * item.quantity), 0
        ).toFixed(2);
    };

    // Handle checkout
    const handleCheckout = async () => {
        if (cartItems.length === 0) return;

        setCheckingOut(true);
        try {
            // In a real app, you would call your checkout API
            // const response = await fetch(`http://localhost:3000/checkout`, {
            //     method: 'POST',
            //     credentials: 'include',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({
            //         items: cartItems
            //     }),
            // });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Clear cart and redirect to a success page
            setCartItems([]);
            // In a real app, you would redirect to a checkout success page
            // navigate('/checkout/success');

            // For demo, just show empty cart
        } catch (error) {
            console.error('Error during checkout:', error);
            // You could show an error toast here
        } finally {
            setCheckingOut(false);
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
                <p className="mt-6 text-white/70 text-sm animate-pulse">Loading your cart...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white"
            style={{ backgroundImage: `url(${overlay})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>

            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <div className="relative z-20 px-4 md:px-12 py-8 max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="bg-white/10 hover:bg-white/15 transition-colors p-2 rounded-full"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <ShoppingCart className="h-7 w-7 text-[#7C5DF9]" />
                        Your Cart {cartItems.length > 0 && `(${cartItems.length})`}
                    </h1>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6 text-center">
                        <p className="text-red-200">{error}</p>
                        <button
                            className="mt-2 text-sm text-white/80 hover:text-white underline"
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!error && cartItems.length === 0 ? (
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center flex flex-col items-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#7C5DF9]/20 rounded-full mb-4">
                            <ShoppingBag size={36} className="text-[#7C5DF9]" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Your Cart is Empty</h2>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">Looks like you haven't added any games to your cart yet. Browse our collection to find your next adventure!</p>
                        <Link
                            to="/"
                            className="bg-[#7C5DF9] hover:bg-[#6A4FF0] transition-colors px-6 py-3 rounded-xl font-medium"
                        >
                            Explore Games
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Cart Items */}
                        <div className="w-full lg:w-2/3">
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
                                {cartItems.map(item => (
                                    <div
                                        key={item.id}
                                        className="p-4 sm:p-6 border-b border-white/10 last:border-b-0 flex flex-col sm:flex-row gap-4 relative"
                                    >
                                        {/* Item Details */}
                                        <div className="flex gap-4 flex-1">
                                            {/* Game Icon */}
                                            <div
                                                className="h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden"
                                                onClick={() => navigate(`/game/${item.game_id}`)}
                                            >
                                                <img
                                                    src={item.gameicon}
                                                    alt={item.title}
                                                    className="h-full w-full object-cover cursor-pointer"
                                                />
                                            </div>

                                            {/* Game Info */}
                                            <div className="flex-1">
                                                <h3
                                                    className="text-lg font-semibold mb-1 cursor-pointer hover:text-[#7C5DF9] transition-colors"
                                                    onClick={() => navigate(`/game/${item.game_id}`)}
                                                >
                                                    {item.title}
                                                </h3>
                                                <p className="text-sm text-gray-400 mb-2">{item.platform}</p>
                                                <div className="flex items-center justify-between sm:justify-start gap-6">
                                                    <span className="text-lg font-bold text-white">
                                                        ${item.price}
                                                    </span>

                                                    {/* Delete Button (Mobile) */}
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        disabled={processingItem === item.id}
                                                        className="sm:hidden bg-red-500/20 p-1.5 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
                                                    >
                                                        {processingItem === item.id ? (
                                                            <div className="h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                                                        ) : (
                                                            <Trash2 size={16} />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quantity Controls and Delete Button */}
                                        <div className="flex items-center gap-4 self-end sm:self-center">
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1 || processingItem === item.id}
                                                    className={`p-2 rounded-l-lg ${item.quantity <= 1 ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#7C5DF9]/20 hover:bg-[#7C5DF9]/30 text-white'}`}
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <div className="w-12 p-1 text-center bg-black/30 text-white">
                                                    {processingItem === item.id ? (
                                                        <div className="h-5 w-5 mx-auto border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        item.quantity
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    disabled={item.quantity >= item.stock_quantity || processingItem === item.id}
                                                    className={`p-2 rounded-r-lg ${item.quantity >= item.stock_quantity ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#7C5DF9]/20 hover:bg-[#7C5DF9]/30 text-white'}`}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            {/* Delete Button (Desktop) */}
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                disabled={processingItem === item.id}
                                                className="hidden sm:flex bg-red-500/20 p-2 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
                                            >
                                                {processingItem === item.id ? (
                                                    <div className="h-5 w-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <Trash2 size={18} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Cart Summary */}
                        {cartItems.length > 0 && (
                            <div className="w-full lg:w-1/3">
                                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
                                    <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between py-2">
                                            <span className="text-gray-300">Subtotal</span>
                                            <span className="font-medium">${calculateSubtotal()}</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-gray-300">Tax</span>
                                            <span className="font-medium">$0.00</span>
                                        </div>
                                        <div className="border-t border-white/10 my-2"></div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-xl">Total</span>
                                            <span className="text-xl font-bold">${calculateSubtotal()}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCheckout}
                                        disabled={checkingOut || cartItems.length === 0}
                                        className="w-full bg-[#7C5DF9] hover:bg-[#6A4FF0] transition-all py-3.5 rounded-xl font-medium text-center flex items-center justify-center"
                                    >
                                        {checkingOut ? (
                                            <>
                                                <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full mr-2"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            'Proceed to Checkout'
                                        )}
                                    </button>

                                    <button
                                        onClick={() => navigate('/')}
                                        className="w-full mt-3 bg-transparent border border-white/30 hover:border-white/50 transition-all py-3 rounded-xl font-medium"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CartPage;
