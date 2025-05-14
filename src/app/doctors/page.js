'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function DoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('last_name');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/doctors');
        
        if (!response.ok) {
          throw new Error('Failed to fetch doctors data');
        }
        
        const data = await response.json();
        setDoctors(data.doctors || []);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError(err.message || 'Failed to load doctors data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleSort = (field) => {
    // If clicking the same field, toggle direction
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort the doctors array based on current sort field and direction
  const sortedDoctors = [...doctors].sort((a, b) => {
    // Handle null values
    if (a[sortField] === null) return sortDirection === 'asc' ? 1 : -1;
    if (b[sortField] === null) return sortDirection === 'asc' ? -1 : 1;
    
    // Numeric fields
    if (['doctor_id', 'user_id', 'experience_years', 'consultation_fee'].includes(sortField)) {
      return sortDirection === 'asc' 
        ? a[sortField] - b[sortField] 
        : b[sortField] - a[sortField];
    }
    
    // String fields
    return sortDirection === 'asc'
      ? String(a[sortField]).localeCompare(String(b[sortField]))
      : String(b[sortField]).localeCompare(String(a[sortField]));
  });

  // Helper function to render sort indicator
  const renderSortIndicator = (field) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-400 to-blue-500 px-6 py-4">
            <h1 className="text-white text-center text-2xl font-bold">Doctors Directory</h1>
            <p className="text-white text-center text-sm mt-1">Complete list of clinic doctors</p>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Loading doctors data...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-md">
                <p className="font-medium">Error loading data</p>
                <p>{error}</p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No doctors found in the database.</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-gray-700">Found {doctors.length} doctors</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          scope="col" 
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('first_name')}
                        >
                          First Name {renderSortIndicator('first_name')}
                        </th>
                        <th 
                          scope="col" 
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('last_name')}
                        >
                          Last Name {renderSortIndicator('last_name')}
                        </th>
                        <th 
                          scope="col" 
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('experience_years')}
                        >
                          Experience (Years) {renderSortIndicator('experience_years')}
                        </th>
                        <th 
                          scope="col" 
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('languages_spoken')}
                        >
                          Languages {renderSortIndicator('languages_spoken')}
                        </th>
                        <th 
                          scope="col" 
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Specialty
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedDoctors.map((doctor) => (
                        <tr key={doctor.doctor_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{doctor.first_name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{doctor.last_name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{doctor.experience_years || 'N/A'}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{doctor.languages_spoken || 'N/A'}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {doctor.specialty_name || 'Unknown'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Click on any column header to sort the table by that field.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 