import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2FA77A] border-t-transparent" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user.role === "superadmin") return <Navigate to="/superadmin" replace />;
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
export default ProtectedRoute;