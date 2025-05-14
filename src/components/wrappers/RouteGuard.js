'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useUserStore from '@/store/userStore';

// RouteGuard is a unified wrapper that handles authentication and role-based routing
export default function RouteGuard({ 
  children, 
  // Which roles can access this route (empty array means any authenticated user, null means guest only)
  allowedRoles = undefined,
  // Fallback route if access is denied (defaults to home)
  fallbackRoute = '/',
  // Login redirect route (only used for routes requiring authentication)
  loginRoute = '/login'
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, user, role } = useUserStore();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('RouteGuard - Auth state for path:', pathname, { 
      isLoggedIn, 
      userRole: role, 
      allowedRoles,
      email: user?.email 
    });
    
    // Check authentication and authorization
    authCheck();
  }, [pathname, isLoggedIn, role, user]);

  const authCheck = () => {
    setLoading(true);
    
    // If allowedRoles is null, only non-authenticated users can access
    if (allowedRoles === null) {
      if (isLoggedIn) {
        console.log('RouteGuard - Guest-only route accessed by logged-in user, redirecting to dashboard');
        router.push('/dashboard');
        setAuthorized(false);
      } else {
        console.log('RouteGuard - Guest-only route, access granted');
        setAuthorized(true);
      }
    }
    // If allowedRoles is an empty array, any authenticated user can access
    else if (Array.isArray(allowedRoles) && allowedRoles.length === 0) {
      if (!isLoggedIn) {
        console.log('RouteGuard - Authenticated route accessed by non-logged-in user, redirecting to login');
        router.push(loginRoute);
        setAuthorized(false);
      } else {
        console.log('RouteGuard - Authenticated route, access granted');
        setAuthorized(true);
      }
    }
    // If allowedRoles is specified, check if the user's role is included
    else if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
      if (!isLoggedIn) {
        console.log('RouteGuard - Role-protected route accessed by non-logged-in user, redirecting to login');
        router.push(loginRoute);
        setAuthorized(false);
      } else if (!allowedRoles.includes(role)) {
        console.log(`RouteGuard - User role ${role} not allowed for this route, redirecting to fallback`);
        router.push(fallbackRoute);
        setAuthorized(false);
      } else {
        console.log(`RouteGuard - User role ${role} authorized for this route`);
        setAuthorized(true);
      }
    }
    // If allowedRoles is undefined, it's a public route
    else {
      console.log('RouteGuard - Public route, access granted');
      setAuthorized(true);
    }
    
    // Allow a small delay for the router to complete any navigation
    setTimeout(() => {
      setLoading(false);
    }, 100);
  };

  // Show loading state while checking authorization
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authorized, return nothing (the redirect will happen in the useEffect)
  if (!authorized) {
    return null;
  }

  // If authorized, render the children
  return <>{children}</>;
}

// Simple loading spinner component
function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
} 