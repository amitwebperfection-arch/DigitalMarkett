import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function AuthLayout() {
  const { token } = useSelector((state) => state.auth);

  // Agar already logged in hai → home/dashboard bhej do
  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;