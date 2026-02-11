import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function AuthLayout() {
  const { token } = useSelector((state) => state.auth);

  // Agar already logged in hai → home/dashboard bhej do
  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen  items-center justify-center bg-gray-50">
      <Outlet />
    </div>
  );
}

export default AuthLayout;
