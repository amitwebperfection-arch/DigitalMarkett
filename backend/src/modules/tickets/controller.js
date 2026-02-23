import * as ticketService from './service.js';

export const createTicket = async (req, res, next) => {
  try {
    const { subject, category, message } = req.body;
    const ticket = await ticketService.createTicket(req.user.id, subject, category, message);
    res.status(201).json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

export const getMyTickets = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await ticketService.getUserTickets(req.user.id, Number(page), Number(limit));
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.getTicketById(req.params.id);
    res.json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

export const replyToTicket = async (req, res, next) => {
  try {
    const { message } = req.body;
    const ticket = await ticketService.addMessage(req.params.id, req.user.id, message);
    res.json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const ticket = await ticketService.updateTicketStatus(req.params.id, status);
    res.json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

export const getAllTickets = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;
    const result = await ticketService.getAllTickets(Number(page), Number(limit), filters);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};