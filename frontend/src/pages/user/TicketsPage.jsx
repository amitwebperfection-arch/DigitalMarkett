import { Link } from 'react-router-dom';
import TicketList from '../../components/common/TicketList';

function TicketsPage() {
  return (
    <div className="container-custom py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">My Support Tickets</h1>
        <Link
          to="/user/tickets/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create New Ticket
        </Link>
      </div>

      <TicketList />
    </div>
  );
}

export default TicketsPage;
