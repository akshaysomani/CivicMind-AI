import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedProps {
  children: React.ReactNode;
  allowedRoles?: ('Citizen' | 'Government' | 'NGO' | 'Admin')[];
}

export const Protected: React.FC<ProtectedProps> = ({ children, allowedRoles }) => {
  const { currentUser, isAuthenticated, isAuthenticating } = useAuth();
  const location = useLocation();

  if (isAuthenticating) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Authenticating user session..." />
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    // Redirect to login page and save the source location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect to appropriate dashboard based on user's role if unauthorized
    const roleRoutes = {
      Citizen: '/dashboard/citizen',
      Government: '/dashboard/government',
      NGO: '/dashboard/ngo',
      Admin: '/dashboard/admin',
    };
    const targetRoute = roleRoutes[currentUser.role] || '/';
    return <Navigate to={targetRoute} replace />;
  }

  return <>{children}</>;
};
export default Protected;
