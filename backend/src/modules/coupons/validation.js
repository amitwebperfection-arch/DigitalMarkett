import Joi from 'joi';

export const validateCoupon = (req, res, next) => {
  const schema = Joi.object({
    code: Joi.string().trim().uppercase().min(3).max(20).required(),
    type: Joi.string().valid('percentage', 'fixed').required(),
    value: Joi.number().positive().required(),
    minPurchase: Joi.number().min(0).default(0),
    maxDiscount: Joi.when('type', {
      is: 'percentage',
      then: Joi.number().min(0).required(),
      otherwise: Joi.forbidden()
    }),
    usageLimit: Joi.number().integer().min(1).default(1),
    expiresAt: Joi.date().greater('now').required(),
    applicableProducts: Joi.array().items(Joi.string()),
    applicableCategories: Joi.array().items(Joi.string())
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};