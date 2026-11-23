const crypto = require('crypto');
const orderRepository = require('../repositories/orderRepository');
const AppError = require("../utils/AppError");



const STATUS_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

const CUSTOMER_CANCELLABLE = ['PENDING', 'CONFIRMED'];

const generateOrderNumber = () =>
  `ORD-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

const withItems = async (order) => {
  const items = await orderRepository.findItemsByOrderId(order._id);
  return { ...order, items };
};



const createOrder = async (userId, { items, shippingAddress, customerNote }) => {
  const quantities = new Map();
  for (const { productId, quantity } of items) {
    quantities.set(productId, (quantities.get(productId) || 0) + quantity);
  }

  const products = await orderRepository.findProductsByIds([
    ...quantities.keys(),
  ]);
  if (products.length !== quantities.size) {
    throw new AppError('One or more products were not found', 404);
  }

  const orderItems = products.map((product) => {
    const quantity = quantities.get(String(product._id));
    const price = product.price;
    return {
      productId: product._id,
      productName: product.name,
      productSlug: product.slug || null,
      productImage: product.image || null,
      sku: product.sku || null,
      price,
      quantity,
      subtotal: price * quantity,
      itemDiscount: 0,
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = orderItems.reduce(
    (sum, item) => sum + item.itemDiscount,
    0
  );
  const shippingCost = 0;
  const taxAmount = 0;
  const totalAmount = subtotal - discountAmount + shippingCost + taxAmount;

  const order = await orderRepository.createOrder({
    orderNumber: generateOrderNumber(),
    userId,
    shippingAddress,
    subtotal,
    discountAmount,
    shippingCost,
    taxAmount,
    totalAmount,
    customerNote: customerNote || null,
  });

  try {
    const createdItems = await orderRepository.createOrderItems(
      orderItems.map((item) => ({ ...item, orderId: order._id }))
    );
    return { ...order, items: createdItems };
  } catch (error) {
    // Do not keep an order without its items
    await orderRepository.deleteOrderById(order._id);
    throw error;
  }
};

const getMyOrders = async (userId, { page, limit, status }) => {
  const filter = { userId };
  if (status) filter.status = status;

  const { orders, total } = await orderRepository.findOrders(filter, {
    page,
    limit,
  });
  return { orders, total, page, limit };
};

const getMyOrderById = async (userId, orderId) => {
  const order = await orderRepository.findOrderByIdAndUser(orderId, userId);
  if (!order) throw new AppError('Order not found', 404);
  return withItems(order);
};

const cancelMyOrder = async (userId, orderId, { cancelReason }) => {
  const order = await orderRepository.findOrderByIdAndUser(orderId, userId);
  if (!order) throw new AppError('Order not found', 404);

  if (!CUSTOMER_CANCELLABLE.includes(order.status)) {
    throw new AppError(`Order cannot be cancelled once ${order.status}`, 400);
  }

  const updated = await orderRepository.updateOrder(
    { _id: orderId, status: order.status },
    {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancelReason: cancelReason || null,
    }
  );
  if (!updated) {
    throw new AppError('Order was changed by another request, please retry', 409);
  }
  return withItems(updated);
};


const getAllOrders = async ({ page, limit, status, paymentStatus, userId }) => {
  const filter = {};
  if (status) filter.status = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (userId) filter.userId = userId;

  const { orders, total } = await orderRepository.findOrders(filter, {
    page,
    limit,
  });
  return { orders, total, page, limit };
};

const getOrderById = async (orderId) => {
  const order = await orderRepository.findOrderById(orderId);
  if (!order) throw new AppError('Order not found', 404);
  return withItems(order);
};

const updateOrderStatus = async (
  orderId,
  { status, trackingNumber, carrier, cancelReason, adminNote }
) => {
  const order = await orderRepository.findOrderById(orderId);
  if (!order) throw new AppError('Order not found', 404);

  if (!STATUS_TRANSITIONS[order.status].includes(status)) {
    throw new AppError(
      `Cannot change status from ${order.status} to ${status}`,
      400
    );
  }

  const now = new Date();
  const update = { status };
  if (adminNote !== undefined) update.adminNote = adminNote;

  if (status === 'CONFIRMED') update.confirmedAt = now;
  if (status === 'SHIPPED') {
    update.shippedAt = now;
    update.trackingNumber = trackingNumber;
    update.carrier = carrier;
  }
  if (status === 'DELIVERED') update.deliveredAt = now;
  if (status === 'CANCELLED') {
    update.cancelledAt = now;
    update.cancelReason = cancelReason;
  }
  if (status === 'REFUNDED') update.refundedAt = now;

  const updated = await orderRepository.updateOrder(
    { _id: orderId, status: order.status },
    update
  );
  if (!updated) {
    throw new AppError('Order was changed by another request, please retry', 409);
  }
  return withItems(updated);
};

const updatePaymentStatus = async (orderId, { paymentStatus }) => {
  const updated = await orderRepository.updateOrder(
    { _id: orderId },
    { paymentStatus }
  );
  if (!updated) throw new AppError('Order not found', 404);
  return withItems(updated);
};

module.exports = {
  createOrder,
  getMyOrders,
  getMyOrderById,
  cancelMyOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
};
