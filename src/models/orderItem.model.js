const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },

    // Snapshots
    productName: { type: String, required: true },
    productSlug: { type: String, default: null },
    productImage: { type: String, default: null },
    sku: { type: String, default: null },

    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true },

    itemDiscount: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

orderItemSchema.index({ orderId: 1 });
orderItemSchema.index({ productId: 1 });
orderItemSchema.index({ orderId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('OrderItem', orderItemSchema);