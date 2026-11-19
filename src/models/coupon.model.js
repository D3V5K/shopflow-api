const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    description: { type: String, default: null },

    discountType: {
      type: String,
      enum: ['PERCENTAGE', 'FIXED'],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    maxDiscountAmount: { type: Number, default: null },

    minOrderAmount: { type: Number, default: 0 },

    maxUses: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },

    startsAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },

    applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    excludedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

    firstOrderOnly: { type: Boolean, default: false },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ isActive: 1 });
couponSchema.index({ isActive: 1, startsAt: 1, expiresAt: 1 });
couponSchema.index({ expiresAt: 1 });

// Validation: PERCENTAGE <= 100
couponSchema.pre('validate', function (next) {
  if (this.discountType === 'PERCENTAGE' && this.discountValue > 100) {
    return next(new Error('Percentage discount cannot exceed 100'));
  }
  next();
});

module.exports = mongoose.model('Coupon', couponSchema);