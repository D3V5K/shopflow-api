const wishlistService = require('../services/wishlist.service');
const asyncHandler = require('../utils/asyncHandler');

const get = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.getWishlist(req.user.userId);
  res.status(200).json({ success: true, data: wishlist });
});

const add = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.addProduct(
    req.user.userId,
    req.validated.params.productId
  );
  res.status(201).json({ success: true, data: wishlist });
});

const remove = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.removeProduct(
    req.user.userId,
    req.validated.params.productId
  );
  res.status(200).json({ success: true, data: wishlist });
});

const clear = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.clearWishlist(req.user.userId);
  res.status(200).json({ success: true, data: wishlist });
});

module.exports = {
  get,
  add,
  remove,
  clear,
};