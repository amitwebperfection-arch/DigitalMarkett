import Joi from 'joi';

export const validateTicket = (req, res, next) => {
  const schema = Joi.object({
    subject: Joi.string().min(5).max(200).required(),
    category: Joi.string().valid('technical', 'billing', 'general', 'refund').required(),
    message: Joi.string().min(10).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};