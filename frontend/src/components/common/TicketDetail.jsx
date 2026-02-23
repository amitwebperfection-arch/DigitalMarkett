import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketService } from '../../services/ticket.service';
import { useSelector } from 'react-redux';
import { ArrowLeft, Send } from 'lucide-react';

const formatTime = (date) =>
  new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

const formatDateLabel = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

const groupMessagesByDate = (messages) => {
  const groups = {};
  messages.forEach((msg) => {
    const label = formatDateLabel(msg.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(msg);
  });
  return groups;
};

const STATUS_COLORS = {
  open: 'bg-green-500',
  'in-progress': 'bg-yellow-500',
  resolved: 'bg-blue-500',
  closed: 'bg-gray-400',
};
const STATUS_LABELS = {
  open: 'Open',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  const [ticket, setTicket] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => { fetchTicket(); }, [id]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  const fetchTicket = async () => {
    try {
      const res = await ticketService.getTicketById(id);
      setTicket(res.ticket);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      const res = await ticketService.replyToTicket(id, message.trim());
      setTicket(res.ticket);
      setMessage('');
      textareaRef.current?.focus();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await ticketService.updateTicketStatus(id, newStatus);
      setTicket(res.ticket);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReply();
    }
  };

  const isSentByMe = (msg) => {
    const senderId = msg.sender?._id || msg.sender;
    return String(senderId) === String(user?._id || user?.id);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#0b141a]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#8696a0] text-sm">Loading conversation...</p>
      </div>
    </div>
  );

  if (!ticket) return (
    <div className="flex items-center justify-center h-screen bg-[#0b141a]">
      <p className="text-[#8696a0]">Ticket not found</p>
    </div>
  );

  const grouped = groupMessagesByDate(ticket.messages || []);
  const isClosed = ticket.status === 'closed' || ticket.status === 'resolved';

  return (
    <div className="flex flex-col h-screen bg-[#0b141a]">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#202c33] shadow-lg z-10 flex-shrink-0">
        <button onClick={() => navigate(-1)}
          className="text-[#aebac1] hover:text-white transition p-1 rounded-full hover:bg-white/10">
          <ArrowLeft size={20} />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00a884] to-[#006d57] flex items-center justify-center text-white font-bold text-base flex-shrink-0">
          {ticket.user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{ticket.user?.name || 'User'}</p>
          <p className="text-[#8696a0] text-xs truncate">{ticket.subject}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 bg-[#111b21] px-3 py-1 rounded-full">
            <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[ticket.status]}`} />
            <span className="text-xs text-[#aebac1]">{STATUS_LABELS[ticket.status]}</span>
          </div>
          {isAdmin && (
            <select value={ticket.status} onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updatingStatus}
              className="bg-[#2a3942] text-[#aebac1] text-xs border border-[#3b4a54] rounded-lg px-2 py-1.5 outline-none cursor-pointer hover:bg-[#3b4a54] transition">
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          )}
        </div>
      </div>

      {/* Info Bar */}
      <div className="bg-[#1a2c34] px-4 py-2 flex items-center gap-4 text-xs text-[#8696a0] border-b border-[#2a3942] flex-shrink-0 flex-wrap">
        <span>📁 <span className="text-[#aebac1] capitalize">{ticket.category}</span></span>
        <span>🎯 <span className="text-[#aebac1] capitalize">{ticket.priority}</span></span>
        <span>📅 <span className="text-[#aebac1]">{new Date(ticket.createdAt).toLocaleDateString('en-IN')}</span></span>
        <span>💬 <span className="text-[#aebac1]">{ticket.messages?.length || 0} messages</span></span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: '#0b141a',
        }}>
        {Object.entries(grouped).map(([dateLabel, msgs]) => (
          <div key={dateLabel}>
            <div className="flex justify-center my-4">
              <span className="bg-[#182229] text-[#8696a0] text-xs px-4 py-1 rounded-full shadow">{dateLabel}</span>
            </div>
            <div className="space-y-1">
              {msgs.map((msg, idx) => {
                const sentByMe = isSentByMe(msg);
                const senderName = msg.sender?.name || 'Unknown';
                const senderRole = msg.sender?.role;
                return (
                  <div key={msg._id || idx}
                    className={`flex items-end gap-2 ${sentByMe ? 'justify-end' : 'justify-start'}`}>
                    {!sentByMe && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mb-1">
                        {senderName[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className={`max-w-[72%] md:max-w-[55%] rounded-lg px-3 pt-2 pb-1.5 shadow-md
                      ${sentByMe ? 'bg-[#005c4b] rounded-tr-none' : 'bg-[#202c33] rounded-tl-none'}`}>
                      {!sentByMe && (
                        <p className={`text-xs font-semibold mb-0.5 ${senderRole === 'admin' ? 'text-[#00a884]' : 'text-[#53bdeb]'}`}>
                          {senderName}{senderRole === 'admin' ? ' (Support)' : senderRole === 'vendor' ? ' (Vendor)' : ''}
                        </p>
                      )}
                      <p className="text-[#e9edef] text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <span className="text-[10px] text-[#8696a0]">{formatTime(msg.createdAt)}</span>
                        {sentByMe && (
                          <svg className="w-3.5 h-3.5 text-[#53bdeb]" fill="currentColor" viewBox="0 0 16 15">
                            <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.674a.366.366 0 0 0-.515.009l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.512z"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {isClosed ? (
        <div className="bg-[#202c33] px-4 py-4 text-center flex-shrink-0">
          <p className="text-[#8696a0] text-sm">
            This ticket is <span className="text-[#aebac1] font-medium capitalize">{ticket.status}</span>. No further replies allowed.
          </p>
          {isAdmin && (
            <button onClick={() => handleStatusChange('open')} className="mt-2 text-[#00a884] text-sm hover:underline">
              Reopen ticket
            </button>
          )}
        </div>
      ) : (
        <div className="bg-[#202c33] px-3 py-3 flex items-end gap-2 flex-shrink-0">
          <div className="flex-1 bg-[#2a3942] rounded-3xl px-4 py-2.5 min-h-[44px] flex items-center">
            <textarea ref={textareaRef} value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message" rows={1}
              className="w-full bg-transparent text-[#e9edef] text-sm placeholder-[#8696a0] outline-none resize-none leading-relaxed"
              style={{ maxHeight: '120px' }} />
          </div>
          <button onClick={handleReply} disabled={sending || !message.trim()}
            className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200
              ${message.trim() ? 'bg-[#00a884] hover:bg-[#06cf9c] shadow-lg' : 'bg-[#2a3942]'}`}>
            {sending
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Send size={18} className={message.trim() ? 'text-white' : 'text-[#8696a0]'} />}
          </button>
        </div>
      )}
    </div>
  );
}

export default TicketDetail;