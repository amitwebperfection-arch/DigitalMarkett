import * as notificationService from './service.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const result = await notificationService.getUserNotifications(
      req.user.id,
      Number(page),
      Number(limit)
    );
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    res.json({ success: true, unreadCount: count });
  } catch (error) {
    next(error);
  }
}; 

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user.id);
    res.json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};