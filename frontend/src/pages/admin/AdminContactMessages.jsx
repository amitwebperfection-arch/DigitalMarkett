import { useEffect, useState } from 'react';
import { getAllMessagesAdmin } from '../../services/Contact.service';

function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getAllMessagesAdmin();
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading messages...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white p-4 rounded-xl shadow overflow-x-auto container-custom py-8 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Contact Messages</h2>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Subject</th>
            <th className="p-2 border">Message</th>
            <th className="p-2 border">Date</th>
          </tr>
        </thead>
        <tbody>
          {messages.length === 0 ? (
            <tr>
              <td colSpan="5" className="p-4 text-center text-gray-500">
                No messages found.
              </td>
            </tr>
          ) : (
            messages.map((msg) => (
              <tr key={msg._id} className="border-t hover:bg-gray-50">
                <td className="p-2">{msg.name}</td>
                <td className="p-2">{msg.email}</td>
                <td className="p-2">{msg.subject}</td>
                <td className="p-2 max-w-xs truncate">{msg.message}</td>
                <td className="p-2">{new Date(msg.createdAt).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminContactMessages;
