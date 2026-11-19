import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole | UserRole[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-warm-bg text-primary-text px-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-burgundy-200 border-t-burgundy-600 rounded-full animate-spin"></div>
          <div className="absolute w-6 h-6 bg-crimson-600 rounded-full animate-pulse-slow"></div>
        </div>
        <p className="mt-6 text-sm font-medium text-secondary-text tracking-wide">
          Verifying LifeLink AI secure session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles) {
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const hasRole = rolesArray.includes(user.role);

    if (!hasRole) {
      // Redirect to appropriate dashboard based on actual user role
      let targetPath = '/';
      if (user.role === 'donor') {
        targetPath = '/donor/dashboard';
      } else if (user.role === 'hospital') {
        targetPath = '/hospital/dashboard';
      } else if (user.role === 'admin') {
        targetPath = '/admin/dashboard';
      }
      return <Navigate to={targetPath} replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
