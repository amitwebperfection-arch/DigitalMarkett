import { Link, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { X } from 'lucide-react';

function Sidebar({ menuItems, isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-50
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        
        {/* Logo / Title */}
        <div className="h-16 flex items-center justify-between px-4 border-b shrink-0">
        <Link to="/" className="text-xl font-bold text-primary-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 320" width="180" height="74">
            <path d="M60 60 L60 260 L140 260 Q220 260 220 160 Q220 60 140 60 Z
                      M110 100 L135 100 Q170 100 170 160 Q170 220 135 220 L110 220 Z" fill="#1AADDC"/>
            <rect x="155" y="208" width="22" height="32" fill="#1a1a1a"/>
            <rect x="182" y="185" width="22" height="55" fill="#1a1a1a"/>
            <rect x="209" y="150" width="22" height="90" fill="#1a1a1a"/>
            <line x1="155" y1="208" x2="231" y2="150" stroke="#1a1a1a" stroke-width="8" stroke-linecap="round"/>
            <text x="255" y="170" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="110" fill="#1AADDC" letter-spacing="2">DIGITAL</text>
            <text x="255" y="255" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="72" fill="#1a1a1a" letter-spacing="4">MARKETING</text>
          </svg>
        </Link>
          
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
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
                onClick={onClose}
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
    </>
  );
}

export default Sidebar;