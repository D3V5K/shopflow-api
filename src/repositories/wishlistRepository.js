const Wishlist = require('../models/wishlist.model');

const findByUserId = (userId) => {
  return Wishlist.findOne({ userId })
    .populate('products', 'name slug price thumbnail isActive')
    .lean();
};

const create = async (userId) => {
  const wishlist = await Wishlist.create({ userId, products: [] });
  return wishlist.toObject();
};

const addProduct = (userId, productId) => {
  return Wishlist.findOneAndUpdate(
    { userId },
    { $addToSet: { products: productId } },
    { new: true, upsert: true }
  )
    .populate('products', 'name slug price thumbnail isActive')
    .lean();
};

const removeProduct = (userId, productId) => {
  return Wishlist.findOneAndUpdate(
    { userId },
    { $pull: { products: productId } },
    { new: true }
  )
    .populate('products', 'name slug price thumbnail isActive')
    .lean();
};

const clear = (userId) => {
  return Wishlist.findOneAndUpdate(
    { userId },
    { $set: { products: [] } },
    { new: true }
  ).lean();
};

module.exports = {
  findByUserId,
  create,
  addProduct,
  removeProduct,
  clear,
};