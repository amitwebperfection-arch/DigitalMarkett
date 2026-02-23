import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ticketService } from '../../services/ticket.service';
import { MessageCircle, Plus } from 'lucide-react';

const STATUS_CONFIG_USER = {
  open:          { color: 'bg-green-500',  text: 'text-green-400',  label: 'Open' },
  'in-progress': { color: 'bg-yellow-500', text: 'text-yellow-400', label: 'In Progress' },
  resolved:      { color: 'bg-blue-500',   text: 'text-blue-400',   label: 'Resolved' },
  closed:        { color: 'bg-gray-500',   text: 'text-gray-400',   label: 'Closed' },
};

const formatDateUser = (date) => {
  const d = new Date(date);
  const diff = new Date() - d;
  if (diff < 86400000) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  if (diff < 604800000) return d.toLocaleDateString('en-IN', { weekday: 'short' });
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    ticketService.getMyTickets()
      .then(res => setTickets(res.tickets || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#111b21]">
      <div className="bg-[#202c33] px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-white text-xl font-semibold">Support</h1>
          <p className="text-[#8696a0] text-xs mt-0.5">{tickets.length} tickets</p>
        </div>
        <button onClick={() => navigate('/user/tickets/new')}
          className="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center shadow-lg hover:bg-[#06cf9c] transition">
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-16 h-16 bg-[#202c33] rounded-full flex items-center justify-center">
            <MessageCircle size={32} className="text-[#8696a0]" />
          </div>
          <p className="text-[#8696a0] text-sm">No tickets yet</p>
          <button onClick={() => navigate('/user/tickets/new')}
            className="bg-[#00a884] text-white text-sm px-6 py-2 rounded-full hover:bg-[#06cf9c] transition">
            Create First Ticket
          </button>
        </div>
      ) : (
        <div className="divide-y divide-[#2a3942]">
          {tickets.map(ticket => {
            const status = STATUS_CONFIG_USER[ticket.status] || STATUS_CONFIG_USER.open;
            const lastMsg = ticket.messages?.[ticket.messages.length - 1];
            return (
              <Link key={ticket._id} to={`/user/tickets/${ticket._id}`}>
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#202c33] transition">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00a884] to-[#006d57] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {ticket.subject?.[0]?.toUpperCase() || 'T'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-white font-medium text-sm truncate">{ticket.subject}</p>
                      <span className="text-[#8696a0] text-xs flex-shrink-0 ml-2">{formatDateUser(ticket.updatedAt || ticket.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[#8696a0] text-xs truncate">{lastMsg?.message || ticket.category}</p>
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
      )}
    </div>
  );
}

export default TicketsPage;