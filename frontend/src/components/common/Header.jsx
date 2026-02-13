import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, User, Menu } from 'lucide-react';
import { logout } from '../../features/auth/auth.slice';

function Header({ title, onMenuClick }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="h-16 bg-white border-b px-4 md:px-6 flex items-center justify-between">
      
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-600 hover:text-gray-900"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page Title */}
        <h1 className="text-lg md:text-xl font-semibold text-gray-800">
          {title}
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 md:gap-6">
        
        {/* Notification - Hidden on small mobile */}
        <button className="hidden sm:block relative text-gray-600 hover:text-gray-900">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User Info - Adaptive */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-9 md:h-9 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div className="hidden sm:block leading-tight">
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