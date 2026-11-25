const wishlistRepository = require('../repositories/wishlistRepository');
const productRepository = require('../repositories/productRepository');
const AppError = require('../utils/AppError');

const getWishlist = async (userId) => {
  let wishlist = await wishlistRepository.findByUserId(userId);

  if (!wishlist) {
    wishlist = await wishlistRepository.create(userId);
  }

  return wishlist;
};

const addProduct = async (userId, productId) => {
  const product = await productRepository.findById(productId);
  if (!product) throw new AppError('Product not found', 404);

  if (!product.isActive) throw new AppError('Product is not available', 400);

  const wishlist = await wishlistRepository.addProduct(userId, productId);
  return wishlist;
};

const removeProduct = async (userId, productId) => {
  const product = await productRepository.findById(productId);
  if (!product) throw new AppError('Product not found', 404);

  const wishlist = await wishlistRepository.removeProduct(userId, productId);
  return wishlist;
};

const clearWishlist = async (userId) => {
  const wishlist = await wishlistRepository.clear(userId);
  return wishlist;
};

module.exports = {
  getWishlist,
  addProduct,
  removeProduct,
  clearWishlist,
};