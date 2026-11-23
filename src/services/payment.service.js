const crypto = require('crypto');
const paymentRepository = require('../repositories/paymentRepository');
const orderRepository = require('../repositories/orderRepository');
const AppError = require('../utils/AppError');

const createPaymentIntent = async (orderId, userId) => {
  const order = await orderRepository.findOrderById(orderId);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.userId.toString() !== userId.toString()) {
    throw new AppError('Order not found', 404);
  }

  if (order.paymentStatus === 'PAID') {
    throw new AppError('Order is already paid', 409);
  }

  if (order.status === 'CANCELLED') {
    throw new AppError('Cannot pay for a cancelled order', 400);
  }

  const existingPayment = await paymentRepository.findByOrderId(orderId);
  if (existingPayment && existingPayment.status === 'PENDING') {
    return {
      payment: existingPayment,
      clientSecret: 'mock_secret_' + existingPayment._id,
    };
  }

  const payment = await paymentRepository.create({
    orderId,
    userId,
    amount: order.totalAmount,
    currency: 'MAD',
    method: 'CARD',
    status: 'PENDING',
    gateway: 'MOCK',
    transactionId: 'mock_txn_' + crypto.randomBytes(12).toString('hex'),
    gatewayResponse: {
      mock: true,
      intentCreatedAt: new Date().toISOString(),
    },
  });

  return {
    payment,
    clientSecret: 'mock_secret_' + payment._id,
  };
};

const confirmPayment = async (paymentId, userId) => {
  const payment = await paymentRepository.findById(paymentId);
  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  if (payment.userId.toString() !== userId.toString()) {
    throw new AppError('Payment not found', 404);
  }

  if (payment.status !== 'PENDING') {
    throw new AppError('Payment is not pending', 409);
  }

  const order = await orderRepository.findOrderById(payment.orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const now = new Date();

  const updatedPayment = await paymentRepository.updateStatus(paymentId, 'SUCCESS', {
    paidAt: now,
    gatewayResponse: {
      ...payment.gatewayResponse,
      confirmedAt: now.toISOString(),
    },
  });

  const updatedOrder = await orderRepository.updateOrder(
    { _id: payment.orderId },
    {
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      confirmedAt: now,
    }
  );

  return { payment: updatedPayment, order: updatedOrder };
};

const failPayment = async (paymentId, userId, reason) => {
  const payment = await paymentRepository.findById(paymentId);
  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  if (payment.userId.toString() !== userId.toString()) {
    throw new AppError('Payment not found', 404);
  }

  if (payment.status !== 'PENDING') {
    throw new AppError('Payment is not pending', 409);
  }

  const now = new Date();
  const updatedPayment = await paymentRepository.updateStatus(paymentId, 'FAILED', {
    failureReason: reason || 'Mock failure',
    failedAt: now,
  });

  return updatedPayment;
};

const handleWebhook = async ({ transactionId, status }) => {
  const payment = await paymentRepository.findByTransactionId(transactionId);
  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  if (payment.status !== 'PENDING') {
    return payment;
  }

  const now = new Date();

  if (status === 'SUCCESS') {
    const updatedPayment = await paymentRepository.updateStatus(payment._id, 'SUCCESS', {
      paidAt: now,
      gatewayResponse: {
        ...payment.gatewayResponse,
        confirmedAt: now.toISOString(),
      },
    });

    await orderRepository.updateOrder(
      { _id: payment.orderId },
      {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        confirmedAt: now,
      }
    );

    return updatedPayment;
  }

  if (status === 'FAILED') {
    const updatedPayment = await paymentRepository.updateStatus(payment._id, 'FAILED', {
      failedAt: now,
    });
    return updatedPayment;
  }

  return payment;
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  failPayment,
  handleWebhook,
};