import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuth, role } = useAuth();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to the correct dashboard for their role
    const roleRoutes = {
      PASSENGER: '/passenger',
      DRIVER: '/driver',
      ADMIN: '/admin',
    };
    return <Navigate to={roleRoutes[role] || '/login'} replace />;
  }

  return children;
}
