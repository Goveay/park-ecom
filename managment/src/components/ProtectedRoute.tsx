import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hasPagePermission, hasActionPermission } from '../utils/permissions';
import { Shield } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPage?: keyof import('../types').UserPermissions['pages'];
  requiredAction?: keyof import('../types').UserPermissions['actions'];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPage, 
  requiredAction 
}) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Sayfa erişim kontrolü
  if (requiredPage && !hasPagePermission(user, requiredPage)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Erişim Reddedildi</h2>
          <p className="text-gray-500">Bu sayfaya erişmek için gerekli yetkiye sahip değilsiniz.</p>
        </div>
      </div>
    );
  }

  // İşlem yetkisi kontrolü (eğer gerekliyse)
  if (requiredAction && !hasActionPermission(user, requiredAction)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Yetki Yetersiz</h2>
          <p className="text-gray-500">Bu işlemi gerçekleştirmek için gerekli yetkiye sahip değilsiniz.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
