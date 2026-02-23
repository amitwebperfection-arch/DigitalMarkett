import Joi from 'joi';

export const validateReview = (req, res, next) => {
  const schema = Joi.object({
    productId: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
    title: Joi.string().min(3).max(100).required(),
    comment: Joi.string().min(10).max(1000).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};