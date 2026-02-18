import { useEffect, useState } from 'react';
import { ticketService } from '../../services/ticket.service';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useSelector } from 'react-redux';

const STATUS_CONFIG = {
  open:          { color: 'bg-green-500',  text: 'text-green-400',  label: 'Open' },
  'in-progress': { color: 'bg-yellow-500', text: 'text-yellow-400', label: 'In Progress' },
  resolved:      { color: 'bg-blue-500',   text: 'text-blue-400',   label: 'Resolved' },
  closed:        { color: 'bg-gray-500',   text: 'text-gray-400',   label: 'Closed' },
};

const formatDate = (date) => {
  const d = new Date(date);
  const today = new Date();
  const diff = today - d;
  if (diff < 86400000) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  if (diff < 604800000) return d.toLocaleDateString('en-IN', { weekday: 'short' });
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// role ke hisaab se link decide karo
const getTicketLink = (role, id) => {
  if (role === 'admin') return `/admin/tickets/${id}`;
  if (role === 'vendor') return `/vendor/tickets/${id}`;
  return `/user/tickets/${id}`;
};

function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetch = user?.role === 'admin'
      ? ticketService.getAllTickets()
      : ticketService.getMyTickets();

    fetch
      .then(res => setTickets(res.tickets || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.role]);

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (tickets.length === 0) return (
    <div className="flex flex-col items-center justify-center h-48 gap-3">
      <MessageCircle size={36} className="text-[#8696a0]" />
      <p className="text-[#8696a0] text-sm">No tickets found</p>
    </div>
  );

  return (
    <div className="divide-y divide-[#2a3942]">
      {tickets.map(ticket => {
        const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
        const lastMsg = ticket.messages?.[ticket.messages.length - 1];
        const avatarLetter = user?.role === 'admin'
          ? (ticket.user?.name?.[0]?.toUpperCase() || 'U')
          : (ticket.subject?.[0]?.toUpperCase() || 'T');

        return (
          <Link key={ticket._id} to={getTicketLink(user?.role, ticket._id)}>
            <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#202c33] transition cursor-pointer">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00a884] to-[#006d57] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {avatarLetter}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-white font-medium text-sm truncate">
                    {user?.role === 'admin' ? (ticket.user?.name || 'Unknown') : ticket.subject}
                  </p>
                  <span className="text-[#8696a0] text-xs flex-shrink-0 ml-2">
                    {formatDate(ticket.updatedAt || ticket.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[#8696a0] text-xs truncate">
                    {user?.role === 'admin'
                      ? ticket.subject
                      : (lastMsg?.message || ticket.category)}
                  </p>
                  <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                    <span className={`w-2 h-2 rounded-full ${status.color}`} />
                    <span className={`text-xs ${status.text}`}>{status.label}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default TicketList;