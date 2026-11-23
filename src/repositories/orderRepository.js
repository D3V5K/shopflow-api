const Order = require('../models/order.model');
const OrderItem = require('../models/orderItem.model');
const Product = require('../models/product.model');

const findProductsByIds = (ids) => Product.find({ _id: { $in: ids } }).lean();

const createOrder = async (data) => {
  const order = await Order.create(data);
  return order.toObject();
};

const createOrderItems = async (items) => {
  const docs = await OrderItem.insertMany(items);
  return docs.map((doc) => doc.toObject());
};

const deleteOrderById = (id) => Order.findByIdAndDelete(id);

const findOrderById = (id) => Order.findById(id).lean();

const findOrderByIdAndUser = (id, userId) =>
  Order.findOne({ _id: id, userId }).lean();

const findItemsByOrderId = (orderId) => OrderItem.find({ orderId }).lean();

const findOrders = async (filter, { page, limit }) => {
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);
  return { orders, total };
};

const updateOrder = (filter, update) =>
  Order.findOneAndUpdate(
    filter,
    { $set: update },
    { new: true, runValidators: true }
  ).lean();

module.exports = {
  findProductsByIds,
  createOrder,
  createOrderItems,
  deleteOrderById,
  findOrderById,
  findOrderByIdAndUser,
  findItemsByOrderId,
  findOrders,
  updateOrder,
};
