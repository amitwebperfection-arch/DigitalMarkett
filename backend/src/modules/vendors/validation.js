import Joi from 'joi';

export const validateVendorApplication = (req, res, next) => {
  const schema = Joi.object({
    businessName: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(500).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};