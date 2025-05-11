import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Minus, Plus, ArrowLeft, ShoppingBag, X, CheckCircle, AlertCircle, CreditCard, Wallet, Gift } from 'lucide-react';
import Navbar from '../../components/Navbar';
import overlay from '../../assets/overlay.png';
import useAuthCheck from '../../hooks/useAuthCheck';
import Loader from '../../components/Loader';
import Toast from '../../components/Toast';

/********************************************************
 * CartPage Component
 * Displays cart items and handles checkout process
 ********************************************************/
function CartPage() {
    // State and navigation setup
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingItem, setProcessingItem] = useState(null);
    const [checkingOut, setCheckingOut] = useState(false);
    const [cartTotal, setCartTotal] = useState(0);
    const [itemCount, setItemCount] = useState(0);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
    // Checkout process states
    const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart', 'payment', 'confirmation'
    const [paymentMethod, setPaymentMethod] = useState('Credit Card');

    // Authentication check
    useAuthCheck();

    /********************************************************
     * Toast Notification Functions
     ********************************************************/
    // Display notification to user
    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });

        // Auto-hide toast after 3 seconds
        setTimeout(() => {
            setToast(prev => ({ ...prev, visible: false }));
        }, 3000);
    };

    // Hide toast notification
    const closeToast = () => {
        setToast(prev => ({ ...prev, visible: false }));
    };

    /********************************************************
     * Cart Calculation Functions
     ********************************************************/
    // Calculate total price of all items
    const calculateCartTotal = (items) => {
        return items.reduce((sum, item) => {
            const itemPrice = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 0;
            return sum + (itemPrice * quantity);
        }, 0);
    };

    /********************************************************
     * Data Fetching
     ********************************************************/
    // Load cart items from API
    useEffect(() => {
        const fetchCartItems = async () => {
            setLoading(true);
            try {
                // Make a real API call to fetch cart items
                const response = await fetch('http://localhost:3000/cart', {
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch cart items');
                }

                const data = await response.json();
                setCartItems(data.cartItems);

                // Fix for the incorrectly formatted total from API
                const calculatedTotal = calculateCartTotal(data.cartItems);
                setCartTotal(calculatedTotal);

                setItemCount(data.itemCount);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching cart:', err);
                setError('Failed to load your cart. Please try again.');
                setLoading(false);
            }
        };

        fetchCartItems();
    }, []);

    /********************************************************
     * Cart Item Management
     ********************************************************/
    // Update item quantity in cart
    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        setProcessingItem(itemId);
        try {
            // Updated to use POST and the correct parameter name
            const response = await fetch(`http://localhost:3000/cart/update`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cartId: itemId,  // Changed from id to cartId
                    quantity: newQuantity
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Handle insufficient inventory with toast instead of alert
                if (response.status === 400 && errorData.message.includes('exceeds available stock')) {
                    showToast(`Only ${errorData.availableQuantity} units available in stock.`, 'error');
                    throw new Error(errorData.message);
                }
                throw new Error('Failed to update cart item');
            }

            // Refresh cart data after update
            const cartResponse = await fetch('http://localhost:3000/cart', {
                credentials: 'include'
            });

            if (cartResponse.ok) {
                const data = await cartResponse.json();
                setCartItems(data.cartItems);

                // Use our own calculation for total
                const calculatedTotal = calculateCartTotal(data.cartItems);
                setCartTotal(calculatedTotal);

                setItemCount(data.itemCount);

                // Show success toast
                showToast('Cart updated successfully');
            }
        } catch (error) {
            console.error('Error updating cart item:', error);
            if (!error.message.includes('exceeds available stock')) {
                showToast('Failed to update cart item', 'error');
            }
        } finally {
            setProcessingItem(null);
        }
    };

    // Remove item from cart
    const removeItem = async (itemId) => {
        setProcessingItem(itemId);
        try {
            const response = await fetch(`http://localhost:3000/cart/remove`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cartId: itemId  // Changed from 'id' to 'cartId' to match backend
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to remove cart item');
            }

            // Refresh cart data after removal
            const cartResponse = await fetch('http://localhost:3000/cart', {
                credentials: 'include'
            });

            if (cartResponse.ok) {
                const data = await cartResponse.json();
                setCartItems(data.cartItems);

                // Use our own calculation for total
                const calculatedTotal = calculateCartTotal(data.cartItems);
                setCartTotal(calculatedTotal);

                setItemCount(data.itemCount);

                // Show success toast for item removal
                showToast('Item removed from cart');
            }
        } catch (error) {
            console.error('Error removing cart item:', error);
            showToast('Failed to remove item from cart', 'error');
        } finally {
            setProcessingItem(null);
        }
    };

    // Calculate cart subtotal
    const calculateSubtotal = () => {
        return cartTotal ? cartTotal.toFixed(2) : "0.00";
    };

    /********************************************************
     * Checkout Process
     ********************************************************/
    // Start checkout process
    const startCheckout = () => {
        if (cartItems.length === 0) return;
        setCheckoutStep('payment');
    };

    // Select payment method
    const selectPaymentMethod = (method) => {
        setPaymentMethod(method);
    };

    // Return to cart from payment screen
    const cancelPayment = () => {
        setCheckoutStep('cart');
    };

    // Complete checkout and create order
    const handleCheckout = async () => {
        if (cartItems.length === 0) return;

        setCheckingOut(true);
        try {
            const response = await fetch(`http://localhost:3000/orders/create`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paymentMethod: paymentMethod
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Checkout failed');
            }

            const orderData = await response.json();

            // Clear cart and redirect to a success page
            setCartItems([]);
            setCartTotal(0);
            setItemCount(0);

            // Show success toast before navigating
            showToast('Order placed successfully! Redirecting...');

            // Set confirmation step
            setCheckoutStep('confirmation');

            // Add a small delay before navigating to allow the toast to be seen
            setTimeout(() => {
                navigate('/orders', {
                    state: {
                        orderInfo: orderData
                    }
                });
            }, 1500);

        } catch (error) {
            console.error('Error during checkout:', error);
            showToast('Checkout failed: ' + error.message, 'error');
            setCheckingOut(false);
        }
    };

    // Show loading indicator
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0B] flex flex-col justify-center items-center p-4"
                style={{ backgroundImage: `url(${overlay})`, backgroundSize: 'cover' }}>
                <Loader />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white"
            style={{ backgroundImage: `url(${overlay})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>

            {/* Toast Notification */}
            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onClose={closeToast}
            />

            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <div className="relative z-20 px-4 md:px-12 py-8 max-w-7xl mx-auto pt-24">
                <div className="flex items-center gap-3 mb-8">
                    {checkoutStep === 'cart' ? (
                        <button
                            onClick={() => navigate('/home')}
                            className="bg-white/10 hover:bg-white/15 transition-colors p-2 rounded-full cursor-pointer"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={cancelPayment}
                            className="bg-white/10 hover:bg-white/15 transition-colors p-2 rounded-full cursor-pointer"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <ShoppingCart className="h-7 w-7 text-[#7C5DF9]" />
                        {checkoutStep === 'cart' && `Your Cart ${cartItems.length > 0 ? `(${itemCount})` : ''}`}
                        {checkoutStep === 'payment' && 'Payment Method'}
                        {checkoutStep === 'confirmation' && 'Order Confirmation'}
                    </h1>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6 text-center">
                        <p className="text-red-200">{error}</p>
                        <button
                            className="mt-2 text-sm text-white/80 hover:text-white underline cursor-pointer"
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!error && cartItems.length === 0 && checkoutStep === 'cart' ? (
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center flex flex-col items-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#7C5DF9]/20 rounded-full mb-4">
                            <ShoppingBag size={36} className="text-[#7C5DF9]" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Your Cart is Empty</h2>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">Looks like you haven't added any games to your cart yet. Browse our collection to find your next adventure!</p>
                        <Link
                            to="/home"
                            className="bg-[#7C5DF9] hover:bg-[#6A4FF0] transition-colors px-6 py-3 rounded-xl font-medium"
                        >
                            Explore Games
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Cart View */}
                        {checkoutStep === 'cart' && (
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Cart Items */}
                                <div className="w-full lg:w-2/3">
                                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden">
                                        {cartItems.map(item => (
                                            <div
                                                key={item.cart_id}
                                                className="p-4 sm:p-6 border-b border-white/10 last:border-b-0 flex flex-col sm:flex-row gap-4 relative"
                                            >
                                                {/* Item Details */}
                                                <div className="flex gap-4 flex-1">
                                                    {/* Game Icon */}
                                                    <div
                                                        className="h-20 w-20 flex-shrink-0 rounded-2xl overflow-hidden"
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
                                                        <div className="flex items-center justify-between sm:justify-start gap-6">
                                                            <span className="text-lg font-bold text-white">
                                                                ${item.price}
                                                            </span>

                                                            {/* Delete Button (Mobile) */}
                                                            <button
                                                                onClick={() => removeItem(item.cart_id)}
                                                                disabled={processingItem === item.cart_id}
                                                                className="sm:hidden bg-red-500/20 p-1.5 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer"
                                                            >
                                                                {processingItem === item.cart_id ? (
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
                                                            onClick={() => updateQuantity(item.cart_id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1 || processingItem === item.cart_id}
                                                            className={`p-2 rounded-l-lg cursor-pointer ${item.quantity <= 1 ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#7C5DF9]/20 hover:bg-[#7C5DF9]/30 text-white'}`}
                                                        >
                                                            <Minus size={16} />
                                                        </button>
                                                        <div className="w-12 p-1 text-center bg-black/30 text-white">
                                                            {processingItem === item.cart_id ? (
                                                                <div className="h-5 w-5 mx-auto border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                            ) : (
                                                                item.quantity
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => updateQuantity(item.cart_id, item.quantity + 1)}
                                                            disabled={processingItem === item.cart_id}
                                                            className="p-2 rounded-r-lg bg-[#7C5DF9]/20 hover:bg-[#7C5DF9]/30 text-white cursor-pointer"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>

                                                    {/* Delete Button (Desktop) */}
                                                    <button
                                                        onClick={() => removeItem(item.cart_id)}
                                                        disabled={processingItem === item.cart_id}
                                                        className="hidden sm:flex bg-red-500/20 p-2 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer"
                                                    >
                                                        {processingItem === item.cart_id ? (
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
                                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                                            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                                            <div className="space-y-3 mb-6">
                                                <div className="flex justify-between py-2">
                                                    <span className="text-gray-300">Subtotal</span>
                                                    <span className="font-medium">${calculateSubtotal()}</span>
                                                </div>
                                                <div className="border-t border-white/10 my-2"></div>
                                                <div className="flex justify-between py-2">
                                                    <span className="text-xl">Total</span>
                                                    <span className="text-xl font-bold">${calculateSubtotal()}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={startCheckout}
                                                disabled={cartItems.length === 0}
                                                className="w-full bg-[#7C5DF9] hover:bg-[#6A4FF0] transition-all py-3.5 rounded-xl font-medium text-center flex items-center justify-center cursor-pointer"
                                            >
                                                Proceed to Checkout
                                            </button>

                                            <button
                                                onClick={() => navigate('/')}
                                                className="w-full mt-3 bg-transparent border border-white/30 hover:border-white/50 transition-all py-3 rounded-xl font-medium cursor-pointer"
                                            >
                                                Continue Shopping
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Payment Method Selection */}
                        {checkoutStep === 'payment' && (
                            <div className="flex flex-col lg:flex-row gap-8">
                                <div className="w-full lg:w-2/3">
                                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
                                        <h2 className="text-xl font-bold mb-6">Select Payment Method</h2>

                                        <div className="space-y-4">
                                            {/* Credit Card Option */}
                                            <div
                                                className={`p-4 rounded-xl border transition-all cursor-pointer ${paymentMethod === 'Credit Card'
                                                    ? 'border-[#7C5DF9] bg-[#7C5DF9]/10'
                                                    : 'border-white/10 hover:border-white/30'
                                                    }`}
                                                onClick={() => selectPaymentMethod('Credit Card')}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-[#7C5DF9]/20 p-3 rounded-full">
                                                        <CreditCard className="h-6 w-6 text-[#7C5DF9]" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold">Credit Card</h3>
                                                        <p className="text-sm text-white/70">All major credit cards accepted</p>
                                                    </div>
                                                    <div className="ml-auto">
                                                        <div className={`h-5 w-5 rounded-full border-2 ${paymentMethod === 'Credit Card'
                                                            ? 'border-[#7C5DF9] bg-[#7C5DF9]'
                                                            : 'border-white/30'
                                                            }`}>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Digital Wallet Option */}
                                            <div
                                                className={`p-4 rounded-xl border transition-all cursor-pointer ${paymentMethod === 'Digital Wallet'
                                                    ? 'border-[#7C5DF9] bg-[#7C5DF9]/10'
                                                    : 'border-white/10 hover:border-white/30'
                                                    }`}
                                                onClick={() => selectPaymentMethod('Digital Wallet')}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-[#7C5DF9]/20 p-3 rounded-full">
                                                        <Wallet className="h-6 w-6 text-[#7C5DF9]" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold">Digital Wallet</h3>
                                                        <p className="text-sm text-white/70">PayPal, Apple Pay, Google Pay</p>
                                                    </div>
                                                    <div className="ml-auto">
                                                        <div className={`h-5 w-5 rounded-full border-2 ${paymentMethod === 'Digital Wallet'
                                                            ? 'border-[#7C5DF9] bg-[#7C5DF9]'
                                                            : 'border-white/30'
                                                            }`}>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Gift Card Option */}
                                            <div
                                                className={`p-4 rounded-xl border transition-all cursor-pointer ${paymentMethod === 'Gift Card'
                                                    ? 'border-[#7C5DF9] bg-[#7C5DF9]/10'
                                                    : 'border-white/10 hover:border-white/30'
                                                    }`}
                                                onClick={() => selectPaymentMethod('Gift Card')}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-[#7C5DF9]/20 p-3 rounded-full">
                                                        <Gift className="h-6 w-6 text-[#7C5DF9]" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold">Gift Card</h3>
                                                        <p className="text-sm text-white/70">Redeem ZOG Store gift card</p>
                                                    </div>
                                                    <div className="ml-auto">
                                                        <div className={`h-5 w-5 rounded-full border-2 ${paymentMethod === 'Gift Card'
                                                            ? 'border-[#7C5DF9] bg-[#7C5DF9]'
                                                            : 'border-white/30'
                                                            }`}>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="w-full lg:w-1/3">
                                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
                                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                                        <div className="space-y-3 mb-4">
                                            <div className="flex justify-between">
                                                <span className="text-gray-300">Items ({itemCount})</span>
                                                <span className="font-medium">${calculateSubtotal()}</span>
                                            </div>
                                            <div className="border-t border-white/10 my-2"></div>
                                            <div className="flex justify-between">
                                                <span className="text-xl">Total</span>
                                                <span className="text-xl font-bold">${calculateSubtotal()}</span>
                                            </div>
                                        </div>

                                        <div className="border rounded-lg border-white/10 p-3 mb-6">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white/70">Payment Method:</span>
                                                <span className="font-medium">{paymentMethod}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleCheckout}
                                            disabled={checkingOut}
                                            className="w-full bg-[#7C5DF9] hover:bg-[#6A4FF0] transition-all py-3.5 rounded-xl font-medium text-center flex items-center justify-center cursor-pointer"
                                        >
                                            {checkingOut ? (
                                                <>
                                                    <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full mr-2"></div>
                                                    Processing...
                                                </>
                                            ) : (
                                                'Place Order'
                                            )}
                                        </button>

                                        <button
                                            onClick={cancelPayment}
                                            disabled={checkingOut}
                                            className="w-full mt-3 bg-transparent border border-white/30 hover:border-white/50 transition-all py-3 rounded-xl font-medium cursor-pointer"
                                        >
                                            Back to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default CartPage;
