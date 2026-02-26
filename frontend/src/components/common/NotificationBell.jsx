// frontend/src/components/common/NotificationBell.jsx

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  fetchUnreadCount,
  fetchNotifications,
  markOneRead,
  markAllRead,
  toggleDropdown,
  closeDropdown,
} from '../../features/notifications/notification.slice';

// ─── Notification icon by type ────────────────────────────────────────────────
const typeIcon = {
  new_order:        '🛒',
  new_vendor_apply: '🏪',
  new_ticket:       '🎫',
  new_contact:      '📩',
  product_approved: '✅',
  product_rejected: '❌',
  payout_processed: '💰',
  payout_rejected:  '⚠️',
  ticket_reply:     '💬',
  order_completed:  '📦',
  order_status:     '🔄',
  ticket_reply_user:'💬',
};

export default function NotificationBell() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const dropdownRef = useRef(null);

  const { items, unreadCount, loading, dropdownOpen } = useSelector(
    (state) => state.notifications
  );
  const { user } = useSelector((state) => state.auth);

  // ── Poll unread count every 30s ───────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    dispatch(fetchUnreadCount());
    const interval = setInterval(() => dispatch(fetchUnreadCount()), 30_000);
    return () => clearInterval(interval);
  }, [dispatch, user]);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        dispatch(closeDropdown());
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dispatch]);

  // ── Open dropdown → fetch notifications ──────────────────────────────────
  const handleBellClick = () => {
    dispatch(toggleDropdown());
    if (!dropdownOpen) {
      dispatch(fetchNotifications({ page: 1, limit: 15 }));
    }
  };

  // ── Click on a notification ───────────────────────────────────────────────
  const handleNotifClick = (notif) => {
    if (!notif.isRead) dispatch(markOneRead(notif._id));
    dispatch(closeDropdown());
    if (notif.link) navigate(notif.link);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        className="relative text-gray-600 hover:text-gray-900 transition"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute right-0 top-8 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => dispatch(markAllRead())}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="py-10 text-center text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              items.map((notif) => (
                <button
                  key={notif._id}
                  onClick={() => handleNotifClick(notif)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition flex gap-3 items-start ${
                    !notif.isRead ? 'bg-blue-50/50' : ''
                  }`}
                >
                  {/* Icon */}
                  <span className="text-xl flex-shrink-0 mt-0.5">
                    {typeIcon[notif.type] || '🔔'}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!notif.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50">
              <button
                onClick={() => {
                  dispatch(closeDropdown());
                  // Role-based "see all" link
                  const role = user?.role;
                  if (role === 'admin')  navigate('/admin');
                  else if (role === 'vendor') navigate('/vendor');
                  else navigate('/user');
                }}
                className="w-full text-center text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                View all →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}