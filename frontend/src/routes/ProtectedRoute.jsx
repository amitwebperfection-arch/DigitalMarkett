import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function ProtectedRoute({ children, roles = [] }) {
  const { user, token } = useSelector((state) => state.auth);

  if (!token) {
    return ;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return ;
  }

  return children;
}

export default ProtectedRoute;