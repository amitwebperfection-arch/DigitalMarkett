import Joi from 'joi';

export const validateCreateOrder = (req, res, next) => {
  const schema = Joi.object({
    items: Joi.array().items(Joi.object({
      productId: Joi.string().required()
    })).min(1).required(),
    
    paymentMethod: Joi.string().valid('stripe', 'razorpay', 'wallet').required(),
    
    couponId: Joi.string().allow(null, ''),
    couponCode: Joi.string().allow(null, ''),
    
    personalDetails: Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required()
    }).required(),
    
    shippingAddress: Joi.object({
      addressLine1: Joi.string().required(),
      addressLine2: Joi.string().allow('', null),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().required()
    }).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};