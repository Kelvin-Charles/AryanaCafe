import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, loading, hasRole, user, checkAuth } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    hasRequiredRole: false
  });

  useEffect(() => {
    let isMounted = true;

    const verifyAuth = async () => {
      try {
        setIsChecking(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log('No token found in protected route, redirecting to login');
          if (isMounted) {
            setAuthState({ isAuthenticated: false, hasRequiredRole: false });
          }
          return;
        }

        // Only check auth if we're not already authenticated or don't have a user
        if (!isAuthenticated || !user) {
          await checkAuth();
        }
        
        // Update auth state after check
        const hasValidRole = user ? hasRole(requiredRole) : false;
        console.log('Protected route auth state:', {
          path: location.pathname,
          isAuthenticated,
          userExists: !!user,
          requiredRole,
          hasValidRole,
          userRole: user?.role
        });

        if (isMounted) {
          setAuthState({
            isAuthenticated: isAuthenticated && !!user,
            hasRequiredRole: hasValidRole
          });
        }
      } catch (error) {
        console.error('Error verifying auth:', error);
        if (isMounted) {
          setAuthState({ isAuthenticated: false, hasRequiredRole: false });
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, [checkAuth, hasRole, isAuthenticated, requiredRole, user, location.pathname]);

  // Show loading state while checking
  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!authState.isAuthenticated) {
    console.log('Not authenticated, redirecting to login from:', location.pathname);
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Redirect to home if authenticated but doesn't have required role
  if (requiredRole && !authState.hasRequiredRole) {
    console.log('Missing required role, redirecting to home. User role:', user?.role, 'Required role:', requiredRole);
    return <Navigate to="/" replace />;
  }

  // If we get here, we're authenticated and have the required role
  return children;
};

export default ProtectedRoute; 