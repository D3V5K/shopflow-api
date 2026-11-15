const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    amount: { type: Number, required: true },
    currency: { type: String, default: 'MAD' },

    method: {
      type: String,
      enum: ['CARD', 'CASH_ON_DELIVERY', 'PAYPAL', 'STRIPE', 'BANK_TRANSFER'],
      required: true,
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'PROCESSING',
        'SUCCESS',
        'FAILED',
        'REFUNDED',
        'PARTIALLY_REFUNDED',
      ],
      default: 'PENDING',
    },

    // Gateway
    gateway: { type: String, default: null },
    transactionId: { type: String, default: null },
    gatewayResponse: { type: mongoose.Schema.Types.Mixed, default: null },

    // Failure
    failureReason: { type: String, default: null },
    failureCode: { type: String, default: null },

    // Refund
    refundedAmount: { type: Number, default: 0 },
    refundReason: { type: String, default: null },

    // Timestamps
    paidAt: { type: Date, default: null },
    failedAt: { type: Date, default: null },
    refundedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

paymentSchema.index({ orderId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ orderId: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);