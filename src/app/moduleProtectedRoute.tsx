import { Navigate, useLocation } from 'react-router-dom';
import { useRolePermissions } from '../features/auth/hooks/useRolePermissions';
import { useAuth } from '../features/auth/hooks/useAuth';
import type { ModuleRoute } from '../features/auth/data/rolePermissions';
import { LoadingState } from '../components/ui/LoadingState';

type ModuleProtectedRouteProps = {
  children: React.ReactNode;
};

export function ModuleProtectedRoute({ children }: ModuleProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { canAccess } = useRolePermissions();
  const location = useLocation();

  if (loading) {
    return <LoadingState label="Checking permissions..." fullScreen={true} size="md" variant="default" />;
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

