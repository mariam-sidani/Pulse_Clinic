'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useUserStore from '@/store/userStore';

export default function AdminUserList() {
  const router = useRouter();
  const { user, logout } = useUserStore();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    console.log('AdminUserList - Component mounted, user state:', { 
      isLoggedIn: !!user,
      role: user?.role_id,
      hasToken: !!user?.token,
      tokenLength: user?.token?.length
    });
    fetchUsers();
  }, [currentPage, selectedRole, searchQuery]);

  const fetchUsers = async () => {
    try {
      console.log('AdminUserList - Fetching users');
      setLoading(true);
      
      // Get token directly from local storage to ensure we have the freshest token
      let token = null;
      try {
        const userStoreData = JSON.parse(localStorage.getItem('user-storage'));
        token = userStoreData?.state?.user?.token;
        
        // Check if token exists and log information about it
        if (!token) {
          console.error('AdminUserList - No token found in localStorage');
        } else {
          console.log('AdminUserList - Token from localStorage:', {
            exists: !!token,
            length: token?.length || 0,
            partial: token ? `${token.substring(0, 10)}...` : null
          });
        }
      } catch (e) {
        console.error('AdminUserList - Error accessing localStorage:', e);
      }
      
      // Fallback to user from store if needed
      if (!token && user?.token) {
        token = user.token;
        console.log('AdminUserList - Using token from store:', { 
          exists: !!token, 
          length: token?.length || 0
        });
      }
      
      if (!token) {
        console.error('AdminUserList - No authentication token found');
        setError('Authentication token not found. Please log in again.');
        // Trigger logout to redirect to login page
        logout();
        return;
      }
      
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10
      });
      
      if (selectedRole) {
        queryParams.append('role', selectedRole);
      }
      
      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }
      
      const url = `/api/admin/users?${queryParams.toString()}`;
      console.log('AdminUserList - Fetching from URL:', url);
      
      // Create headers with authorization
      const headers = new Headers({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });
      
      console.log('AdminUserList - Request headers:', {
        authorization: headers.get('Authorization') ? 'Bearer token set' : 'No auth header',
        contentType: headers.get('Content-Type'),
        accept: headers.get('Accept')
      });
      
      const response = await fetch(url, { 
        headers,
        // Add credentials to include cookies
        credentials: 'include'
      });
      
      console.log('AdminUserList - Response received:', { 
        status: response.status,
        statusText: response.statusText,
        headers: {
          contentType: response.headers.get('Content-Type')
        }
      });
      
      if (!response.ok) {
        console.error('AdminUserList - Error response:', { 
          status: response.status,
          statusText: response.statusText 
        });
        
        let errorMessage = 'Failed to fetch users';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('AdminUserList - Error data:', errorData);
          
          // If unauthorized, trigger logout
          if (response.status === 401) {
            setError('Your session has expired. Please log in again.');
            logout();
            return;
          }
        } catch (e) {
          console.error('AdminUserList - Could not parse error response:', e);
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('AdminUserList - Successful response:', { 
        userCount: data.users?.length || 0,
        pagination: data.pagination
      });
      
      setUsers(data.users || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching users');
      console.error('AdminUserList - Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleRoleFilterChange = (e) => {
    setSelectedRole(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const getRoleBadgeClass = (roleId) => {
    switch (roleId) {
      case 1:
        return 'bg-red-100 text-red-800';
      case 2:
        return 'bg-blue-100 text-blue-800';
      case 3:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleName = (roleId) => {
    switch (roleId) {
      case 1:
        return 'Admin';
      case 2:
        return 'Doctor';
      case 3:
        return 'Patient';
      default:
        return 'Unknown';
    }
  };

  const handleViewUser = (userId) => {
    router.push(`/admin/users/${userId}`);
  };

  const handleEditUser = (userId) => {
    router.push(`/admin/users/${userId}/edit`);
  };

  const confirmDeleteUser = (userId) => {
    setDeleteUserId(userId);
  };

  const cancelDeleteUser = () => {
    setDeleteUserId(null);
    setDeleteError(null);
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    
    try {
      setIsDeleting(true);
      setDeleteError(null);
      
      const token = user?.token;
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch(`/api/admin/users?userId=${deleteUserId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'  // Include cookies
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }
      
      fetchUsers();
      
      setDeleteUserId(null);
    } catch (err) {
      setDeleteError(err.message || 'An error occurred while deleting user');
      console.error('Error deleting user:', err);
      
      // If unauthorized, trigger logout
      if (err.message && err.message.includes('Unauthorized')) {
        setError('Your session has expired. Please log in again.');
        setTimeout(() => {
          logout();
        }, 2000);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
        <div className="flex flex-col md:flex-row gap-2">
          <select
            value={selectedRole}
            onChange={handleRoleFilterChange}
            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="1">Admin</option>
            <option value="2">Doctor</option>
            <option value="3">Patient</option>
          </select>
          
          <form onSubmit={handleSearchSubmit} className="w-full md:w-auto flex">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search users..."
              className="shadow appearance-none border rounded-l py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-300"
            >
              Search
            </button>
          </form>
        </div>
        
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <div className="mt-2 text-sm">
            <p>Debug information:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>User logged in: {user ? 'Yes' : 'No'}</li>
              <li>User role: {user?.role_id === 1 ? 'Admin' : user?.role_id === 2 ? 'Doctor' : user?.role_id === 3 ? 'Patient' : 'Unknown'}</li>
              <li>Has token: {user?.token ? 'Yes' : 'No'}</li>
              <li>Token length: {user?.token?.length || 0} characters</li>
            </ul>
            <p className="mt-2">
              Try <button onClick={logout} className="text-red-600 underline">logging out</button> and logging back in.
            </p>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto mb-6 rounded-md shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-0">
                          <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(user.role_id)}`}>
                        {getRoleName(user.role_id)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleViewUser(user.user_id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleEditUser(user.user_id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => confirmDeleteUser(user.user_id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {users.length === 0 && !loading && (
            <div className="text-center py-4 text-gray-500">
              No users found matching your criteria.
            </div>
          )}
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${currentPage === page ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
      
      {/* Delete confirmation modal */}
      {deleteUserId && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                      Delete User
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this user? This action cannot be undone.
                      </p>
                      {deleteError && (
                        <p className="mt-2 text-sm text-red-600">
                          {deleteError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={cancelDeleteUser}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 