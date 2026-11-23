const paymentService = require('../services/payment.service');
const asyncHandler = require('../utils/asyncHandler');

const createIntent = asyncHandler(async (req, res) => {
  const result = await paymentService.createPaymentIntent(
    req.validated.body.orderId,
    req.user.userId
  );
  res.status(201).json({ success: true, data: result });
});

const confirm = asyncHandler(async (req, res) => {
  const result = await paymentService.confirmPayment(
    req.validated.params.paymentId,
    req.user.userId
  );
  res.status(200).json({ success: true, data: result });
});

const fail = asyncHandler(async (req, res) => {
  await paymentService.failPayment(
    req.validated.params.paymentId,
    req.user.userId,
    req.validated.body.reason
  );
  res.status(200).json({ success: true, data: { message: 'Payment failed' } });
});

const webhook = asyncHandler(async (req, res) => {
  const payment = await paymentService.handleWebhook(req.validated.body);
  res.status(200).json({ success: true, data: payment });
});

module.exports = {
  createIntent,
  confirm,
  fail,
  webhook,
};