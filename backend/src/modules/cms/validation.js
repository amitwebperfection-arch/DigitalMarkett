import Joi from 'joi';

export const validatePage = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(200).required(),
    content: Joi.string().required(),
    excerpt: Joi.string(),
    featuredImage: Joi.string().uri(),
    seo: Joi.object({
      metaTitle: Joi.string(),
      metaDescription: Joi.string(),
      metaKeywords: Joi.array().items(Joi.string())
    }),
    status: Joi.string().valid('draft', 'published')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};