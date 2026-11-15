const mongoose = require('mongoose');

const couponUsageSchema = new mongoose.Schema(
  {
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    discountApplied: { type: Number, required: true },
    usedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: false, updatedAt: false } }
);

couponUsageSchema.index({ couponId: 1 });
couponUsageSchema.index({ userId: 1 });
couponUsageSchema.index({ orderId: 1 });
couponUsageSchema.index({ couponId: 1, userId: 1 }); // perUserLimit
couponUsageSchema.index({ couponId: 1, orderId: 1 }, { unique: true });

module.exports = mongoose.model('CouponUsage', couponUsageSchema);