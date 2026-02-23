import { useEffect, useState } from 'react';
import { getAllMessagesAdmin } from '../../services/Contact.service';
import toast from 'react-hot-toast';
import {
  Mail, Calendar, User, Search, X,
  ExternalLink, Inbox, ArrowLeft, Star,
  Trash2, RefreshCw, MoreVertical
} from 'lucide-react';

function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [search, setSearch] = useState('');
  const [starred, setStarred] = useState(new Set());

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
    const d = new Date(date);
    const diff = Date.now() - d;
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (days > 0) return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (hrs > 0) return `${hrs}h ago`;
    return `${mins}m ago`;
  };

  const getInitials = (name) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  const avatarColors = [
    'bg-blue-500', 'bg-purple-500', 'bg-green-500',
    'bg-yellow-500', 'bg-red-500', 'bg-pink-500', 'bg-indigo-500'
  ];
  const getAvatarColor = (name) =>
    avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

  const toggleStar = (e, id) => {
    e.stopPropagation();
    setStarred(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (loading) return (
    <div className="flex justify-center items-center h-96">
      <div className="flex flex-col items-center gap-3">
        <div className="spinner" />
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
    <div className="h-[calc(100vh-64px)] bg-white flex flex-col">

      {/* ── Top Toolbar ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-200 bg-white sticky top-0 z-10">
        {selectedMessage && (
          <button
            onClick={() => setSelectedMessage(null)}
            className="lg:hidden p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        {/* Search bar — Gmail rounded style */}
        <div className="relative flex-1 max-w-xl">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search in messages..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-slate-300 focus:shadow-custom-sm transition-all placeholder:text-slate-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={13} />
            </button>
          )}
        </div>

        <button onClick={fetchMessages} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors" title="Refresh">
          <RefreshCw size={15} />
        </button>

        <span className="text-xs text-slate-400 hidden sm:block whitespace-nowrap">
          {filtered.length} / {messages.length}
        </span>
      </div>

      {/* ── Main Two-Panel Layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: Inbox List ── */}
        <div className={`flex flex-col border-r border-slate-200 bg-white overflow-hidden
          ${selectedMessage
            ? 'hidden lg:flex lg:w-[360px] xl:w-[400px] flex-shrink-0'
            : 'w-full lg:w-[360px] xl:w-[400px] flex-shrink-0'
          }`}>

          {/* Label header */}
          <div className="px-4 py-2 flex items-center gap-2 border-b border-slate-100 bg-slate-50">
            <Inbox size={14} className="text-slate-500" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Inbox</span>
            {filtered.length > 0 && (
              <span className="ml-auto text-xs bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                {filtered.length}
              </span>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-custom">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                  <Inbox size={28} className="text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium text-sm">No messages found</p>
                {search && <p className="text-slate-400 text-xs mt-1">Try a different search</p>}
              </div>
            ) : (
              filtered.map((msg) => {
                const isSelected = selectedMessage?._id === msg._id;
                const isStarred = starred.has(msg._id);
                return (
                  <button
                    key={msg._id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`w-full text-left px-3 py-3 border-b border-slate-100 transition-colors group relative
                      ${isSelected
                        ? 'bg-blue-50'
                        : 'hover:bg-slate-50'
                      }`}
                  >
                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r" />
                    )}

                    <div className="flex items-center gap-3 pl-1">
                      {/* Avatar circle */}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${getAvatarColor(msg.name)}`}>
                        {getInitials(msg.name)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className={`text-sm  ${isSelected ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                            {msg.name}
                          </span>
                          <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(msg.createdAt)}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-600 truncate">{msg.subject}</p>
                        <p className="text-xs text-slate-400  mt-0.5">{msg.message}</p>
                      </div>

                      {/* Star button — shows on hover */}
                      <button
                        onClick={(e) => toggleStar(e, msg._id)}
                        className="flex-shrink-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Star
                          size={13}
                          className={isStarred ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}
                        />
                      </button>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right: Detail View ── */}
        <div className={`flex-1 flex-col overflow-hidden bg-white
          ${selectedMessage ? 'flex' : 'hidden lg:flex'}`}>

          {!selectedMessage ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8 bg-gradient-to-br from-slate-50 via-white to-slate-100">
              <div className="w-20 h-20 bg-white rounded-full shadow-custom-md flex items-center justify-center mb-4">
                <Mail size={34} className="text-slate-200" />
              </div>
              <p className="text-slate-600 font-semibold text-lg">Nothing selected</p>
              <p className="text-slate-400 text-sm mt-1">Pick a message from the inbox to read it here</p>
            </div>
          ) : (
            <>
              {/* Detail toolbar */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-slate-200 bg-white">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="lg:hidden p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors mr-1"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors" title="Delete">
                    <Trash2 size={15} />
                  </button>
                  <button
                    onClick={(e) => toggleStar(e, selectedMessage._id)}
                    className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <Star
                      size={15}
                      className={starred.has(selectedMessage._id) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-400'}
                    />
                  </button>
                </div>
                <button className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                  <MoreVertical size={15} />
                </button>
              </div>

              {/* Scrollable email content */}
              <div className="flex-1 overflow-y-auto scrollbar-custom">
                <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6">

                  {/* Subject heading */}
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 leading-snug">
                    {selectedMessage.subject}
                  </h1>

                  {/* Sender meta row */}
                  <div className="flex items-start justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${getAvatarColor(selectedMessage.name)}`}>
                        {getInitials(selectedMessage.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{selectedMessage.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          <span className="text-slate-400">from </span>
                          <a
                            href={`mailto:${selectedMessage.email}`}
                            className="text-blue-500 hover:underline"
                          >
                            {selectedMessage.email}
                          </a>
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 flex-shrink-0 text-right">
                      {new Date(selectedMessage.createdAt).toLocaleString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* Meta pills */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">
                      <User size={10} /> {selectedMessage.name}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">
                      <Mail size={10} /> {selectedMessage.email}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">
                      <Calendar size={10} /> {new Date(selectedMessage.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>

              {/* Reply bar */}
              <div className="border-t border-slate-200 px-4 sm:px-6 py-3.5 bg-white">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                  <a
                    href={`https://mail.google.com/mail/?view=cm&to=${selectedMessage.email}&su=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center gap-2 !px-5 !py-2 !text-sm !rounded-full !shadow-none hover:!shadow-custom-sm"
                  >
                    <Mail size={14} /> Reply via Gmail
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedMessage.email);
                      toast.success('Email copied!');
                    }}
                    className="btn-secondary flex items-center gap-2 !px-4 !py-2 !text-sm !rounded-full !shadow-none"
                  >
                    <ExternalLink size={14} /> Copy Email
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminContactMessages;