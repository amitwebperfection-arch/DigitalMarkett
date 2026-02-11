import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, User, LogOut, Package } from 'lucide-react';
import { logout } from '../../features/auth/auth.slice';
import { useState, useRef, useEffect } from 'react';

function Navbar() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    setOpen(false);
    navigate('/');
  };

  // 🔒 close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container-custom flex items-center justify-between h-16">

        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-primary-600">
          Digital Marketplace
        </Link>

        {/* Menu */}
        <div className="flex items-center gap-6">

          <Link to="/products" className="text-gray-700 hover:text-primary-600">
            Products
          </Link>

          {isAuthenticated ? (
            <>
              {/* Cart */}
              <Link to="/cart" className="relative">
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                {items.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {items.length}
                  </span>
                )}
              </Link>

              {/* User Dropdown (CLICK) */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 text-gray-700 hover:text-primary-600"
                >
                  <User className="w-5 h-5" />
                  <span>{user?.name}</span>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">

                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                      >
                        <Package className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}

                    {user?.role === 'vendor' && (
                      <Link
                        to="/vendor"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                      >
                        <Package className="w-4 h-4" />
                        Vendor Dashboard
                      </Link>
                    )}

                    {user?.role === 'user' && (
                      <Link
                        to="/user"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                      >
                        <Package className="w-4 h-4" />
                        My Account
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-primary-600">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
