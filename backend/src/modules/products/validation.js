import Joi from 'joi';

export const validateProduct = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().min(10).required(),
    shortDescription: Joi.string().max(300).allow(''),
    price: Joi.number().min(0).required(),
    salePrice: Joi.number().min(0).allow('').allow(null),
    // ✅ Accept any string for category (will be validated in service)
    category: Joi.string().required(),
    tags: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string()
    ).allow(''),
    demoUrl: Joi.string().uri().allow(''),
    documentation: Joi.string().uri().allow(''),
    version: Joi.string().allow(''),
    requirements: Joi.string().allow(''),
    compatibleWith: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string()
    ).allow(''),
    changelog: Joi.string().allow(''), // JSON string
    featured: Joi.alternatives().try(
      Joi.boolean(),
      Joi.string().valid('true', 'false')
    ),
    published: Joi.alternatives().try(
      Joi.boolean(),
      Joi.string().valid('true', 'false')
    )
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