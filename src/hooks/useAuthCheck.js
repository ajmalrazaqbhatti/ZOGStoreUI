import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook to check if user is authenticated
 * Redirects to home page if not authenticated
 */
const useAuthCheck = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const response = await fetch('http://localhost:3000/auth/status', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    if (!data.isAuthenticated) {
                        navigate('/');
                    }
                } else {
                    navigate('/');
                }
            } catch (error) {
                console.error('Authentication check failed:', error);
                navigate('/');
            }
        };

        checkAuthentication();
    }, [navigate]);
};

export default useAuthCheck;
