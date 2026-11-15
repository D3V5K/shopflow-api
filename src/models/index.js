
const User = require('./user.model.js');
const Address = require('./address.model.js');
const Category = require('./category.model.js');
const Product = require('./product.model.js');
const Review = require('./review.model.js');
const Cart = require('./cart.model.js');
const CartItem = require('./cartItem.model.js');
const Order = require('./order.model.js');
const OrderItem = require('./orderItem.model.js');
const Payment = require('./payment.model.js');
const Coupon = require('./coupon.model.js');
const CouponUsage = require('./couponUsage.model.js');
const Wishlist = require('./wishlist.model.js');
const RefreshToken = require('./refreshToken.model.js');

module.exports = {
  User,
  Address,
  Category,
  Product,
  Review,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Payment,
  Coupon,
  CouponUsage,
  Wishlist,
  RefreshToken,
};
