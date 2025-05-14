'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useUserStore from '@/store/userStore';

export default function GuestWrapper({ children }) {
  const router = useRouter();
  const { isLoggedIn, isLoading, role, user } = useUserStore();
  const [redirecting, setRedirecting] = useState(false);
  const [redirectAttempts, setRedirectAttempts] = useState(0);

  useEffect(() => {
    console.log("GuestWrapper useEffect triggered");
    console.log("Current state:", { isLoggedIn, isLoading, role, redirecting, user });
    
    // Clear stuck redirection states - safety mechanism
    if (redirecting && redirectAttempts > 5) {
      console.log("Detected stuck redirection - resetting state");
      setRedirecting(false);
      setRedirectAttempts(0);
      return;
    }

    // Only proceed if we're ready to redirect (not loading, logged in, not currently redirecting)
    if (!isLoading && isLoggedIn && !redirecting) {
      console.log('GuestWrapper: User is logged in with role:', role);
      
      // Set redirecting flag
      setRedirecting(true);
      
      // Determine where to redirect based on role
      let redirectPath = '/';
      
      if (role === 1) {
        console.log('Role is admin (1), redirecting to admin dashboard');
        redirectPath = '/dashboard';
      } else if (role === 2) {
        console.log('Role is doctor (2), redirecting to doctor dashboard');
        redirectPath = '/doctor/dashboard';
      } else if (role === 3) {
        console.log('Role is patient (3), redirecting to patient dashboard');
        redirectPath = '/patient/dashboard';
      } else {
        console.log('Unknown role:', role, 'falling back to home');
      }
      
      // Use timeout to ensure state updates have propagated
      const redirectTimer = setTimeout(() => {
        console.log(`Executing redirect to: ${redirectPath}`);
        try {
          router.push(redirectPath);
          console.log("Router.push executed");
          
          // Force navigation if router.push doesn't trigger within 1 second
          const forcedNavTimer = setTimeout(() => {
            console.log("Forcing navigation with window.location");
            window.location.href = redirectPath;
          }, 1000);
          
          return () => clearTimeout(forcedNavTimer);
        } catch (error) {
          console.error("Redirection error:", error);
          setRedirecting(false);
        }
      }, 100);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isLoggedIn, role, router, isLoading, redirecting, redirectAttempts, user]);

  // Track redirect attempts when redirecting is true
  useEffect(() => {
    if (redirecting) {
      const attemptTimer = setTimeout(() => {
        setRedirectAttempts(prev => prev + 1);
        console.log(`Redirect attempt ${redirectAttempts + 1}`);
      }, 1000);
      
      return () => clearTimeout(attemptTimer);
    }
  }, [redirecting, redirectAttempts]);

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
          <p className="text-gray-600">Redirecting to dashboard... {redirectAttempts > 0 && `(Attempt ${redirectAttempts})`}</p>
          {redirectAttempts > 3 && (
            <button 
              onClick={() => {
                setRedirecting(false);
                setRedirectAttempts(0);
              }}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Cancel Redirect
            </button>
          )}
        </div>
      </div>
    );
  }

  // Only render children if user is not logged in
  if (isLoggedIn) {
    return null;
  }

  return <>{children}</>;
} 