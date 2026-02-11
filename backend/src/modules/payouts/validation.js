import Joi from 'joi';

export const validatePayoutRequest = (req, res, next) => {
  const schema = Joi.object({
  }).unknown(true); 

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false,
      message: error.details[0].message 
    });
  }
  
  next();
};