const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const addItemSchema = Joi.object({
  productId: objectId.required(),
  quantity: Joi.number().integer().min(1).required(),
});

const updateItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
});

const itemIdParamSchema = Joi.object({
  itemId: objectId.required(),
});

const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      errors: error.details.map((detail) => detail.message),
    });
  }

  req.validated = req.validated || {};
  req.validated[source] = value;
  next();
};

module.exports = {
  validate,
  addItemSchema,
  updateItemSchema,
  itemIdParamSchema,
};
