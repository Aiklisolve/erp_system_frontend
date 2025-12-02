import { Navigate, useLocation } from 'react-router-dom';
import { useRolePermissions } from '../features/auth/hooks/useRolePermissions';
import { useAuth } from '../features/auth/hooks/useAuth';
import type { ModuleRoute } from '../features/auth/data/rolePermissions';

type ModuleProtectedRouteProps = {
  children: React.ReactNode;
};

export function ModuleProtectedRoute({ children }: ModuleProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { canAccess } = useRolePermissions();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--text-primary)]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-text-secondary">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const currentRoute = location.pathname as ModuleRoute;
  
  if (!canAccess(currentRoute)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

