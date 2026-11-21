const Product = require('../models/product.model');


const productRepository = {
  findAll({ filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 20 } = {}) {
    return Product.find(filter).sort(sort).skip(skip).limit(limit).lean();
  },

  count(filter = {}) {
    return Product.countDocuments({ ...filter, deletedAt: null });
  },

  findById(id) {
    return Product.findById(id).lean();
  },

  findBySlug(slug) {
    return Product.findOne({ slug: slug.toLowerCase() }).lean();
  },

  findBySku(sku) {
    return Product.findOne({ sku: sku.toUpperCase() }).lean();
  },

  create(data) {
    return Product.create(data);
  },

  updateById(id, data) {
    return Product.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();
  },

  softDeleteById(id) {
    return Product.findByIdAndUpdate(
      id,
      { $set: { deletedAt: new Date(), isActive: false } },
      { new: true }
    ).lean();
  },

  adjustStock(id, delta) {
    const filter = { _id: id };
    if (delta < 0) filter.stock = { $gte: Math.abs(delta) };

    return Product.findOneAndUpdate(
      filter,
      { $inc: { stock: delta } },
      { new: true }
    ).lean();
  },
};

module.exports = productRepository;
