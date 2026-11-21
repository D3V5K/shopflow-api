const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

// Prices are in cents. averageRating, reviewCount, soldCount and deletedAt
// are system-managed, so they are intentionally absent (stripped if sent).
const productFields = {
  name: Joi.string().trim().min(2).max(200).required(),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  sku: Joi.string().trim().uppercase().max(64).required(),

  description: Joi.string().allow(null, ''),
  shortDescription: Joi.string().max(500).allow(null, ''),

  price: Joi.number().integer().min(0).required(),
  compareAtPrice: Joi.number().integer().min(0).allow(null),
  costPrice: Joi.number().integer().min(0).allow(null),
  currency: Joi.string().trim().uppercase().length(3),

  stock: Joi.number().integer().min(0),
  lowStockThreshold: Joi.number().integer().min(0),
  trackInventory: Joi.boolean(),

  images: Joi.array().items(Joi.string().uri()),
  thumbnail: Joi.string().uri().allow(null),

  categoryId: objectId.required(),

  attributes: Joi.object().unknown(true).allow(null),
  tags: Joi.array().items(Joi.string().trim()),

  isActive: Joi.boolean(),
  isFeatured: Joi.boolean(),

  metaTitle: Joi.string().max(255).allow(null, ''),
  metaDescription: Joi.string().max(500).allow(null, ''),
};

const createProductSchema = Joi.object(productFields);

const updateProductSchema = Joi.object(productFields)
  .fork(Object.keys(productFields), (field) => field.optional())
  .min(1);

const listProductsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string()
    .valid('newest', 'price_asc', 'price_desc', 'rating', 'popular')
    .default('newest'),
  search: Joi.string().trim().max(100),
  categoryId: objectId,
  minPrice: Joi.number().integer().min(0),
  maxPrice: Joi.number().integer().min(0),
  isFeatured: Joi.boolean(),
  inStock: Joi.boolean(),
  tags: Joi.array().items(Joi.string().trim()).single(),
});

const idParamSchema = Joi.object({ id: objectId.required() });

const slugParamSchema = Joi.object({
  slug: Joi.string().trim().lowercase().required(),
});

// delta > 0 adds stock, delta < 0 removes stock
const adjustStockSchema = Joi.object({
  delta: Joi.number().integer().invalid(0).required(),
});

// Results are stored in req.validated (req.query is read-only in Express 5).
const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      })),
    });
  }

  req.validated = req.validated || {};
  req.validated[source] = value;
  next();
};

module.exports = {
  validate,
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
  idParamSchema,
  slugParamSchema,
  adjustStockSchema,
};
