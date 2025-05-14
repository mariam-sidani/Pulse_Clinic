'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useUserStore from '@/store/userStore';

export default function DoctorWrapper({ children }) {
  const router = useRouter();
  const { isLoggedIn, isLoading, role } = useUserStore();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && !redirecting) {
      if (!isLoggedIn) {
        console.log('DoctorWrapper: User not logged in. Redirecting to login.');
        setRedirecting(true);
        setTimeout(() => {
          router.push('/login');
        }, 100);
      } else if (role !== 2) {
        // If not doctor, redirect to home
        console.log('DoctorWrapper: User is not doctor. Redirecting to home.');
        setRedirecting(true);
        setTimeout(() => {
          router.push('/');
        }, 100);
      }
    }
  }, [isLoggedIn, role, router, isLoading, redirecting]);

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

  // If not doctor or not logged in, return nothing
  if (!isLoggedIn || role !== 2) {
    return null;
  }

  return <>{children}</>;
} 