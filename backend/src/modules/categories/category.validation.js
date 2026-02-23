import Joi from 'joi';

export const validateCategory = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Category name is required',
        'string.min': 'Category name must be at least 2 characters',
        'string.max': 'Category name cannot exceed 100 characters'
      }),
    description: Joi.string()
      .required()
      .messages({
        'string.empty': 'Description is required'
      }),
    published: Joi.alternatives()
      .try(
        Joi.boolean(),
        Joi.string().valid('true', 'false')
      )
      .default(true),
    parent: Joi.string()
      .allow(null, '')
      .optional(),
    order: Joi.number()
      .integer()
      .min(0)
      .default(0)
  }).options({ allowUnknown: true }); 

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ 
      success: false,
      message: error.details[0].message 
    });
  }

  next();
};