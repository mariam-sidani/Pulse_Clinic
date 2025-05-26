'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import useUserStore from '@/store/userStore';
import { RouteGuard } from '@/components/wrappers';

export default function EditUser({ params }) {
  const router = useRouter();
  const { user } = useUserStore();
  const { userId } = use(params);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    gender: '',
    phone: '',
    is_active: true,
    license_number: '',
    specialty_id: '',
    qualifications: '',
    experience_years: ''
  });
  
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    // Load user details and specialties
    fetchUserDetails();
    fetchSpecialties();
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
      
      // Populate form data with user details
      setFormData({
        email: data.user.email || '',
        password: '',
        confirmPassword: '',
        firstName: data.user.first_name || '',
        lastName: data.user.last_name || '',
        gender: data.user.gender || '',
        phone: data.user.phone || '',
        is_active: data.user.is_active === 1,
        license_number: data.user.license_number || '',
        specialty_id: data.user.specialty_id || '',
        qualifications: data.user.qualifications || '',
        experience_years: data.user.experience_years || ''
      });
    } catch (err) {
      setError(err.message || 'An error occurred while fetching user details');
      console.error('Error fetching user details:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSpecialties = async () => {
    try {
      const response = await fetch('/api/specialties');
      
      if (!response.ok) {
        throw new Error('Failed to fetch specialties');
      }
      
      const data = await response.json();
      setSpecialties(data.specialties);
    } catch (err) {
      console.error('Error fetching specialties:', err);
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const validateForm = () => {
    // Reset error
    setError(null);
    
    // Check if required fields are filled
    if (!formData.email) {
      setError('Email is required');
      return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Check if passwords match when changing password
    if (formData.password) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      
      // Check password strength (minimum 8 characters)
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return false;
      }
    }
    
    // Validate doctor-specific fields if user is a doctor
    if (userData && userData.role_id === 2) {
      if (!formData.firstName || !formData.lastName) {
        setError('First name and last name are required for doctors');
        return false;
      }
      
      if (!formData.specialty_id) {
        setError('Specialty is required for doctors');
        return false;
      }
      
      if (!formData.license_number) {
        setError('License number is required for doctors');
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      const token = user?.token;
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Prepare data for API
      const updateData = {
        user_id: userId,
        email: formData.email,
        is_active: formData.is_active
      };
      
      // Only include password if it's being changed
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      // Include role-specific fields
      if (userData.role_id === 2) { // Doctor
        updateData.firstName = formData.firstName;
        updateData.lastName = formData.lastName;
        updateData.gender = formData.gender;
        updateData.phone = formData.phone;
        updateData.license_number = formData.license_number;
        updateData.specialty_id = formData.specialty_id;
        updateData.qualifications = formData.qualifications;
        updateData.experience_years = formData.experience_years;
      }
      
      // Send update request
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }
      
      // Show success message
      setSuccess(true);
      
      // Redirect after a delay
      setTimeout(() => {
        router.push(`/admin/users/${userId}`);
      }, 2000);
    } catch (err) {
      setError(err.message || 'An error occurred while updating user');
      console.error('Error updating user:', err);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <RouteGuard allowedRoles={[1]}>
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Edit User</h1>
            <button
              onClick={() => router.back()}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-300 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 text-sm">
              User updated successfully! Redirecting...
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : userData ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Account Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                      Email Address*
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="is_active" className="flex items-center text-gray-700 text-sm font-bold mb-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      Active Account
                    </label>
                    <p className="text-gray-500 text-xs mt-1">Inactive accounts cannot log in</p>
                  </div>
                </div>
                
                <h3 className="text-md font-semibold text-gray-700 mb-2">Change Password (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                      minLength={8}
                    />
                    <p className="text-gray-500 text-xs mt-1">Leave blank to keep current password</p>
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Doctor-specific fields */}
              {userData.role_id === 2 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Doctor Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="firstName" className="block text-gray-700 text-sm font-bold mb-2">
                        First Name*
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="lastName" className="block text-gray-700 text-sm font-bold mb-2">
                        Last Name*
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="gender" className="block text-gray-700 text-sm font-bold mb-2">
                        Gender
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">
                        Phone
                      </label>
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="license_number" className="block text-gray-700 text-sm font-bold mb-2">
                        License Number*
                      </label>
                      <input
                        type="text"
                        id="license_number"
                        name="license_number"
                        value={formData.license_number}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="specialty_id" className="block text-gray-700 text-sm font-bold mb-2">
                        Specialty*
                      </label>
                      <select
                        id="specialty_id"
                        name="specialty_id"
                        value={formData.specialty_id}
                        onChange={handleChange}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Specialty</option>
                        {specialties.map(specialty => (
                          <option key={specialty.specialty_id} value={specialty.specialty_id}>
                            {specialty.specialty_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="experience_years" className="block text-gray-700 text-sm font-bold mb-2">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        id="experience_years"
                        name="experience_years"
                        value={formData.experience_years}
                        onChange={handleChange}
                        min="0"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="qualifications" className="block text-gray-700 text-sm font-bold mb-2">
                        Qualifications
                      </label>
                      <input
                        type="text"
                        id="qualifications"
                        name="qualifications"
                        value={formData.qualifications}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-300"
                  disabled={saving}
                >
                  {saving ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
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