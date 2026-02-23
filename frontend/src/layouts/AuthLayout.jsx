import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function AuthLayout() {
  const { token } = useSelector((state) => state.auth);

  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex  items-center justify-center">
      <div className="w-full ">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;