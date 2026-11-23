const orderService = require('../services/order.service');
const asyncHandler = require('../utils/asyncHandler');

const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user.userId, req.validated.body);
  res.status(201).json({ success: true, data: order });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getMyOrders(
    req.user.userId,
    req.validated.query
  );
  res.status(200).json({ success: true, data: result });
});

const getMyOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getMyOrderById(
    req.user.userId,
    req.validated.params.id
  );
  res.status(200).json({ success: true, data: order });
});

const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelMyOrder(
    req.user.userId,
    req.validated.params.id,
    req.validated.body
  );
  res.status(200).json({ success: true, data: order });
});

// ---------- Admin ----------

const getAllOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getAllOrders(req.validated.query);
  res.status(200).json({ success: true, data: result });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.validated.params.id);
  res.status(200).json({ success: true, data: order });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(
    req.validated.params.id,
    req.validated.body
  );
  res.status(200).json({ success: true, data: order });
});

const updatePaymentStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updatePaymentStatus(
    req.validated.params.id,
    req.validated.body
  );
  res.status(200).json({ success: true, data: order });
});

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
