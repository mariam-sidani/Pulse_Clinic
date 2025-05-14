'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import useUserStore from '@/store/userStore';

const Navbar = () => {
  const { user, isLoggedIn, role, logout } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll event to make navbar transparent when scrolled
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Add event listener
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Log navbar auth state for debugging
  console.log('Navbar auth state:', { isLoggedIn, role, user: user?.email, pathname });

  const handleLogout = () => {
    console.log('Logging out user...');
    logout();
    router.push('/');
  };

  const getRoleName = () => {
    switch (role) {
      case 1:
        return 'Admin';
      case 2:
        return 'Doctor';
      case 3:
        return 'Patient';
      default:
        return 'User';
    }
  };

  const isActive = (path) => {
    return pathname === path ? 'text-white font-bold' : 'hover:text-gray-300';
  };

  return (
    <nav className={`z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-gradient-to-r from-blue-500/90 to-blue-600/90 backdrop-blur-sm shadow-lg' 
        : 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-md'
    } text-white p-4`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold flex items-center space-x-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" 
            />
          </svg>
          <Link href="/" className="hover:text-gray-300">Pulse Clinic</Link>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">
          {/* Show Home link only if not logged in or if user is a patient (role 3) */}
          {(!isLoggedIn || role === 3) && (
            <Link href="/" className={`transition duration-200 ${isActive('/')}`}>Home</Link>
          )}
          
          {isLoggedIn && (
            <Link href="/dashboard" className={`transition duration-200 ${isActive('/dashboard')}`}>Dashboard</Link>
          )}
          
          {isLoggedIn && role === 3 && (
            <>
              <Link href="/doctors" className={`transition duration-200 ${isActive('/doctors')}`}>Doctors</Link>
              <Link href="/contact" className={`transition duration-200 ${isActive('/contact')}`}>Contact</Link>
            </>
          )}
          
          {!isLoggedIn && (
            <>
              <Link href="/doctors" className={`transition duration-200 ${isActive('/doctors')}`}>Doctors</Link>
              <Link href="/contact" className={`transition duration-200 ${isActive('/contact')}`}>Contact</Link>
            </>
          )}
        </div>
        
        {/* Auth Buttons - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <div className="text-white hover:text-gray-300 transition duration-200">
                {user?.firstName || user?.first_name ? 
                  `${user.firstName || user.first_name} ${user.lastName || user.last_name}` : 
                  user?.email} <span className="text-xs bg-blue-700 px-2 py-1 rounded-full">{getRoleName()}</span>
              </div>
              <button 
                onClick={handleLogout} 
                className="bg-white text-blue-500 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-white hover:text-gray-300 transition duration-200"
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="bg-white text-blue-500 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition duration-200"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button 
            className="outline-none mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} pt-4`}>
        <div className="flex flex-col space-y-3 px-4">
          {/* Show Home link only if not logged in or if user is a patient (role 3) */}
          {(!isLoggedIn || role === 3) && (
            <Link href="/" className="block py-2 hover:bg-blue-500 px-2 rounded transition duration-200">Home</Link>
          )}
          
          {isLoggedIn && (
            <Link href="/dashboard" className="block py-2 hover:bg-blue-500 px-2 rounded transition duration-200">Dashboard</Link>
          )}
          
          {isLoggedIn && role === 3 && (
            <>
              <Link href="/doctors" className="block py-2 hover:bg-blue-500 px-2 rounded transition duration-200">Doctors</Link>
              <Link href="/contact" className="block py-2 hover:bg-blue-500 px-2 rounded transition duration-200">Contact</Link>
            </>
          )}
          
          {!isLoggedIn && (
            <>
              <Link href="/doctors" className="block py-2 hover:bg-blue-500 px-2 rounded transition duration-200">Doctors</Link>
              <Link href="/contact" className="block py-2 hover:bg-blue-500 px-2 rounded transition duration-200">Contact</Link>
            </>
          )}
          
          {isLoggedIn ? (
            <>
              <div className="block py-2 hover:bg-blue-500 px-2 rounded transition duration-200">
                <span className="text-xs bg-blue-700 px-2 py-1 rounded-full mr-2">{getRoleName()}</span>
                {user?.firstName || user?.first_name ? 
                  `${user.firstName || user.first_name} ${user.lastName || user.last_name}` : 
                  user?.email}
              </div>
              <button 
                onClick={handleLogout} 
                className="text-left block py-2 hover:bg-blue-500 px-2 rounded transition duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block py-2 hover:bg-blue-500 px-2 rounded transition duration-200">Login</Link>
              <Link href="/signup" className="block py-2 hover:bg-blue-500 px-2 rounded transition duration-200">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 