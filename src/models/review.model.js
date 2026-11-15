const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },

    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: null },
    comment: { type: String, default: null },
    images: [{ type: String }],

    isVerifiedPurchase: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
    helpfulCount: { type: Number, default: 0 },

    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });
reviewSchema.index({ productId: 1 });
reviewSchema.index({ productId: 1, isApproved: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });

reviewSchema.pre(/^find/, function (next) {
  this.where({ deletedAt: null });
  next();
});

module.exports = mongoose.model('Review', reviewSchema);