import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, User } from 'lucide-react';
import { logout } from '../../features/auth/auth.slice';

function Header({ title }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
      
      {/* Page Title */}
      <h1 className="text-xl font-semibold text-gray-800">
        {title}
      </h1>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        
        {/* Notification */}
        <button className="relative text-gray-600 hover:text-gray-900">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-gray-800">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="text-gray-600 hover:text-red-600 transition"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

export default Header;
