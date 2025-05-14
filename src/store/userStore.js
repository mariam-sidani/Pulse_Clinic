import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      role: null,
      isLoading: false,
      error: null,
      
      setUser: (userData) => {
        console.log('Setting user data:', userData);
        
        if (!userData) {
          console.log('Setting user to null (logout)');
          set({ 
            user: null, 
            isLoggedIn: false,
            role: null 
          });
          return;
        }
        
        // Ensure the role is properly set as a number
        const userRole = userData.role_id !== undefined ? Number(userData.role_id) : null;
        console.log('Normalized role value:', userRole);
        
        // Ensure firstName, lastName are set consistently
        const normalizedUser = {
          ...userData,
          // Normalize property names if they exist in different formats
          firstName: userData.firstName || userData.first_name || '',
          lastName: userData.lastName || userData.last_name || '',
          // Ensure role_id is a number
          role_id: userRole
        };
        
        console.log('Normalized user data:', normalizedUser);
        
        set({ 
          user: normalizedUser, 
          isLoggedIn: true,
          role: userRole
        });
      },
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Login attempt for:', email);
          
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include' // Include cookies in the request
          });
          
          const data = await response.json();
          console.log('Login API response status:', response.status);
          
          if (!response.ok) {
            throw new Error(data.message || 'Failed to login');
          }
          
          if (!data.user) {
            console.error('Login response missing user data');
            throw new Error('Invalid response format from server');
          }
          
          // Ensure the token exists
          if (!data.user.token) {
            console.error('Login response missing token in user data');
            throw new Error('Authentication token not provided by server');
          }
          
          // Log token information
          console.log('Login token info:', {
            exists: !!data.user.token,
            length: data.user.token?.length || 0,
            preview: data.user.token ? `${data.user.token.substring(0, 15)}...` : null
          });
          
          // Ensure the role is properly set as a number
          const userRole = data.user.role_id !== undefined ? Number(data.user.role_id) : null;
          
          if (userRole === null || userRole === undefined) {
            console.error('Role information missing in user data');
          }
          
          // Ensure consistent property naming
          const userData = {
            ...data.user,
            firstName: data.user.firstName || data.user.first_name || '',
            lastName: data.user.lastName || data.user.last_name || '',
            role_id: userRole
          };
          
          console.log('Login successful, normalized user data:', {
            user_id: userData.user_id,
            email: userData.email,
            role_id: userData.role_id,
            hasToken: !!userData.token
          });
          
          // Set the user data (includes token) and force storage to update immediately
          set({ 
            user: userData, 
            isLoggedIn: true, 
            role: userRole,
            isLoading: false,
            error: null
          });

          // Force a delay before returning to ensure state is saved
          return new Promise(resolve => {
            setTimeout(() => {
              // Double check that the state was saved correctly
              const currentState = useUserStore.getState();
              console.log('Login state verification after timeout:', { 
                isLoggedIn: currentState.isLoggedIn, 
                role: currentState.role,
                hasUser: !!currentState.user,
                hasToken: currentState.user?.token ? true : false
              });
              
              if (!currentState.user || !currentState.user.token) {
                console.error('Token not properly saved in state after login!');
              }
              
              resolve(data);
            }, 1000);
          });
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },
      
      logout: async () => {
        console.log('Logging out user');
        try {
          // Log the current user state before logout
          const currentUser = useUserStore.getState().user;
          console.log('Logout - Current user state:', {
            isLoggedIn: useUserStore.getState().isLoggedIn,
            role: useUserStore.getState().role,
            userId: currentUser?.user_id,
            email: currentUser?.email
          });
          
          // Call the logout API to clear the cookie
          const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include' // Include cookies in the request
          });
          
          if (!response.ok) {
            console.error('Error during logout API call:', response.statusText);
          }
          
          console.log('Logout API call complete, preparing to clear state');
          
          // Clear local state after a short delay to ensure the API call is complete
          setTimeout(() => {
            console.log('Clearing user state now');
            set({ user: null, isLoggedIn: false, role: null });
            
            // Redirect to login page after state is cleared
            setTimeout(() => {
              console.log('Redirecting to login page');
              window.location.href = '/login';
            }, 300);
          }, 500);
        } catch (error) {
          console.error('Logout error:', error);
          // Even if the API call fails, still clear local state and redirect
          set({ user: null, isLoggedIn: false, role: null });
          setTimeout(() => {
            window.location.href = '/login';
          }, 300);
        }
      },
      
      signup: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Failed to sign up');
          }
          
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },
      
      verifyEmail: async (token) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/auth/verify?token=${token}`);
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Failed to verify email');
          }
          
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },
    }),
    {
      name: 'user-storage', // name of the item in storage
      partialize: (state) => ({ user: state.user, isLoggedIn: state.isLoggedIn, role: state.role }),
      // Add a migration to ensure role is a number for existing stored data
      migrate: (persistedState) => {
        console.log('Migrating stored user data');
        const newState = { ...persistedState };
        
        // Fix legacy data: convert role to number if it exists but isn't a number
        if (newState.role !== null && typeof newState.role !== 'number') {
          console.log('Converting role to number:', newState.role);
          newState.role = Number(newState.role);
        }
        
        // Fix user object if it exists
        if (newState.user && newState.user.role_id !== undefined && typeof newState.user.role_id !== 'number') {
          console.log('Converting user.role_id to number:', newState.user.role_id);
          newState.user.role_id = Number(newState.user.role_id);
        }
        
        return newState;
      }
    }
  )
);

export default useUserStore; 