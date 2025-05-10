import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Custom hook to check if user is authenticated and has appropriate role
 * Redirects to login page if not authenticated
 * Redirects admin to admin dashboard if trying to access user routes
 * Redirects regular users to home if trying to access admin routes
 */
const useAuthCheck = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const response = await fetch('http://localhost:3000/auth/status', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    // Not authenticated - redirect to login
                    if (!data.isAuthenticated) {
                        navigate('/');
                        return;
                    }
                    
                    const isAdminRoute = location.pathname === '/admin';
                    const isUserRoute = ['/home', '/game', '/cart', '/orders'].some(
                        route => location.pathname.startsWith(route)
                    );

                    // Admin trying to access user routes
                    if (data.user.role === 'admin' && isUserRoute) {
                        navigate('/admin');
                        return;
                    }
                    
                    // Regular user trying to access admin routes
                    if (data.user.role !== 'admin' && isAdminRoute) {
                        navigate('/home');
                        return;
                    }
                    
                    // Update localStorage with latest user data
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                } else {
                    // Invalid response - redirect to login
                    localStorage.removeItem('user');
                    navigate('/');
                }
            } catch (error) {
                console.error('Authentication check failed:', error);
                // On network error, don't redirect if we have stored user data
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                if (!storedUser || !storedUser.id) {
                    navigate('/');
                }
            }
        };

        checkAuthentication();
    }, [navigate, location.pathname]);
};

export default useAuthCheck;
