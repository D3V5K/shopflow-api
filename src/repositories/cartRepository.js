const Cart = require('../models/cart.model');
const CartItem = require('../models/cartItem.model');

const findByUserId = (userId) => Cart.findOne({ userId });

const create = (data) => Cart.create(data);

const updateByUserId = (userId, data) =>
  Cart.findOneAndUpdate({ userId }, { $set: data }, { new: true, runValidators: true });

const updateById = (cartId, data) =>
  Cart.findByIdAndUpdate(cartId, { $set: data }, { new: true, runValidators: true });

const findItem = (cartId, productId) => CartItem.findOne({ cartId, productId });

const addItem = (data) => CartItem.create(data);

const updateItemQuantity = (itemId, quantity, cartId) =>
  CartItem.findOneAndUpdate(
    { _id: itemId, cartId },
    { $set: { quantity } },
    { new: true, runValidators: true }
  );

const deleteItem = (itemId, cartId) =>
  CartItem.findOneAndDelete({ _id: itemId, cartId });

const getItems = (cartId) =>
  CartItem.find({ cartId }).populate('productId').lean();

const deleteItems = (cartId) => CartItem.deleteMany({ cartId });

module.exports = {
  findByUserId,
  create,
  updateByUserId,
  updateById,
  findItem,
  addItem,
  updateItemQuantity,
  deleteItem,
  getItems,
  deleteItems,
};
