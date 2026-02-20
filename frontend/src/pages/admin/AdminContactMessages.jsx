import { useEffect, useState } from 'react';
import { getAllMessagesAdmin } from '../../services/Contact.service';
import toast from 'react-hot-toast';
import { Mail, Calendar, User, MessageSquare, Search, X, ExternalLink, Inbox } from 'lucide-react';

function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getAllMessagesAdmin();
      setMessages(data.messages || []);
    } catch (err) {
      setError('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const filtered = messages.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (days > 0) return `${days}d ago`;
    if (hrs > 0) return `${hrs}h ago`;
    return `${mins}m ago`;
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  const colors = ['bg-violet-100 text-violet-700', 'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700'];
  const getColor = (name) => colors[(name?.charCodeAt(0) || 0) % colors.length];

  if (loading) return (
    <div className="flex justify-center items-center h-96">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-[3px] border-slate-200 border-t-slate-700 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading messages...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-96">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-sm">
        <p className="text-red-600 font-medium">{error}</p>
        <button onClick={fetchMessages} className="mt-3 text-sm text-red-500 underline">Try again</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Contact Messages
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {messages.length} total · {filtered.length} shown
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, email, subject..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 placeholder:text-slate-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Two-panel layout on desktop */}
        <div className="flex gap-5 h-[calc(100vh-180px)] min-h-[500px]">

          {/* Left — Message List */}
          <div className={`flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300
            ${selectedMessage ? 'hidden lg:flex lg:w-80 xl:w-96 flex-shrink-0' : 'w-full lg:w-80 xl:w-96 flex-shrink-0'}`}>

            {/* List header */}
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Inbox
              </p>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center px-6">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                    <Inbox size={24} className="text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium text-sm">No messages found</p>
                  {search && <p className="text-slate-400 text-xs mt-1">Try a different search</p>}
                </div>
              ) : (
                filtered.map((msg) => (
                  <button
                    key={msg._id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`w-full text-left px-4 py-3.5 transition-colors hover:bg-slate-50
                      ${selectedMessage?._id === msg._id ? 'bg-slate-100 border-l-2 border-l-slate-700' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${getColor(msg.name)}`}>
                        {getInitials(msg.name)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-800 truncate">{msg.name}</p>
                          <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(msg.createdAt)}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-600 truncate mt-0.5">{msg.subject}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{msg.message}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right — Detail Panel */}
          <div className={`flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden
            ${!selectedMessage ? 'hidden lg:flex' : 'flex'} flex-col`}>

            {!selectedMessage ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <MessageSquare size={28} className="text-slate-300" />
                </div>
                <p className="text-slate-600 font-semibold">Select a message</p>
                <p className="text-slate-400 text-sm mt-1">Click any message to read it here</p>
              </div>
            ) : (
              <>
                {/* Detail header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${getColor(selectedMessage.name)}`}>
                      {getInitials(selectedMessage.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{selectedMessage.name}</p>
                      <a href={`mailto:${selectedMessage.email}`}
                        className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                        {selectedMessage.email}
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 hidden sm:block">
                      {new Date(selectedMessage.createdAt).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                    {/* Mobile back button */}
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="lg:hidden p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Message body */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  {/* Subject */}
                  <h2 className="text-xl font-bold text-slate-900 mb-6">
                    {selectedMessage.subject}
                  </h2>

                  {/* Info pills */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">
                      <User size={11} />
                      {selectedMessage.name}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">
                      <Mail size={11} />
                      {selectedMessage.email}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">
                      <Calendar size={11} />
                      {new Date(selectedMessage.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-100 mb-6" />

                  {/* Message content */}
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3">
                  
                  {/* Gmail mein open karo */}
                  <a
                    href={`https://mail.google.com/mail/?view=cm&to=${selectedMessage.email}&su=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <Mail size={14} />
                    Reply via Gmail
                  </a>

                  {/* Copy email */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedMessage.email);
                      toast.success('Email copied!');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <ExternalLink size={14} />
                    Copy Email
                  </button>

                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminContactMessages;