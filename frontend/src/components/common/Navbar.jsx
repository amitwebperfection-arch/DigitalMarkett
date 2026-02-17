import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, User, LogOut, Package, Menu, X } from 'lucide-react';
import { logout } from '../../features/auth/auth.slice';
import { useState, useRef, useEffect } from 'react';
import Search from './Search';

function Navbar() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    setOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  // Close dropdown on outside click
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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container-custom flex items-center justify-between h-16">

        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-primary-600">
          Digital Marketplace
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">

          <Link to="/products" className="text-gray-700 hover:text-primary-600">
            Products
          </Link>

          {/* Search Component */}
          <Search />

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

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4">
          {/* Mobile Search */}
          <Search />
          
          {isAuthenticated && (
            <Link to="/cart" className="relative">
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {items.length}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-700"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="container-custom py-4 space-y-3">
            
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-gray-700 hover:text-primary-600"
            >
              Products
            </Link>

            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 text-gray-700 hover:text-primary-600"
                  >
                    <Package className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}

                {user?.role === 'vendor' && (
                  <Link
                    to="/vendor"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 text-gray-700 hover:text-primary-600"
                  >
                    <Package className="w-4 h-4" />
                    Vendor Dashboard
                  </Link>
                )}

                {user?.role === 'user' && (
                  <Link
                    to="/user"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 text-gray-700 hover:text-primary-600"
                  >
                    <Package className="w-4 h-4" />
                    My Account
                  </Link>
                )}

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center gap-2 py-2 text-gray-700">
                    <User className="w-4 h-4" />
                    <span>{user?.name}</span>
                    <span className="text-xs text-gray-500 capitalize">({user?.role})</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 py-2 text-red-600 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-gray-700 hover:text-primary-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-primary-600 font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;