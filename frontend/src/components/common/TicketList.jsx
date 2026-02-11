import { useEffect, useState } from 'react';
import { ticketService } from '../../services/ticket.service';
import { Link } from 'react-router-dom';

function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTickets() {
      try {
        const res = await ticketService.getMyTickets();
        setTickets(res.tickets);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTickets();
  }, []);

  if (loading) return <div>Loading tickets...</div>;

  return (
    <div className="space-y-4">
      {tickets.length === 0 && <p>No tickets found.</p>}
      {tickets.map(ticket => (
        <Link key={ticket._id} to={`/user/tickets/${ticket._id}`}>
          <div className="p-4 bg-white shadow rounded flex justify-between">
            <div>
              <h3 className="font-semibold">{ticket.subject}</h3>
              <p className="text-sm text-gray-500">{ticket.category}</p>
            </div>
            <span className={`px-2 py-1 rounded ${ticket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
              {ticket.status}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default TicketList;
