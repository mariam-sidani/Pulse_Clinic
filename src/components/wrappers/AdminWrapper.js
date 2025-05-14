'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useUserStore from '@/store/userStore';
import AuthDebug from '../debug/AuthDebug';

export default function AdminWrapper({ children }) {
  const router = useRouter();
  const { user, isLoggedIn, isLoading, role } = useUserStore();
  const [redirecting, setRedirecting] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Log current auth state
    console.log('AdminWrapper - Auth State:', {
      isLoggedIn,
      role,
      hasUser: !!user,
      hasToken: user?.token ? true : false,
      tokenLength: user?.token?.length,
      isLoading,
      redirecting
    });
    
    // Allow a moment for the store to initialize
    const authCheckTimer = setTimeout(() => {
      setCheckingAuth(false);
      
      if (!isLoading && !redirecting) {
        if (!isLoggedIn || !user) {
          console.log('AdminWrapper: User not logged in. Redirecting to login.');
          setRedirecting(true);
          setTimeout(() => {
            router.push('/login');
          }, 100);
        } else if (role !== 1) {
          // If not admin, redirect to home
          console.log('AdminWrapper: User is not admin (role:', role, '). Redirecting to home.');
          setRedirecting(true);
          setTimeout(() => {
            router.push('/');
          }, 100);
        } else {
          console.log('AdminWrapper: User is admin. Proceeding.');
        }
      }
    }, 1000); // Wait 1 second for auth to initialize
    
    return () => clearTimeout(authCheckTimer);
  }, [isLoggedIn, role, router, isLoading, redirecting, user]);

  // Show loading spinner while checking authentication
  if (checkingAuth || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Checking authorization...</p>
        </div>
      </div>
    );
  }

  // Show loading spinner while actively redirecting
  if (redirecting) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  // If not admin or not logged in, return nothing (middleware should handle this)
  if (!isLoggedIn || role !== 1) {
    return null;
  }

  return (
    <>
      {children}
      <AuthDebug />
    </>
  );
} 