import { useState } from 'react';
import { ticketService } from '../../services/ticket.service';
import { useNavigate } from 'react-router-dom';

function TicketForm() {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('technical');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await ticketService.createTicket({ subject, category, message });
      navigate('/user/tickets');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold">Create New Ticket</h2>
      <input 
        type="text" value={subject} 
        onChange={(e) => setSubject(e.target.value)} 
        placeholder="Subject" 
        className="input" 
        required 
      />
      <select 
        value={category} 
        onChange={(e) => setCategory(e.target.value)} 
        className="input"
      >
        <option value="technical">Technical</option>
        <option value="billing">Billing</option>
        <option value="general">General</option>
        <option value="refund">Refund</option>
      </select>
      <textarea 
        value={message} 
        onChange={(e) => setMessage(e.target.value)} 
        placeholder="Message" 
        className="input h-24" 
        required 
      />
      <button type="submit" className="btn-primary">Submit Ticket</button>
    </form>
  );
}

export default TicketForm;
