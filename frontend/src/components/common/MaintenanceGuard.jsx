import { useSettings } from '../../context/SettingsContext';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

// ─── Yeh routes kabhi bhi block nahi honge ────────────────────
const PUBLIC_AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

export default function MaintenanceGuard({ children }) {
  const { maintenanceMode, maintenanceMessage, siteName, siteLogo } = useSettings();
  const location = useLocation();

  // Redux se user lo
  const user  = useSelector(state => state.auth?.user);

  // ── FIX 1: Auth routes ko kabhi block mat karo ─────────────────
  // Admin /login par jaayega, wahan se login karega, phir /admin redirect hoga
  const isAuthRoute = PUBLIC_AUTH_PATHS.some(path =>
    location.pathname.startsWith(path)
  );

  // ── FIX 2: Token hai lekin Redux abhi load nahi hua (race condition) ──
  // localStorage mein token hai but user state abhi set nahi — wait karo
  const isAuthLoading = !!localStorage.getItem('token') && !user;

  // Admin hai — kabhi block mat karo
  const isAdmin = user?.role === 'admin';

  // ── Show maintenance page only when ALL conditions true ────────
  // maintenance ON  +  not admin  +  not loading  +  not auth route
  if (maintenanceMode && !isAdmin && !isAuthLoading && !isAuthRoute) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
        {/* Logo */}
        {siteLogo
          ? <img src={siteLogo} alt={siteName} className="h-12 mb-8 opacity-80" />
          : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600
              flex items-center justify-center mb-8 shadow-lg">
              <span className="text-white font-bold text-xl">
                {(siteName || 'M').charAt(0)}
              </span>
            </div>
          )
        }

        {/* Spinning gear */}
        <div className="w-20 h-20 rounded-full bg-blue-600/10 border border-blue-500/20
          flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-blue-400"
            style={{ animation: 'spin 3s linear infinite' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0
                002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0
                001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0
                00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0
                00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0
                00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0
                00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0
                001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          {siteName || 'My Store'} is Under Maintenance
        </h1>

        <p className="text-gray-400 text-center max-w-md text-sm leading-relaxed">
          {maintenanceMessage || 'We\'ll be back soon!'}
        </p>

        {/* ✅ Admin login link — maintenance mein bhi accessible */}
        <a
          href="/login"
          className="mt-8 text-xs text-gray-600 hover:text-gray-400 transition-colors underline"
        >
          Admin? Sign in here
        </a>

        <div className="mt-4 flex gap-2 items-center">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs text-gray-500">We'll be back shortly</span>
        </div>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return children;
}