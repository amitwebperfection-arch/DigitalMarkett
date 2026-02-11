import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    required: true
  },
  resource: String,
  resourceId: String,
  ip: String,
  userAgent: String,
  details: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export const logAction = async (userId, action, resource, resourceId, details = {}, req) => {
  try {
    await AuditLog.create({
      user: userId,
      action,
      resource,
      resourceId,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      details
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

export const auditMiddleware = (action, resource) => {
  return async (req, res, next) => {
    const originalSend = res.send;

    res.send = function(data) {
      if (res.statusCode < 400 && req.user) {
        logAction(
          req.user.id,
          action,
          resource,
          req.params.id || req.body.id,
          { body: req.body, params: req.params },
          req
        );
      }
      originalSend.call(this, data);
    };

    next();
  };
};