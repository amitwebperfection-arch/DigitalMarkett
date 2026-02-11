import { Link, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';

function Sidebar({ menuItems }) {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0">
      
      {/* Logo / Title */}
      <div className="h-16 flex items-center justify-center border-b shrink-0">
        <Link to="/" className="text-xl font-bold text-primary-600">
          Marketplace
        </Link>
      </div>

      {/* Menu */}
      <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
        {menuItems.map((item) => {
          const Icon = Icons[item.icon];
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + '/');

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition
                ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              {Icon && <Icon className="w-5 h-5" />}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}


export default Sidebar;
