import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/auth.jsx';
import Forbidden from '../../pages/admin/Forbidden.jsx';

export default function ProtectedRoute({ permission, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="admin-loading">جارٍ فحص الجلسة...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (permission && !user.permissions.includes(permission)) {
    return <Forbidden permission={permission} />;
  }

  return children;
}