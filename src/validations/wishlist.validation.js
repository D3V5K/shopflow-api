const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const productIdParamSchema = Joi.object({
  productId: objectId.required(),
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
  productIdParamSchema,
};