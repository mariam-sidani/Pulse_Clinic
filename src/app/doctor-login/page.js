'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import useUserStore from '@/store/userStore';

export default function DoctorLogin() {
  const router = useRouter();
  const { setUser, isLoading, setLoading, setError } = useUserStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loginAttempt, setLoginAttempt] = useState(0);
  const [debug, setDebug] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setFormError('Email and password are required');
      return;
    }
    
    try {
      setLoading(true);
      setFormError('');
      setDebug(null);
      
      console.log('Doctor login attempt:', loginAttempt + 1);
      setLoginAttempt(prev => prev + 1);
      
      // Use our special doctor login endpoint
      const response = await fetch('/api/auth/doctor-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Doctor login failed:', data);
        setFormError(data.message || 'Login failed');
        setDebug(data.debug || null);
        return;
      }
      
      // Store user data
      setUser(data.user);
      
      // Redirect based on role
      router.push('/doctor-dashboard');
      
    } catch (error) {
      console.error('Doctor login error:', error);
      setFormError(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Doctor Login</h1>
            <p className="text-gray-600 mt-2">Special login for doctors only</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="doctor@example.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
            </div>
            
            {formError && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                <p>{formError}</p>
                {debug && (
                  <div className="mt-2 text-xs">
                    <p className="font-semibold">Debug info:</p>
                    <pre className="mt-1 bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(debug, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  'Login as Doctor'
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <div className="mt-2">
              <Link href="/login" className="text-blue-600 hover:text-blue-800">
                Return to normal login
              </Link>
            </div>
           
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 