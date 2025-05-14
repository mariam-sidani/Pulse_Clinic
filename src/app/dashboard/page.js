'use client';

import { useState, useEffect } from 'react';
import useUserStore from '@/store/userStore';

// Admin components
import AdminUserList from '@/components/dashboard/AdminUserList';
import AdminActionButtons from '@/components/dashboard/AdminActionButtons';

// Doctor components
import DoctorAppointments from '@/components/dashboard/DoctorAppointments';

// Patient components
import PatientAppointments from '@/components/dashboard/PatientAppointments';

export default function Dashboard() {
  const { user, isLoggedIn, role } = useUserStore();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    console.log('Dashboard - Auth state:', { 
      isLoggedIn, 
      role, 
      userEmail: user?.email 
    });
    
    // If not logged in, user will be redirected by RouteGuard
    setLoading(false);
  }, [isLoggedIn, role, user]);

  // Role-specific elements
  const renderRoleSpecificContent = () => {
    switch (role) {
      case 1: // Admin
        return (
          <>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
            <AdminActionButtons />
            <AdminUserList />
          </>
        );
        
      case 2: // Doctor
        return (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Doctor Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-blue-800 mb-2">Welcome, {user?.firstName} {user?.lastName}</h2>
                <p className="text-gray-600">Access your appointments and patient records.</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-green-800 mb-2">Today's Appointments</h2>
                <p className="text-gray-600">You have 0 appointments scheduled for today.</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-purple-800 mb-2">Recent Patients</h2>
                <p className="text-gray-600">No recent patient activity.</p>
              </div>
            </div>
            
            <DoctorAppointments />
          </>
        );
        
      case 3: // Patient
        return (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Patient Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-blue-800 mb-2">Welcome, {user?.firstName} {user?.lastName}</h2>
                <p className="text-gray-600">Manage your appointments and health records.</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-green-800 mb-2">Upcoming Appointment</h2>
                <p className="text-gray-600">You have no upcoming appointments.</p>
                <button className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm">
                  Book New Appointment
                </button>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-purple-800 mb-2">Medical Records</h2>
                <p className="text-gray-600">Access your health information and history.</p>
                <button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded text-sm">
                  View Records
                </button>
              </div>
            </div>
            
            <PatientAppointments />
          </>
        );
        
      default:
        return (
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
            <p className="mt-2">You don't have permission to access this dashboard.</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        renderRoleSpecificContent()
      )}
    </div>
  );
} 