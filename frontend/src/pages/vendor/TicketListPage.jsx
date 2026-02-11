import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketService } from '../../services/ticket.service';

function VendorTicketListPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTickets() {
      try {
        const res = await ticketService.getVendorTickets(); // Vendor API
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
    <div className="container-custom py-8">
      <h1 className="text-2xl font-semibold mb-4">Vendor Support Tickets</h1>
      {tickets.length === 0 && <p>No tickets found.</p>}

      <div className="space-y-4">
        {tickets.map(ticket => (
          <Link
            key={ticket._id}
            to={`/vendor/tickets/${ticket._id}`}
          >
            <div className="p-4 bg-white shadow rounded flex justify-between hover:bg-gray-50">
              <div>
                <h3 className="font-semibold">{ticket.subject}</h3>
                <p className="text-sm text-gray-500">
                  {ticket.user?.name} — {ticket.category}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded ${
                  ticket.status === 'open'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {ticket.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default VendorTicketListPage;
