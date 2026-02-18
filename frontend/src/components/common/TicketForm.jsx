import { useState } from 'react';
import { ticketService } from '../../services/ticket.service';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Send } from 'lucide-react';

function TicketForm() {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('technical');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // role ke hisaab se redirect
  const redirectTo = user?.role === 'vendor' ? '/vendor/tickets' : '/user/tickets';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      await ticketService.createTicket({ subject, category, message });
      navigate(redirectTo);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111b21]">
      {/* Header */}
      <div className="bg-[#202c33] px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)}
          className="text-[#aebac1] hover:text-white transition p-1 rounded-full hover:bg-white/10">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-white text-lg font-semibold">New Support Ticket</h1>
          <p className="text-[#8696a0] text-xs">We'll get back to you soon</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-3">

        {/* Subject */}
        <div className="bg-[#202c33] rounded-xl overflow-hidden">
          <div className="px-4 pt-3 pb-1">
            <label className="text-[#00a884] text-[11px] font-semibold uppercase tracking-wider">Subject</label>
          </div>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Brief description of your issue"
            className="w-full bg-transparent text-white text-sm placeholder-[#8696a0] outline-none px-4 pb-3"
            required
          />
        </div>

        {/* Category */}
        <div className="bg-[#202c33] rounded-xl overflow-hidden">
          <div className="px-4 pt-3 pb-1">
            <label className="text-[#00a884] text-[11px] font-semibold uppercase tracking-wider">Category</label>
          </div>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full bg-transparent text-white text-sm outline-none px-4 pb-3 cursor-pointer appearance-none"
          >
            <option value="technical" className="bg-[#202c33]">🔧 Technical</option>
            <option value="billing" className="bg-[#202c33]">💳 Billing</option>
            <option value="general" className="bg-[#202c33]">💬 General</option>
            <option value="refund" className="bg-[#202c33]">↩️ Refund</option>
          </select>
        </div>

        {/* Message */}
        <div className="bg-[#202c33] rounded-xl overflow-hidden">
          <div className="px-4 pt-3 pb-1">
            <label className="text-[#00a884] text-[11px] font-semibold uppercase tracking-wider">Message</label>
          </div>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Describe your issue in detail..."
            rows={7}
            className="w-full bg-transparent text-white text-sm placeholder-[#8696a0] outline-none resize-none leading-relaxed px-4 pb-3"
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !subject.trim() || !message.trim()}
          className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2
            ${submitting || !subject.trim() || !message.trim()
              ? 'bg-[#2a3942] text-[#8696a0] cursor-not-allowed'
              : 'bg-[#00a884] text-white hover:bg-[#06cf9c] shadow-lg active:scale-95'}`}
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send size={16} />
              Submit Ticket
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default TicketForm;