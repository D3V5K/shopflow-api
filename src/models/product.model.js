const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    sku: { type: String, required: true, unique: true, uppercase: true },

    description: { type: String, default: null },
    shortDescription: { type: String, default: null },

    // Pricing (in cents)
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null },
    costPrice: { type: Number, default: null, select: false }, // admin only
    currency: { type: String, default: 'MAD' },

    // Inventory
    stock: { type: Number, required: true, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    trackInventory: { type: Boolean, default: true },

    // Media
    images: [{ type: String }],
    thumbnail: { type: String, default: null },

    // Relations
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },

    // Denormalized
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },

    // Attributes (flexible)
    attributes: { type: mongoose.Schema.Types.Mixed, default: null },
    tags: [{ type: String }],

    // Status
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },

    // SEO
    metaTitle: { type: String, default: null },
    metaDescription: { type: String, default: null },

    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ categoryId: 1 });
productSchema.index({ isActive: 1, categoryId: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ soldCount: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ tags: 'text', name: 'text', description: 'text' });

productSchema.pre(/^find/, function (next) {
  this.where({ deletedAt: null });
  next();
});

module.exports = mongoose.model('Product', productSchema);