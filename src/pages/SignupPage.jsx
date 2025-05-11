/********************************************************
 * SignupPage Component
 * Multi-step registration form for new users
 ********************************************************/
import { useState } from "react";
import logo from "../assets/logo.svg";
import overlay from "../assets/overlay.png";
import { Loader } from 'lucide-react';

function SignupPage() {
    // Form state
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    // Validation errors
    const [errors, setErrors] = useState({
        username: '',
        email: '',
        password: ''
    });

    // Multi-step form tracking
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [signupSuccess, setSignupSuccess] = useState(false);

    /********************************************************
     * Validation Functions
     ********************************************************/
    // Email format validation
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Password requirements check
    const validatePassword = (password) => {
        // Minimum 8 characters, at least one uppercase, one lowercase, one number, one special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    /********************************************************
     * Form Handlers
     ********************************************************/
    // Update form data on input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear errors when user types
        setErrors({
            ...errors,
            [name]: ''
        });
    };

    // Validate current step fields
    const validateCurrentStep = () => {
        let isValid = true;
        let newErrors = { ...errors };

        if (currentStep === 1 && !formData.username.trim()) {
            newErrors.username = 'Username is required';
            isValid = false;
        }
        else if (currentStep === 2 && !validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
            isValid = false;
        }
        else if (currentStep === 3 && !validatePassword(formData.password)) {
            newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, number and special character';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // Move to next form step
    const goToNextStep = () => {
        if (validateCurrentStep()) {
            setCurrentStep(Math.min(currentStep + 1, totalSteps));
        }
    };

    // Move to previous form step
    const goToPreviousStep = () => {
        setCurrentStep(Math.max(currentStep - 1, 1));
    };

    // Submit registration to API
    const signupUser = async () => {
        setIsLoading(true);
        setApiError('');

        try {
            const response = await fetch('http://localhost:3000/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to register user');
            }

            setSignupSuccess(true);
            console.log('Registration successful:', data);


        } catch (error) {
            console.error('Signup failed:', error);
            setApiError(error.message || 'An error occurred during signup');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (currentStep < totalSteps) {
            goToNextStep();
            return;
        }

        // Final submission validation
        if (!validateCurrentStep()) {
            return;
        }

        console.log('Signup attempt with:', formData);
        await signupUser();
    };

    /********************************************************
     * UI Components
     ********************************************************/
    // Step indicator/progress bar
    const renderStepIndicator = () => {
        return (
            <div className="flex justify-center mb-6 w-full">
                {[...Array(totalSteps)].map((_, index) => (
                    <div key={index} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs 
                            ${index + 1 === currentStep ? 'bg-indigo-600 text-white' :
                                index + 1 < currentStep ? 'bg-indigo-400 text-white' : 'bg-gray-700 text-gray-300'}`}>
                            {index + 1}
                        </div>
                        {index < totalSteps - 1 && (
                            <div className={`w-10 h-1 ${index + 1 < currentStep ? 'bg-indigo-400' : 'bg-gray-700'}`}></div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    // Get title for current step
    const getStepTitle = () => {
        switch (currentStep) {
            case 1: return "Choose Username";
            case 2: return "Add Email";
            case 3: return "Create Password";
            default: return "Create Account";
        }
    };

    // Get description for current step
    const getStepDescription = () => {
        switch (currentStep) {
            case 1: return "Enter a unique username for your account";
            case 2: return "Provide your email address";
            case 3: return "Create a secure password";
            default: return "Sign up to get started with ZOG Store";
        }
    };

    return (
        <div className="bg-black min-h-screen flex items-center justify-center p-4 font-['Product_Sans']" style={{ backgroundImage: `url(${overlay})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="w-96 bg-white/5 rounded-[40px] overflow-hidden flex flex-col justify-center items-center h-fit min-h-[600px] p-5 border border-white/10">
                <div className="p-6 flex justify-center items-center">
                    <img src={logo} alt="ZOG Store Logo" className="h-16 drop-shadow-[0_0_10px_rgba(167,139,250,0.2)]" />
                </div>

                <div className="flex flex-col justify-center items-center w-full">
                    {signupSuccess ? (
                        <div className="text-center p-6 space-y-4">
                            <div className="inline-flex h-14 w-14 rounded-full bg-green-500/20 items-center justify-center mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white">Registration Successful!</h2>
                            <p className="text-gray-400">Your account has been created.</p>
                            <a href="/" className="mt-4 block w-full py-3 px-4 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150 ease-in-out text-center">
                                Go to Login
                            </a>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-white mb-2">
                                {getStepTitle()}
                            </h1>
                            <p className="text-gray-400 mb-4 text-base">{getStepDescription()}</p>

                            {renderStepIndicator()}

                            {apiError && (
                                <div className="w-full mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
                                    {apiError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5 w-full">
                                {currentStep === 1 && (
                                    <div>
                                        <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                                            Username
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <input
                                                id="username"
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                className="appearance-none block w-full pl-10 px-3 py-3 bg-white/5 border border-gray-600 rounded-xl 
                                                placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                placeholder="johndoe"
                                                required
                                            />
                                        </div>
                                        {errors.username && <p className="mt-1 text-sm text-red-400">{errors.username}</p>}
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
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
                                        {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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
                                        {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
                                        <p className="mt-1 text-xs text-gray-400">Must be at least 8 characters with uppercase, lowercase, number and special character</p>
                                    </div>
                                )}

                                <div className="flex space-x-3">
                                    {currentStep > 1 && (
                                        <button
                                            type="button"
                                            onClick={goToPreviousStep}
                                            className="w-1/2 flex justify-center py-3 px-4 border border-gray-500 rounded-xl
                                            text-sm font-medium text-gray-300 hover:bg-gray-700 cursor-pointer
                                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                                            transition-all duration-150 ease-in-out"
                                            disabled={isLoading}
                                        >
                                            Back
                                        </button>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`${currentStep > 1 ? 'w-1/2' : 'w-full'} flex justify-center py-3 px-4 border border-transparent rounded-xl
                                        text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer
                                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                                        transition-all duration-150 ease-in-out ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center">
                                                <Loader className="animate-spin h-4 w-4 mr-2 text-white" />
                                                <span>Signing up...</span>
                                            </div>
                                        ) : null}
                                        {currentStep < totalSteps ? 'Next' : (isLoading ? 'Signing up...' : 'Sign up')}
                                    </button>
                                </div>
                            </form>

                            <div className="mt-8 text-center text-sm">
                                <span className="text-gray-400">Already have an account?</span>
                                <a href="/" className="ml-1 font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                                    Sign in
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SignupPage;
