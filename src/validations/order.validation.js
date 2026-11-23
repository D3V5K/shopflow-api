const Joi = require('joi');

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
];

const PAYMENT_STATUSES = [
  'UNPAID',
  'PAID',
  'PARTIALLY_REFUNDED',
  'REFUNDED',
  'FAILED',
];

const objectId = Joi.string().hex().length(24);

const idParamSchema = Joi.object({
  id: objectId.required(),
});

const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: objectId.required(),
        quantity: Joi.number().integer().min(1).max(100).required(),
      })
    )
    .min(1)
    .max(50)
    .required(),
  shippingAddress: Joi.object({
    label: Joi.string().trim().max(50),
    fullName: Joi.string().trim().max(100).required(),
    phone: Joi.string().trim().max(30).required(),
    country: Joi.string().trim().max(100).required(),
    state: Joi.string().trim().max(100),
    city: Joi.string().trim().max(100).required(),
    street: Joi.string().trim().max(255).required(),
    buildingNumber: Joi.string().trim().max(50),
    postalCode: Joi.string().trim().max(20),
  }).required(),
  customerNote: Joi.string().trim().max(500).allow('', null),
});

const myOrdersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid(...ORDER_STATUSES),
});

const adminOrdersQuerySchema = myOrdersQuerySchema.keys({
  paymentStatus: Joi.string().valid(...PAYMENT_STATUSES),
  userId: objectId,
});

const cancelOrderSchema = Joi.object({
  cancelReason: Joi.string().trim().max(500).allow('', null),
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...ORDER_STATUSES)
    .required(),
  trackingNumber: Joi.string()
    .trim()
    .max(100)
    .when('status', { is: 'SHIPPED', then: Joi.required() }),
  carrier: Joi.string()
    .trim()
    .max(100)
    .when('status', { is: 'SHIPPED', then: Joi.required() }),
  cancelReason: Joi.string()
    .trim()
    .max(500)
    .when('status', { is: 'CANCELLED', then: Joi.required() }),
  adminNote: Joi.string().trim().max(500).allow('', null),
});

const updatePaymentStatusSchema = Joi.object({
  paymentStatus: Joi.string()
    .valid(...PAYMENT_STATUSES)
    .required(),
});

// source: 'body' | 'params' | 'query'
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
  idParamSchema,
  createOrderSchema,
  myOrdersQuerySchema,
  adminOrdersQuerySchema,
  cancelOrderSchema,
  updateStatusSchema,
  updatePaymentStatusSchema,
};
