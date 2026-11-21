const cartRepository = require('../repositories/cartRepository');
const productRepository = require('../repositories/productRepository');
const AppError = require('../utils/AppError');

const getOrCreateCart = async (userId) => {
  const cart = await cartRepository.findByUserId(userId);
  return cart || cartRepository.create({ userId });
};

const getCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  const items = await cartRepository.getItems(cart._id);
  return { ...cart.toObject(), items };
};

const recalculateTotals = async (cartId) => {
  const items = await cartRepository.getItems(cartId);
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce(
    (total, item) => total + item.quantity * item.priceAtAdd,
    0
  );
  const cart = await cartRepository.updateById(cartId, { totalItems, totalPrice });
  if (!cart) throw new AppError('Cart not found', 404);
  return cart;
};

const addItem = async (userId, productId, quantity) => {
  const product = await productRepository.findById(productId);
  if (!product || !product.isActive) throw new AppError('Product not found', 404);

  const cart = await getOrCreateCart(userId);
  const existingItem = await cartRepository.findItem(cart._id, productId);
  let item;

  if (existingItem) {
    item = await cartRepository.updateItemQuantity(
      existingItem._id,
      existingItem.quantity + quantity,
      cart._id
    );
  } else {
    item = await cartRepository.addItem({
      cartId: cart._id,
      productId,
      quantity,
      priceAtAdd: product.price,
    });
  }

  await recalculateTotals(cart._id);
  return item;
};

const updateItemQuantity = async (userId, itemId, quantity) => {
  const cart = await cartRepository.findByUserId(userId);
  if (!cart) throw new AppError('Cart not found', 404);

  const item = await cartRepository.updateItemQuantity(itemId, quantity, cart._id);
  if (!item) throw new AppError('Cart item not found', 404);

  await recalculateTotals(cart._id);
  return item;
};

const removeItem = async (userId, itemId) => {
  const cart = await cartRepository.findByUserId(userId);
  if (!cart) throw new AppError('Cart not found', 404);

  const item = await cartRepository.deleteItem(itemId, cart._id);
  if (!item) throw new AppError('Cart item not found', 404);

  await recalculateTotals(cart._id);
  return item;
};

const clearCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  await cartRepository.deleteItems(cart._id);
  const updatedCart = await cartRepository.updateByUserId(userId, {
    totalItems: 0,
    totalPrice: 0,
    expiresAt: null,
  });
  if (!updatedCart) throw new AppError('Cart not found', 404);
  return updatedCart;
};

module.exports = {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  recalculateTotals,
  clearCart,
};
