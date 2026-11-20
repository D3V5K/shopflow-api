const Joi = require('joi');
const AppError = require('../utils/AppError');



const objectId = Joi.string().hex().length(24).messages({
  'string.hex': '{{#label}} must be a valid id',
  'string.length': '{{#label}} must be a valid id',
});

const slug = Joi.string()
  .trim()
  .lowercase()
  .max(150)
  .pattern(/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u)
  .messages({
    'string.pattern.base': 'slug may only contain letters, numbers and single hyphens',
  });

const name = Joi.string().trim().min(2).max(100);
const description = Joi.string().trim().max(1000).allow(null, '');
const image = Joi.string().trim().uri().max(2048).allow(null, '');


const createCategorySchema = Joi.object({
  name: name.required(),
  slug,
  description,
  image,
  parentId: objectId.allow(null),
  isActive: Joi.boolean(),
  sortOrder: Joi.number().integer().min(0),
});

const updateCategorySchema = Joi.object({
  name,
  slug,
  description,
  image,
  parentId: objectId.allow(null),
  isActive: Joi.boolean(),
  sortOrder: Joi.number().integer().min(0),
}).min(1);

const listCategoriesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  parentId: Joi.alternatives().try(objectId, Joi.string().valid('null')),
  isActive: Joi.boolean(),
  search: Joi.string().trim().max(100),
  sortBy: Joi.string().valid('name', 'sortOrder', 'createdAt').default('sortOrder'),
  order: Joi.string().valid('asc', 'desc').default('asc'),
});

const idParamSchema = Joi.object({
  id: objectId.required(),
});

const slugParamSchema = Joi.object({
  slug: slug.required(),
});

const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    const { value, error } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
      errors: { wrap: { label: false } },
    });

    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ');
      return next(new AppError(message, 400));
    }

    req.validated = req.validated || {};
    req.validated[source] = value;
    if (source === 'body') req.body = value;

    return next();
  };

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  listCategoriesQuerySchema,
  idParamSchema,
  slugParamSchema,
  validate,
};
