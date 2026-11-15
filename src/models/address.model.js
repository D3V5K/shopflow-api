const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    label: { type: String, default: null }, // Home | Work | Other
    fullName: { type: String, required: true },
    phone: { type: String, required: true },

    country: { type: String, required: true, default: 'Morocco' },
    state: { type: String, default: null },
    city: { type: String, required: true },
    street: { type: String, required: true },
    buildingNumber: { type: String, default: null },
    postalCode: { type: String, default: null },

    isDefault: { type: Boolean, default: false },

    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

addressSchema.index({ userId: 1 });
addressSchema.index({ userId: 1, isDefault: 1 });
addressSchema.index({ deletedAt: 1 });

addressSchema.pre(/^find/, function (next) {
  this.where({ deletedAt: null });
  next();
});

module.exports = mongoose.model('Address', addressSchema);