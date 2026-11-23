const express = require('express');
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');
const {
  validate,
  idParamSchema,
  createOrderSchema,
  myOrdersQuerySchema,
  adminOrdersQuerySchema,
  cancelOrderSchema,
  updateStatusSchema,
  updatePaymentStatusSchema,
} = require('../validations/order.validation');

const router = express.Router();

router.use(authMiddleware);



router.get(
  '/admin',
  adminMiddleware,
  validate(adminOrdersQuerySchema, 'query'),
  orderController.getAllOrders
);

router.get(
  '/admin/:id',
  adminMiddleware,
  validate(idParamSchema, 'params'),
  orderController.getOrderById
);

router.patch(
  '/admin/:id/status',
  adminMiddleware,
  validate(idParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  orderController.updateOrderStatus
);

router.patch(
  '/admin/:id/payment-status',
  adminMiddleware,
  validate(idParamSchema, 'params'),
  validate(updatePaymentStatusSchema, 'body'),
  orderController.updatePaymentStatus
);



router.post('/', validate(createOrderSchema, 'body'), orderController.createOrder);

router.get(
  '/',
  validate(myOrdersQuerySchema, 'query'),
  orderController.getMyOrders
);

router.get(
  '/:id',
  validate(idParamSchema, 'params'),
  orderController.getMyOrderById
);

router.patch(
  '/:id/cancel',
  validate(idParamSchema, 'params'),
  validate(cancelOrderSchema, 'body'),
  orderController.cancelMyOrder
);

module.exports = router;
