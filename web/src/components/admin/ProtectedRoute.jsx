import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/auth.jsx';
import Forbidden from '../../pages/admin/Forbidden.jsx';
import { firstPermittedRoute } from '../../lib/adminNav.js';

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
    // The account signed in without this section's permission: send them to
    // the first screen they are allowed to open instead of an error page.
    const fallback = firstPermittedRoute(user.permissions);
    if (fallback) return <Navigate to={fallback} replace />;
    return <Forbidden permission={permission} />;
  }

  return children;
}
