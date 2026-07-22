import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth.js';

export default function RequireRole({ roles, children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/movies" replace />;

  return children;
}
