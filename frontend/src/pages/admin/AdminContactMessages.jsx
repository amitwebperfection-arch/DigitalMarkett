import { useEffect, useState } from 'react';
import { getAllMessagesAdmin } from '../../services/Contact.service';
import MobileCard from '../../components/common/MobileCard';
import DetailModal, { DetailRow } from '../../components/common/DetailModal';
import { Mail, Calendar, User } from 'lucide-react';

function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  const handleCardClick = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
  };

  // Mobile card fields
  const mobileFields = [
    { 
      label: 'Name', 
      key: 'name',
      render: (msg) => (
        <div className="flex items-center gap-2">
          <User size={14} className="text-gray-400" />
          <span className="font-medium">{msg.name}</span>
        </div>
      )
    },
    { 
      label: 'Email', 
      key: 'email',
      render: (msg) => (
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-gray-400" />
          <span className="text-xs">{msg.email}</span>
        </div>
      )
    },
    { 
      label: 'Subject', 
      key: 'subject',
      render: (msg) => (
        <span className="font-medium text-blue-600">{msg.subject}</span>
      )
    },
    { 
      label: 'Date', 
      key: 'createdAt',
      render: (msg) => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-xs">{new Date(msg.createdAt).toLocaleDateString()}</span>
        </div>
      )
    }
  ];

  if (loading) return (
    <div className="flex justify-center items-center h-96">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (error) return <p className="text-red-600 p-4">{error}</p>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container-custom py-4 sm:py-6 md:py-8 px-2 sm:px-4">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Contact Messages</h2>
          <p className="text-sm text-gray-600 mt-1">{messages.length} total messages</p>
        </div>

        {/* Mobile View - Cards */}
        <div className="lg:hidden space-y-3">
          {messages.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-500">No messages found.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <MobileCard
                key={msg._id}
                item={msg}
                fields={mobileFields}
                onCardClick={handleCardClick}
              />
            ))
          )}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden lg:block bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left border-b border-gray-200">
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase">Name</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase">Subject</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase">Message</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No messages found.
                  </td>
                </tr>
              ) : (
                messages.map((msg) => (
                  <tr 
                    key={msg._id} 
                    className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleCardClick(msg)}
                  >
                    <td className="p-3 text-sm">{msg.name}</td>
                    <td className="p-3 text-sm">{msg.email}</td>
                    <td className="p-3 text-sm font-medium text-blue-600">{msg.subject}</td>
                    <td className="p-3 text-sm max-w-xs truncate">{msg.message}</td>
                    <td className="p-3 text-sm text-gray-600">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Detail Modal */}
        <DetailModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Message Details"
        >
          {selectedMessage && (
            <>
              <DetailRow 
                label="Name" 
                value={selectedMessage.name} 
              />
              <DetailRow 
                label="Email" 
                value={
                  <a 
                    href={`mailto:${selectedMessage.email}`} 
                    className="text-blue-600 hover:underline"
                  >
                    {selectedMessage.email}
                  </a>
                } 
              />
              <DetailRow 
                label="Subject" 
                value={selectedMessage.subject} 
              />
              <DetailRow 
                label="Message" 
                value={
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                } 
              />
              <DetailRow 
                label="Date Received" 
                value={new Date(selectedMessage.createdAt).toLocaleString()} 
              />
            </>
          )}
        </DetailModal>
      </div>
    </div>
  );
}

export default AdminContactMessages;