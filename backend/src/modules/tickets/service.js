import Ticket from './model.js';

export const createTicket = async (userId, subject, category, message) => {
  const ticket = await Ticket.create({
    user: userId,
    subject,
    category,
    messages: [{
      sender: userId,
      message,
      createdAt: new Date()
    }]
  });

  return ticket;
};

export const getUserTickets = async (userId, page = 1, limit = 10) => {
  const tickets = await Ticket.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Ticket.countDocuments({ user: userId });

  return { tickets, total, page, pages: Math.ceil(total / limit) };
};

export const getTicketById = async (ticketId) => {
  return await Ticket.findById(ticketId)
    .populate('user', 'name email')
    .populate('messages.sender', 'name email role');
};

export const addMessage = async (ticketId, userId, message) => {
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new Error('Ticket not found');
  }

  ticket.messages.push({
    sender: userId,
    message,
    createdAt: new Date()
  });

  if (ticket.status === 'closed') {
    ticket.status = 'open';
  }

  await ticket.save();

  return ticket;
};

export const updateTicketStatus = async (ticketId, status) => {
  const ticket = await Ticket.findByIdAndUpdate(
    ticketId,
    {
      status,
      ...(status === 'resolved' || status === 'closed' ? { resolvedAt: new Date() } : {})
    },
    { new: true }
  );

  return ticket;
};

export const getAllTickets = async (page = 1, limit = 10, filters = {}) => {
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.category) query.category = filters.category;

  const tickets = await Ticket.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Ticket.countDocuments(query);

  return { tickets, total, page, pages: Math.ceil(total / limit) };
};