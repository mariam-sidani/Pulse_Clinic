'use client';

import { useState, useEffect } from 'react';
import DoctorAvailabilityForm from '@/components/dashboard/DoctorAvailabilityForm';
import { useRouter } from 'next/navigation';

export default function DoctorAvailabilityPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in and is a doctor
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!storedToken || !storedUser) {
      router.push('/login');
      return;
    }
    
    setToken(storedToken);
    
    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      if (userData.role !== 2) { // Not a doctor
        router.push('/');
        return;
      }
      
      // Fetch doctor's data
      fetchDoctorData(storedToken);
      
      // Fetch available clinics
      fetchClinics(storedToken);
    } catch (err) {
      console.error('Error parsing user data:', err);
      router.push('/login');
    }
  }, [router]);

  const fetchDoctorData = async (token) => {
    try {
      const response = await fetch('/api/doctors/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDoctor(data.doctor);
      } else {
        throw new Error('Failed to fetch doctor data');
      }
    } catch (err) {
      console.error('Error fetching doctor data:', err);
      setError('Could not load doctor information');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClinics = async (token) => {
    try {
      // For simplicity, we'll use a hardcoded clinic ID 1 for Dr. John Doe
      setClinics([{ clinic_id: 1, name: 'Main Clinic' }]);
      setSelectedClinic('1');
    } catch (err) {
      console.error('Error fetching clinics:', err);
      setError('Could not load clinic information');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Manage Your Availability</h1>
      
      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded mb-6">
          {error}
        </div>
      )}
      
      {doctor ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-2xl font-semibold mb-4">Doctor Info</h2>
              <p className="mb-2"><span className="font-medium">Name:</span> Dr. John Doe</p>
              <p className="mb-2"><span className="font-medium">Specialty:</span> General Practitioner</p>
              <p className="mb-2"><span className="font-medium">License:</span> DOC12345</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Select Clinic</h2>
              
              <select 
                value={selectedClinic} 
                onChange={(e) => setSelectedClinic(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">-- Select Clinic --</option>
                {clinics.map(clinic => (
                  <option key={clinic.clinic_id} value={clinic.clinic_id}>{clinic.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="md:col-span-2">
            {selectedClinic ? (
              <DoctorAvailabilityForm 
                doctorId={1} 
                clinicId={parseInt(selectedClinic)}
                token={token}
              />
            ) : (
              <div className="p-6 bg-yellow-50 rounded-lg text-yellow-700">
                Please select a clinic to add availability
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-6 bg-red-100 text-red-800 rounded">
          Could not load doctor information. Please try again later.
        </div>
      )}
    </div>
  );
} 