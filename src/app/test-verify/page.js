'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TestVerify() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Get email from URL query parameter if available
    const searchParams = new URLSearchParams(window.location.search);
    const emailParam = searchParams.get('email');
    
    console.log('TestVerify Page - Email param from URL:', emailParam);
    
    if (emailParam) {
      setEmail(emailParam);
      
      // Auto-submit the form if email is provided via URL
      console.log('Auto-submitting verification for email:', emailParam);
      setTimeout(() => {
        submitVerification(emailParam);
      }, 1000); // Small delay to ensure component is fully mounted
    }
  }, []);

  const submitVerification = async (emailToVerify) => {
    const emailToUse = emailToVerify || email;
    
    console.log('Submitting verification for email:', emailToUse);
    
    if (!emailToUse) {
      console.error('Verification error: Email is required');
      setStatus('error');
      setMessage('Email is required');
      return;
    }
    
    setIsLoading(true);
    setStatus('idle');
    setMessage('');
    
    try {
      console.log('Sending verification request for:', emailToUse);
      const response = await fetch('/api/auth/test-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailToUse }),
      });
      
      const data = await response.json();
      console.log('Verification API response:', data);
      
      if (!response.ok) {
        console.error('Verification API error:', data);
        throw new Error(data.message || 'Failed to verify email');
      }
      
      setStatus('success');
      setMessage(data.message || 'Email verified successfully');
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage(error.message || 'Failed to verify email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitVerification();
  };

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
            <h1 className="text-white text-center text-2xl font-bold">Clinic Account Verification</h1>
            <p className="text-white text-center text-sm mt-1">Verify your clinic system access</p>
          </div>
          
          <div className="p-6">
            <div className="mb-4 bg-yellow-50 p-3 rounded-md text-yellow-700 text-xs">
              <strong>Development Mode:</strong> In this environment, your clinic account will be verified immediately. In production, you would receive a verification email from the clinic system.
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Clinic Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter your clinic email"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Enter the email address you registered with the clinic system</p>
              </div>
              
              {status === 'error' && (
                <div className="text-red-600 text-sm py-2 px-3 bg-red-50 rounded-md">{message}</div>
              )}
              
              {status === 'success' && (
                <div className="text-green-600 text-sm py-2 px-3 bg-green-50 rounded-md">{message}</div>
              )}
              
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying account...
                    </>
                  ) : (
                    'Verify Clinic Account'
                  )}
                </button>
                
                <Link href="/login" className="text-sm text-blue-600 hover:text-blue-500">
                  Return to login
                </Link>
              </div>
            </form>
            
            {status === 'success' && (
              <div className="mt-6 text-center">
                <div className="mb-4 bg-green-50 p-4 rounded-md text-green-700 text-sm">
                  <svg className="w-5 h-5 inline-block mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {message}
                </div>
                
                <Link
                  href="/login"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-300"
                >
                  Return to Login
                </Link>
              </div>
            )}
            
            <div className="mt-6 border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-500">
                This is a development utility for clinic account verification. In a production environment, users would receive an email from the clinic system with a verification link.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 