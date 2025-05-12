/********************************************************
 * LoginPage Component
 * User authentication form with client-side validation
 ********************************************************/
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';
import overlay from '../assets/overlay.png';
import { Loader } from 'lucide-react';

function LoginPage() {
  // Navigation and state
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(
          'https://zogstorebackend-production.up.railway.app/auth/status',
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (response.ok) {
          const data = await response.json();

          // If already authenticated, redirect to appropriate page
          if (data.isAuthenticated) {
            if (data.user.role === 'admin') {
              navigate('/admin');
            } else {
              navigate('/home');
            }
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // If error, we stay on login page
      }
    };

    checkAuth();
  }, [navigate]);

  // Update form state on input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Process login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('https://zogstorebackend-production.up.railway.app/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store user data in localStorage or context if needed
      localStorage.setItem('user', JSON.stringify(data.user));

      // Check user role and redirect accordingly
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="bg-black  min-h-screen flex items-center justify-center p-4 font-['Product_Sans']"
      style={{
        backgroundImage: `url(${overlay})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-96 bg-white/5  rounded-[40px] overflow-hidden flex flex-col justify-center items-center h-fit p-5  border border-white/10">
        <div className="p-6 flex justify-center items-center">
          <img
            src={logo}
            alt="ZOG Store Logo"
            className="h-20 drop-shadow-[0_0_10px_rgba(167,139,250,0.2)]"
          />
        </div>

        <div className="flex flex-col justify-center items-center w-full">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400 mb-8 text-base">Sign in to continue to ZOG Store</p>

          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 px-3 py-3 bg-white/5 border border-gray-600 rounded-xl 
                                    placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 px-3 py-3 bg-white/5 border border-gray-600 rounded-xl 
                                    placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl
                                 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer
                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                                transition-all duration-150 ease-in-out disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader className="animate-spin h-4 w-4 mr-2 text-white" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-gray-400">Don't have an account?</span>
            <a
              href="/signup"
              className="ml-1 font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
