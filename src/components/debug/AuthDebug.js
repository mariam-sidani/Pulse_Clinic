'use client';

import { useState, useEffect } from 'react';
import useUserStore from '@/store/userStore';

export default function AuthDebug() {
  const { user, isLoggedIn, role } = useUserStore();
  const [localStorageData, setLocalStorageData] = useState(null);
  
  useEffect(() => {
    // Get localStorage data
    try {
      const userStorage = localStorage.getItem('user-storage');
      if (userStorage) {
        setLocalStorageData(JSON.parse(userStorage));
      }
    } catch (e) {
      console.error('Error accessing localStorage:', e);
    }
    
    // Log authentication status on mount
    console.log('Auth Debug - Mount:', {
      isLoggedIn,
      role,
      user: user ? {
        id: user.user_id,
        email: user.email,
        role: user.role_id,
        token: user.token ? `${user.token.substring(0, 15)}...` : null,
        tokenLength: user.token?.length || 0
      } : null
    });
    
    // Check authentication status every second
    const interval = setInterval(() => {
      console.log('Auth Debug - Interval check:', {
        isLoggedIn: useUserStore.getState().isLoggedIn,
        role: useUserStore.getState().role,
        user: useUserStore.getState().user ? {
          id: useUserStore.getState().user.user_id,
          email: useUserStore.getState().user.email,
          role: useUserStore.getState().user.role_id,
          hasToken: !!useUserStore.getState().user.token,
          tokenLength: useUserStore.getState().user.token?.length || 0
        } : null
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isLoggedIn, role, user]);
  
  if (!isLoggedIn) {
    return null;
  }
  
  return (
    <div className="fixed bottom-0 right-0 bg-white bg-opacity-80 text-white p-2 text-xs rounded-tl-md z-50" style={{ maxWidth: '300px' }}>
      <div>
        <strong>Auth Status:</strong> {isLoggedIn ? 'Logged In' : 'Not Logged In'}
      </div>
      <div>
        <strong>Role:</strong> {role === 1 ? 'Admin' : role === 2 ? 'Doctor' : role === 3 ? 'Patient' : 'Unknown'}
      </div>
      {user && (
        <>
          <div>
            <strong>User ID:</strong> {user.user_id}
          </div>
          <div>
            <strong>Email:</strong> {user.email}
          </div>
          <div>
            <strong>Token:</strong> {user.token ? 'Present' : 'Missing'}
          </div>
        </>
      )}
    </div>
  );
} 