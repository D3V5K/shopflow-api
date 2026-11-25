const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const createReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  title: Joi.string().trim().max(120).allow('', null),
  comment: Joi.string().trim().max(2000).allow('', null),
  images: Joi.array().items(Joi.string().uri()).max(5),
});

const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5),
  title: Joi.string().trim().max(120).allow('', null),
  comment: Joi.string().trim().max(2000).allow('', null),
  images: Joi.array().items(Joi.string().uri()).max(5),
}).min(1);

const productIdParamSchema = Joi.object({
  productId: objectId.required(),
});

const reviewIdParamSchema = Joi.object({
  id: objectId.required(),
});

const listReviewsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
});

const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map((detail) => detail.message),
    });
  }

  req.validated = { ...req.validated, [source]: value };
  next();
};

module.exports = {
  validate,
  createReviewSchema,
  updateReviewSchema,
  productIdParamSchema,
  reviewIdParamSchema,
  listReviewsQuerySchema,
};