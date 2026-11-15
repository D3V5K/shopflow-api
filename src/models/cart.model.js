const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    totalItems: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

cartSchema.index({ userId: 1 }, { unique: true });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL

module.exports = mongoose.model('Cart', cartSchema);