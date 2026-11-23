const express = require('express');
const paymentController = require('../controllers/payment.controller');
const {
  validate,
  createIntentSchema,
  failPaymentSchema,
  paymentIdParamSchema,
  webhookSchema,
} = require('../validations/payment.validation');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/webhook', validate(webhookSchema), paymentController.webhook);

router.use(authMiddleware);

router.post('/intent', validate(createIntentSchema), paymentController.createIntent);
router.post('/:paymentId/confirm', validate(paymentIdParamSchema, 'params'), paymentController.confirm);
router.post('/:paymentId/fail', validate(paymentIdParamSchema, 'params'), validate(failPaymentSchema), paymentController.fail);

module.exports = router;