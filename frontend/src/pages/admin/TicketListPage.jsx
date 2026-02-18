import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketService } from '../../services/ticket.service';
import { MessageCircle } from 'lucide-react';

const STATUS_CONFIG = {
  open:          { color: 'bg-green-500',  text: 'text-green-400',  label: 'Open' },
  'in-progress': { color: 'bg-yellow-500', text: 'text-yellow-400', label: 'In Progress' },
  resolved:      { color: 'bg-blue-500',   text: 'text-blue-400',   label: 'Resolved' },
  closed:        { color: 'bg-gray-500',   text: 'text-gray-400',   label: 'Closed' },
};

const formatDate = (date) => {
  const d = new Date(date);
  const diff = new Date() - d;
  if (diff < 86400000) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  if (diff < 604800000) return d.toLocaleDateString('en-IN', { weekday: 'short' });
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

function AdminTicketListPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const params = filter !== 'all' ? { status: filter } : {};
    ticketService.getAllTickets(1, 100, params)
      .then(res => setTickets(res.tickets || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="min-h-screen bg-[#111b21]">
      {/* Header */}
      <div className="bg-[#202c33] px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-white text-xl font-semibold">All Tickets</h1>
            <p className="text-[#8696a0] text-xs mt-0.5">{tickets.length} total</p>
          </div>
        </div>
        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['all', 'open', 'in-progress', 'resolved', 'closed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition
                ${filter === f ? 'bg-[#00a884] text-white' : 'bg-[#2a3942] text-[#8696a0] hover:bg-[#3b4a54]'}`}>
              {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <MessageCircle size={40} className="text-[#8696a0]" />
          <p className="text-[#8696a0] text-sm">No tickets found</p>
        </div>
      ) : (
        <div className="divide-y divide-[#2a3942]">
          {tickets.map(ticket => {
            const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
            const lastMsg = ticket.messages?.[ticket.messages.length - 1];
            return (
              <Link key={ticket._id} to={`/admin/tickets/${ticket._id}`}>
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#202c33] transition">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {ticket.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-white font-medium text-sm truncate">{ticket.user?.name || 'Unknown User'}</p>
                      <span className="text-[#8696a0] text-xs flex-shrink-0 ml-2">{formatDate(ticket.updatedAt || ticket.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-[#e9edef] text-xs truncate">{ticket.subject}</p>
                        <p className="text-[#8696a0] text-xs truncate">{lastMsg?.message || ticket.category}</p>
                      </div>
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

export default AdminTicketListPage;