import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinkClasses = (path) => `
    relative px-4 py-2 text-base font-medium transition-all duration-200
    ${isActive(path) 
      ? 'text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:transform after:scale-x-100 after:transition-transform'
      : 'text-gray-700 hover:text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:transform after:scale-x-0 hover:after:scale-x-100 after:transition-transform'
    }
  `;

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-lg py-1' : 'bg-white/90 backdrop-blur-md py-2'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3 group">
              <img 
                src="/images/logo.svg" 
                alt="Aryana Cafe" 
                className="h-12 w-auto transform transition-transform duration-200 group-hover:scale-105" 
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent transform transition-transform duration-200 group-hover:scale-105">
                Aryana Cafe
              </span>
            </Link>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link to="/menu" className={navLinkClasses('/menu')}>Menu</Link>
              <Link to="/reservations" className={navLinkClasses('/reservations')}>Reservations</Link>
              {isAuthenticated && (
                <Link to="/orders" className={navLinkClasses('/orders')}>Orders</Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin" className={navLinkClasses('/admin')}>Admin</Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-6">
            {isAuthenticated ? (
              <div className="flex items-center space-x-6">
                <Link to="/cart" className="relative group">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-700 group-hover:text-primary transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transform scale-100 transition-transform duration-200 group-hover:scale-110">
                    0
                  </span>
                </Link>
                <Link to="/profile" className="group">
                  <div className="relative p-1 rounded-full hover:bg-gray-100 transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-700 group-hover:text-primary transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="bg-red-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform hover:scale-105"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transform hover:scale-105"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2.5 rounded-lg text-gray-700 hover:text-primary hover:bg-gray-100 transition-all duration-200"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden absolute w-full bg-white border-b border-gray-200 shadow-lg">
          <div className="pt-3 pb-4 space-y-2 px-4">
            <Link
              to="/menu"
              className={`block px-4 py-2.5 text-base font-medium rounded-lg transition-all duration-200 ${
                isActive('/menu') ? 'text-primary bg-primary/5 font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
              }`}
            >
              Menu
            </Link>
            <Link
              to="/reservations"
              className={`block px-4 py-2.5 text-base font-medium rounded-lg transition-all duration-200 ${
                isActive('/reservations') ? 'text-primary bg-primary/5 font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
              }`}
            >
              Reservations
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/orders"
                  className={`block px-4 py-2.5 text-base font-medium rounded-lg transition-all duration-200 ${
                    isActive('/orders') ? 'text-primary bg-primary/5 font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                  }`}
                >
                  Orders
                </Link>
                <Link
                  to="/profile"
                  className={`block px-4 py-2.5 text-base font-medium rounded-lg transition-all duration-200 ${
                    isActive('/profile') ? 'text-primary bg-primary/5 font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                  }`}
                >
                  Profile
                </Link>
                <Link
                  to="/cart"
                  className={`block px-4 py-2.5 text-base font-medium rounded-lg transition-all duration-200 ${
                    isActive('/cart') ? 'text-primary bg-primary/5 font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                  }`}
                >
                  Cart
                </Link>
              </>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`block px-4 py-2.5 text-base font-medium rounded-lg transition-all duration-200 ${
                  isActive('/admin') ? 'text-primary bg-primary/5 font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                }`}
              >
                Admin
              </Link>
            )}
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2.5 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`block px-4 py-2.5 text-base font-medium rounded-lg transition-all duration-200 ${
                    isActive('/login') ? 'text-primary bg-primary/5 font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`block px-4 py-2.5 text-base font-medium rounded-lg transition-all duration-200 ${
                    isActive('/register') ? 'text-primary bg-primary/5 font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                  }`}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 