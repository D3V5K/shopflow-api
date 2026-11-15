const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cart',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: { type: Number, required: true, default: 1, min: 1 },
    priceAtAdd: { type: Number, required: true }, // snapshot
  },
  { timestamps: true }
);

cartItemSchema.index({ cartId: 1, productId: 1 }, { unique: true });
cartItemSchema.index({ cartId: 1 });
cartItemSchema.index({ productId: 1 });

module.exports = mongoose.model('CartItem', cartItemSchema);