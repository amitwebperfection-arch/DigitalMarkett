import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ticketService } from '../../services/ticket.service';

function AdminTicketDetailPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function fetchTicket() {
      try {
        const res = await ticketService.getTicketById(id); // Admin API
        setTicket(res.ticket);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTicket();
  }, [id]);

  const handleReply = async () => {
    if (!reply) return;
    setSending(true);
    try {
      await ticketService.replyTicket(id, reply);
      setTicket(prev => ({
        ...prev,
        messages: [...prev.messages, { sender: 'admin', message: reply }]
      }));
      setReply('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div>Loading ticket...</div>;

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-semibold mb-4">{ticket.subject}</h1>
      <p className="mb-6 text-gray-600">{ticket.category}</p>

      {/* Messages */}
      <div className="space-y-4 mb-6">
        {ticket.messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-4 rounded shadow ${
              msg.sender === 'user' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
            }`}
          >
            <p>{msg.message}</p>
            <small className="text-gray-500">{msg.sender}</small>
          </div>
        ))}
      </div>

      {/* Reply Form */}
      <div className="flex space-x-2">
        <input
          type="text"
          className="flex-1 px-4 py-2 border rounded"
          placeholder="Write your reply..."
          value={reply}
          onChange={e => setReply(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleReply}
          disabled={sending}
        >
          {sending ? 'Sending...' : 'Reply'}
        </button>
      </div>
    </div>
  );
}

export default AdminTicketDetailPage;
