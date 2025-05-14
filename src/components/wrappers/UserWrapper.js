'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useUserStore from '@/store/userStore';

export default function UserWrapper({ children, requiredAuth = true }) {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useUserStore();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && !redirecting) {
      if (requiredAuth && !isLoggedIn) {
        console.log('UserWrapper: Authentication required but user not logged in. Redirecting to login.');
        setRedirecting(true);
        // Add slight delay to avoid redirect loops
        setTimeout(() => {
          router.push('/login');
        }, 100);
      } else if (!requiredAuth && isLoggedIn) {
        console.log('UserWrapper: Authentication not required but user is logged in. Redirecting to home.');
        setRedirecting(true);
        setTimeout(() => {
          router.push('/');
        }, 100);
      }
    }
  }, [isLoggedIn, requiredAuth, router, isLoading, redirecting]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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

  // If authentication is required and user is not logged in, or
  // if authentication is not required but user is logged in, return nothing
  if ((requiredAuth && !isLoggedIn) || (!requiredAuth && isLoggedIn)) {
    return null;
  }

  return <>{children}</>;
} 