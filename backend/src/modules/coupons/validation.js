import Joi from 'joi';

export const validateCoupon = (req, res, next) => {
  const schema = Joi.object({
    code: Joi.string().trim().uppercase().min(3).max(20).required(),
    type: Joi.string().valid('percentage', 'fixed').required(),
    value: Joi.number().positive().required(),
    minPurchase: Joi.number().min(0).default(0),
    maxDiscount: Joi.when('type', {
      is: 'percentage',
      then: Joi.number().min(0).optional(),
      otherwise: Joi.forbidden()
    }),
    usageLimit: Joi.number().integer().min(1).allow(null).optional(),
    expiresAt: Joi.date().greater('now').required(),
    isActive: Joi.boolean().default(true),
    applicableProducts: Joi.array().items(Joi.string()).default([]),
    applicableCategories: Joi.array().items(Joi.string()).default([]),

    rules: Joi.object({
      newUser: Joi.boolean().default(false),
      minOrders: Joi.number().integer().min(0).allow(null).default(null),
      minCartAmount: Joi.number().min(0).allow(null).default(null),
      inactiveDays: Joi.number().integer().min(1).allow(null).default(null),
    }).default({})
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};