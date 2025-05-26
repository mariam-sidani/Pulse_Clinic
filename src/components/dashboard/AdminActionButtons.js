'use client';

import { useRouter } from 'next/navigation';

export default function AdminActionButtons() {
  const router = useRouter();

  const handleRegisterDoctor = () => {
    router.push('/admin/register-doctor');
  };

  const handleAddAdmin = () => {
    router.push('/admin/add-admin');
  };

  const handleRegisterPatient = () => {
    router.push('/admin/register-patient');
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={handleRegisterDoctor}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors duration-300"
      >
        Register New Doctor
      </button>
      <button
        onClick={handleAddAdmin}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-300"
      >
        Add New Admin
      </button>
      <button
        onClick={handleRegisterPatient}
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors duration-300"
      >
        Register New Patient
      </button>
    </div>
  );
} 