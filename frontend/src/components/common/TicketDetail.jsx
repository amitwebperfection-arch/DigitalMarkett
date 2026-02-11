import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ticketService } from '../../services/ticket.service';

function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchTicket() {
      try {
        const res = await ticketService.getTicketById(id);
        setTicket(res.ticket);
      } catch (err) {
        console.error(err);
      }
    }
    fetchTicket();
  }, [id]);

  const handleReply = async () => {
    if (!message) return;
    try {
      const res = await ticketService.replyToTicket(id, message);
      setTicket(res.ticket);
      setMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  if (!ticket) return <div>Loading...</div>;

  return (
    <div className="space-y-4 p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold">{ticket.subject}</h2>
      <p className="text-sm text-gray-500">Category: {ticket.category}</p>
      <div className="space-y-2 mt-4">
        {ticket.messages.map(msg => (
          <div key={msg._id} className="p-2 border rounded">
            <p className="text-sm font-medium">{msg.sender.name}</p>
            <p>{msg.message}</p>
            <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</span>
          </div>
        ))}
      </div>
      <textarea 
        value={message} 
        onChange={(e) => setMessage(e.target.value)} 
        placeholder="Write your reply..." 
        className="input h-24"
      />
      <button onClick={handleReply} className="btn-primary">Reply</button>
    </div>
  );
}

export default TicketDetail;
