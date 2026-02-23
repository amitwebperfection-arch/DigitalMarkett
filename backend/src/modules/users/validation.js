import Joi from 'joi';

export const validateUpdateProfile = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50),
    avatar: Joi.string().uri()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};