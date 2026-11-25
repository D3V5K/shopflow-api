const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const createCouponSchema = Joi.object({
  code: Joi.string().trim().uppercase().min(3).max(50).required(),
  description: Joi.string().trim().max(500).allow('', null),
  discountType: Joi.string().valid('PERCENTAGE', 'FIXED').required(),
  discountValue: Joi.number().min(0).required(),
  maxDiscountAmount: Joi.number().min(0).allow(null),
  minOrderAmount: Joi.number().min(0).default(0),
  maxUses: Joi.number().integer().min(1).allow(null),
  perUserLimit: Joi.number().integer().min(1).default(1),
  startsAt: Joi.date().default(() => new Date()),
  expiresAt: Joi.date().allow(null),
  isActive: Joi.boolean().default(true),
  applicableCategories: Joi.array().items(objectId),
  applicableProducts: Joi.array().items(objectId),
  excludedProducts: Joi.array().items(objectId),
  firstOrderOnly: Joi.boolean().default(false),
});

const updateCouponSchema = Joi.object({
  code: Joi.string().trim().uppercase().min(3).max(50),
  description: Joi.string().trim().max(500).allow('', null),
  discountType: Joi.string().valid('PERCENTAGE', 'FIXED'),
  discountValue: Joi.number().min(0),
  maxDiscountAmount: Joi.number().min(0).allow(null),
  minOrderAmount: Joi.number().min(0),
  maxUses: Joi.number().integer().min(1).allow(null),
  perUserLimit: Joi.number().integer().min(1),
  startsAt: Joi.date(),
  expiresAt: Joi.date().allow(null),
  isActive: Joi.boolean(),
  applicableCategories: Joi.array().items(objectId),
  applicableProducts: Joi.array().items(objectId),
  excludedProducts: Joi.array().items(objectId),
  firstOrderOnly: Joi.boolean(),
}).min(1);

const couponIdParamSchema = Joi.object({
  id: objectId.required(),
});

const orderIdParamSchema = Joi.object({
  orderId: objectId.required(),
});

const validateCouponSchema = Joi.object({
  code: Joi.string().trim().uppercase().required(),
  orderSubtotal: Joi.number().min(0).required(),
});

const applyCouponSchema = Joi.object({
  code: Joi.string().trim().uppercase().required(),
});

const listCouponsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
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
  createCouponSchema,
  updateCouponSchema,
  couponIdParamSchema,
  orderIdParamSchema,
  validateCouponSchema,
  applyCouponSchema,
  listCouponsQuerySchema,
};