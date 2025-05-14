'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useUserStore from '@/store/userStore';

export function RouteGuard({ children, allowedRoles = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, role, user } = useUserStore();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('RouteGuard - Auth state for path:', pathname, { 
      isLoggedIn, 
      userRole: role, 
      allowedRoles,
      email: user?.email 
    });

    // Check if the route requires authentication
    authCheck();
  }, [pathname, isLoggedIn, role, user]);

  const authCheck = () => {
    // Set loading state while checking
    setLoading(true);
    
    // Path is login page
    if (pathname === '/login') {
      if (isLoggedIn) {
        console.log('RouteGuard - User is already logged in, redirecting to home');
        router.push('/');
        setAuthorized(false);
      } else {
        console.log('RouteGuard - Login page access allowed for non-logged in user');
        setAuthorized(true);
      }
    } 
    // Path is protected by role
    else if (allowedRoles.length > 0) {
      if (!isLoggedIn) {
        console.log('RouteGuard - User not logged in, redirecting to login');
        router.push('/login');
        setAuthorized(false);
      } else if (!allowedRoles.includes(role)) {
        console.log(`RouteGuard - User role ${role} not allowed for this page, redirecting to home`);
        router.push('/');
        setAuthorized(false);
      } else {
        console.log(`RouteGuard - User role ${role} authorized for this page`);
        setAuthorized(true);
      }
    } 
    // Public page
    else {
      console.log('RouteGuard - Public page, access allowed');
      setAuthorized(true);
    }
    
    // Allow a small delay for the router to complete the navigation
    setTimeout(() => {
      setLoading(false);
    }, 50);
  };

  return (
    <>
      {loading ? (
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : authorized ? (
        children
      ) : null}
    </>
  );
} 