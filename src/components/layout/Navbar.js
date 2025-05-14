'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RiMenu3Line, RiCloseLine } from 'react-icons/ri';
import useUserStore from '@/store/userStore';
import { getItemFromStorage } from '@/utils/localStorage';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoggedIn, user, role, logout } = useUserStore();
  const [currentRole, setCurrentRole] = useState(null);
  const pathname = usePathname();

  // Close menu when changing route
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Ensure we always have the current role
  useEffect(() => {
    console.log('Navbar - Role info:', { 
      storeRole: role, 
      userRole: user?.role_id,
      isLoggedIn 
    });

    if (role !== null) {
      setCurrentRole(role);
    } else if (user?.role_id) {
      setCurrentRole(user.role_id);
    } else {
      // Try to get from localStorage as backup
      const storedUser = getItemFromStorage('user');
      if (storedUser?.role_id) {
        console.log('Navbar - Retrieved role from localStorage:', storedUser.role_id);
        setCurrentRole(storedUser.role_id);
      }
    }
  }, [role, user, isLoggedIn]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  const isAdmin = currentRole === 1;
  const isDoctor = currentRole === 2;
  const isPatient = currentRole === 3;

  return (
    <nav className="bg-blue-600 shadow-md w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-white font-bold text-xl">Clinic App</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/"
              className={`text-white hover:bg-blue-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/' ? 'bg-blue-600' : ''
              }`}
            >
              Home
            </Link>

            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <>
                    <Link
                      href="/dashboard"
                      className={`text-white hover:bg-blue-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium ${
                        pathname.startsWith('/admin') ? 'bg-blue-600' : ''
                      }`}
                    >
                      Admin Dashboard
                    </Link>
                  </>
                )}

                {isDoctor && (
                  <>
                    <Link
                      href="/doctor/appointments"
                      className={`text-white hover:bg-blue-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium ${
                        pathname.startsWith('/doctor') ? 'bg-blue-600' : ''
                      }`}
                    >
                      My Appointments
                    </Link>
                  </>
                )}

                {isPatient && (
                  <>
                    <Link
                      href="/patient/book"
                      className={`text-white hover:bg-blue-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium ${
                        pathname === '/patient/book' ? 'bg-blue-600' : ''
                      }`}
                    >
                      Book Appointment
                    </Link>
                    <Link
                      href="/patient/appointments"
                      className={`text-white hover:bg-blue-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium ${
                        pathname === '/patient/appointments' ? 'bg-blue-600' : ''
                      }`}
                    >
                      My Appointments
                    </Link>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className="text-white hover:bg-blue-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`text-white hover:bg-blue-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/login' ? 'bg-blue-600' : ''
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className={`text-white hover:bg-blue-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/register' ? 'bg-blue-600' : ''
                  }`}
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-blue-600 focus:outline-none"
            >
              {menuOpen ? (
                <RiCloseLine className="block h-6 w-6" />
              ) : (
                <RiMenu3Line className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${menuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            href="/"
            className={`block text-white hover:bg-blue-600 hover:text-white px-3 py-2 rounded-md text-base font-medium ${
              pathname === '/' ? 'bg-blue-600' : ''
            }`}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>

          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link
                  href="/dashboard"
                  className={`block text-white hover:bg-blue-600 hover:text-white px-3 py-2 rounded-md text-base font-medium ${
                    pathname.startsWith('/admin') ? 'bg-blue-600' : ''
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}

              {isDoctor && (
                <Link
                  href="/doctor/appointments"
                  className={`block text-white hover:bg-blue-600 hover:text-white px-3 py-2 rounded-md text-base font-medium ${
                    pathname.startsWith('/doctor') ? 'bg-blue-600' : ''
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  My Appointments
                </Link>
              )}

              {isPatient && (
                <>
                  <Link
                    href="/patient/book"
                    className={`block text-white hover:bg-blue-600 hover:text-white px-3 py-2 rounded-md text-base font-medium ${
                      pathname === '/patient/book' ? 'bg-blue-600' : ''
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Book Appointment
                  </Link>
                  <Link
                    href="/patient/appointments"
                    className={`block text-white hover:bg-blue-600 hover:text-white px-3 py-2 rounded-md text-base font-medium ${
                      pathname === 'patient/appointments' ? 'bg-blue-600' : ''
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    My Appointments
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="block w-full text-left text-white hover:bg-blue-600 hover:text-white px-3 py-2 rounded-md text-base font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`block text-white hover:bg-blue-600 hover:text-white px-3 py-2 rounded-md text-base font-medium ${
                  pathname === '/login' ? 'bg-blue-600' : ''
                }`}
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className={`block text-white hover:bg-blue-600 hover:text-white px-3 py-2 rounded-md text-base font-medium ${
                  pathname === '/register' ? 'bg-blue-600' : ''
                }`}
                onClick={() => setMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 