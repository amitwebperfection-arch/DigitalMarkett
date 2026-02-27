import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

function ProtectedRoute({ children, roles = [] }) {
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation();

  // agar login nahi hai → login page pe redirect
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // agar role allowed nahi hai → home pe redirect
  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;