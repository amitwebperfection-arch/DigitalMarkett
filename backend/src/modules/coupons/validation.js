import Joi from 'joi';

export const validateCoupon = (req, res, next) => {
  const schema = Joi.object({
    code: Joi.string().min(3).max(20).required(),
    type: Joi.string().valid('percentage', 'fixed').required(),
    value: Joi.number().min(0).required(),
    minPurchase: Joi.number().min(0),
    maxDiscount: Joi.number().min(0),
    usageLimit: Joi.number().min(1),
    expiresAt: Joi.date().required(),
    applicableProducts: Joi.array().items(Joi.string()),
    applicableCategories: Joi.array().items(Joi.string())
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};