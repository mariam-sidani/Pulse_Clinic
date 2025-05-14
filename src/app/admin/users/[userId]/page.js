'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import useUserStore from '@/store/userStore';
import { RouteGuard } from '@/components/wrappers';

export default function UserDetails({ params }) {
  const router = useRouter();
  const { user } = useUserStore();
  const { userId } = params;
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Load user details
    fetchUserDetails();
  }, [userId]);
  
  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const token = user?.token;
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
      
      const data = await response.json();
      setUserData(data.user);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching user details');
      console.error('Error fetching user details:', err);
    } finally {
      setLoading(false);
    }
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
  
  const handleEdit = () => {
    router.push(`/admin/users/${userId}/edit`);
  };
  
  return (
    <RouteGuard allowedRoles={[1]}>
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">User Details</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-300 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              {userData && (
                <button
                  onClick={handleEdit}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 transition-colors duration-300 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit
                </button>
              )}
            </div>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-sm">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : userData ? (
            <div>
              {/* User profile picture section (if applicable) */}
              <div className="flex justify-center mb-6">
                {userData.profile_picture ? (
                  <img
                    src={userData.profile_picture}
                    alt={userData.full_name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-4xl border-4 border-gray-300">
                    {userData.first_name ? userData.first_name.charAt(0).toUpperCase() : ''}
                    {userData.last_name ? userData.last_name.charAt(0).toUpperCase() : ''}
                  </div>
                )}
              </div>
              
              {/* User basic info */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">
                  {userData.full_name || userData.email}
                </h2>
                <div className="flex justify-center mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeClass(userData.role_id)}`}>
                    {userData.role}
                  </span>
                </div>
                <div className="flex justify-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${userData.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {userData.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${userData.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {userData.is_verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>
              
              {/* User details in grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500 text-sm">Email:</span>
                      <p className="text-gray-800">{userData.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">User ID:</span>
                      <p className="text-gray-800">{userData.user_id}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Created On:</span>
                      <p className="text-gray-800">{new Date(userData.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    {userData.first_name && (
                      <div>
                        <span className="text-gray-500 text-sm">First Name:</span>
                        <p className="text-gray-800">{userData.first_name}</p>
                      </div>
                    )}
                    {userData.last_name && (
                      <div>
                        <span className="text-gray-500 text-sm">Last Name:</span>
                        <p className="text-gray-800">{userData.last_name}</p>
                      </div>
                    )}
                    {userData.gender && (
                      <div>
                        <span className="text-gray-500 text-sm">Gender:</span>
                        <p className="text-gray-800">{userData.gender}</p>
                      </div>
                    )}
                    {userData.phone && (
                      <div>
                        <span className="text-gray-500 text-sm">Phone:</span>
                        <p className="text-gray-800">{userData.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Doctor-specific information */}
              {userData.role_id === 2 && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Doctor Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      {userData.license_number && (
                        <div>
                          <span className="text-gray-500 text-sm">License Number:</span>
                          <p className="text-gray-800">{userData.license_number}</p>
                        </div>
                      )}
                      {userData.specialty_name && (
                        <div>
                          <span className="text-gray-500 text-sm">Specialty:</span>
                          <p className="text-gray-800">{userData.specialty_name}</p>
                        </div>
                      )}
                      {userData.experience_years && (
                        <div>
                          <span className="text-gray-500 text-sm">Years of Experience:</span>
                          <p className="text-gray-800">{userData.experience_years}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      {userData.qualifications && (
                        <div>
                          <span className="text-gray-500 text-sm">Qualifications:</span>
                          <p className="text-gray-800">{userData.qualifications}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              User not found
            </div>
          )}
        </div>
      </main>
      <Footer />
    </RouteGuard>
  );
} 