const Payment = require('../models/payment.model');

const create = async (data) => {
  const payment = await Payment.create(data);
  return payment.toObject();
};

const findById = (id) => Payment.findById(id).lean();

const findByOrderId = (orderId) => Payment.findOne({ orderId }).lean();

const findByTransactionId = (transactionId) => Payment.findOne({ transactionId }).lean();

const updateStatus = async (paymentId, status, metadata = {}) => {
  const payment = await Payment.findByIdAndUpdate(
    paymentId,
    { $set: { status, ...metadata } },
    { new: true, runValidators: true }
  ).lean();
  return payment;
};

module.exports = {
  create,
  findById,
  findByOrderId,
  findByTransactionId,
  updateStatus,
};