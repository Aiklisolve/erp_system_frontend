import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { isSessionValid } from '../lib/sessionManager';
import { LoadingState } from '../components/ui/LoadingState';

type ProtectedRouteProps = {
  children?: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState label="Checking session..." fullScreen={true} size="md" variant="default" />;
  }

  // Check if session is valid
  if (!isSessionValid() || !user) {
    return <Navigate to="/login" replace />;
  }

  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
}


