'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import useUserStore from '@/store/userStore';
import { RouteGuard } from '@/components/wrappers';

export default function Login() {
  const router = useRouter();
  const { login, isLoading, error, isLoggedIn, role } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  useEffect(() => {
    // Add debug logging on mount and when auth state changes
    console.log('Login page - Auth state:', { isLoggedIn, role });

    // Handle auto-redirect if already logged in
    if (isLoggedIn) {
      console.log('User already logged in, redirecting to dashboard');
      redirectToDashboard();
    }
  }, [isLoggedIn, role]);

  const redirectToDashboard = () => {
    console.log('Redirecting to unified dashboard');
    router.push('/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset any previous errors
    setFormError('');
    
    // Basic validation
    if (!email.trim()) {
      setFormError('Email is required');
      return;
    }
    
    if (!password) {
      setFormError('Password is required');
      return;
    }
    
    try {
      console.log('Attempting login with email:', email);
      await login(email, password);
      // Login is successful if we reach here
      console.log('Login successful, redirecting to dashboard');
      redirectToDashboard();
    } catch (err) {
      console.error('Login error:', err);
      setFormError(err.message || 'Login failed. Please check your credentials and try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleDebugInfo = () => {
    setShowDebugInfo(!showDebugInfo);
  };

  const handleForgotPassword = () => {
    alert('Please contact the clinic administrator to reset your password.\n\nAdmin Email: admin@pulseclinic.com\n\nThey will assist you with password recovery.');
  };

  return (
    <RouteGuard allowedRoles={null}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-grow items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Sign in to your account
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Or{' '}
                <Link href="/signup" className="font-medium text-blue-500 hover:text-blue-400">
                  create a new account
                </Link>
              </p>
            </div>
            
            {/* Debug info section (hidden by default) */}
            {showDebugInfo && (
              <div className="bg-gray-100 p-4 rounded-md mb-4">
                <h3 className="text-sm font-semibold mb-2">Debug Information</h3>
                <div className="text-xs">
                  <p>isLoggedIn: {isLoggedIn ? 'true' : 'false'}</p>
                  <p>role: {role}</p>
                </div>
              </div>
            )}
            
            {(formError || error) && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                <p>{formError || error}</p>
              </div>
            )}
            
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="email-address" className="sr-only">Email address</label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                  />
                </div>
                <div className="relative">
                  <label htmlFor="password" className="sr-only">Password</label>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember_me"
                    name="remember_me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 rounded"
                  />
                  <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <button 
                    type="button"
                    onClick={handleForgotPassword}
                    className="font-medium text-blue-500 hover:text-blue-400 bg-transparent border-none cursor-pointer"
                  >
                    Forgot your password?
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      </span>
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>
            
            <div className="text-center text-xs">
             
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </RouteGuard>
  );
} 