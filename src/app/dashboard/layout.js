'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useUserStore from '@/store/userStore';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { RouteGuard } from '@/components/wrappers';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { isLoggedIn, role } = useUserStore();

  useEffect(() => {
    console.log('Dashboard Layout - Auth state:', { isLoggedIn, role });
  }, [isLoggedIn, role]);

  return (
    <RouteGuard allowedRoles={[1, 2, 3]}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-grow bg-white">
          {children}
        </main>
        <Footer />
      </div>
    </RouteGuard>
  );
} 