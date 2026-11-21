const cartService = require('../services/cart.service');
const asyncHandler = require('../utils/asyncHandler');

const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user.userId);
  res.status(200).json({ success: true, data: cart });
});

const addItem = asyncHandler(async (req, res) => {
  const item = await cartService.addItem(
    req.user.userId,
    req.validated.body.productId,
    req.validated.body.quantity
  );
  res.status(201).json({ success: true, data: item });
});

const updateItemQuantity = asyncHandler(async (req, res) => {
  const item = await cartService.updateItemQuantity(
    req.user.userId,
    req.validated.params.itemId,
    req.validated.body.quantity
  );
  res.status(200).json({ success: true, data: item });
});

const removeItem = asyncHandler(async (req, res) => {
  await cartService.removeItem(req.user.userId, req.validated.params.itemId);
  res.status(204).send();
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCart(req.user.userId);
  res.status(200).json({ success: true, data: cart });
});

module.exports = { getCart, addItem, updateItemQuantity, removeItem, clearCart };
