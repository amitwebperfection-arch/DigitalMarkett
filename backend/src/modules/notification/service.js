import Notification from './model.js';
import User from '../users/model.js';

export const createNotification = async ({
  recipientId,
  recipientRole,
  title,
  message,
  type,
  link = null,
  refModel = null,
  refId = null,
}) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      recipientRole,
      title,
      message,
      type,
      link,
      refModel,
      refId,
    });
    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
  }
};

export const notifyAllAdmins = async ({ title, message, type, link, refModel, refId }) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('_id');
    const notifications = admins.map((admin) => ({
      recipient: admin._id,
      recipientRole: 'admin',
      title,
      message,
      type,
      link: link || null,
      refModel: refModel || null,
      refId: refId || null,
    }));
    await Notification.insertMany(notifications);
  } catch (error) {
    console.error('❌ Error notifying admins:', error);
  }
};

export const getUserNotifications = async (userId, page = 1, limit = 15) => {
  const notifications = await Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const unreadCount = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });

  const total = await Notification.countDocuments({ recipient: userId });

  return { notifications, unreadCount, total, pages: Math.ceil(total / limit) };
};

export const markAsRead = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true }
  );
};

export const markAllAsRead = async (userId) => {
  return Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
};


export const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ recipient: userId, isRead: false });
};