const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const createIntentSchema = Joi.object({
  orderId: objectId.required(),
});

const failPaymentSchema = Joi.object({
  reason: Joi.string().trim().max(500).allow('', null),
});

const paymentIdParamSchema = Joi.object({
  paymentId: objectId.required(),
});

const webhookSchema = Joi.object({
  transactionId: Joi.string().required(),
  status: Joi.string().valid('SUCCESS', 'FAILED').required(),
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
  createIntentSchema,
  failPaymentSchema,
  paymentIdParamSchema,
  webhookSchema,
};