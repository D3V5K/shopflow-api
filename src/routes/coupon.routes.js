const express = require('express');
const couponController = require('../controllers/coupon.controller');
const {
  validate,
  createCouponSchema,
  updateCouponSchema,
  couponIdParamSchema,
  orderIdParamSchema,
  validateCouponSchema,
  applyCouponSchema,
  listCouponsQuerySchema,
} = require('../validations/coupon.validation');
const authenticate = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

const router = express.Router();

// Admin-only routes
router.post(
  '/',
  authenticate,
  adminMiddleware,
  validate(createCouponSchema),
  couponController.create
);

router.get(
  '/',
  authenticate,
  adminMiddleware,
  validate(listCouponsQuerySchema, 'query'),
  couponController.list
);

router.get(
  '/:id',
  authenticate,
  adminMiddleware,
  validate(couponIdParamSchema, 'params'),
  couponController.getById
);

router.patch(
  '/:id',
  authenticate,
  adminMiddleware,
  validate(couponIdParamSchema, 'params'),
  validate(updateCouponSchema),
  couponController.update
);

router.delete(
  '/:id',
  authenticate,
  adminMiddleware,
  validate(couponIdParamSchema, 'params'),
  couponController.remove
);

// Authenticated user routes
router.post(
  '/validate',
  authenticate,
  validate(validateCouponSchema),
  couponController.validate
);

router.post(
  '/apply/:orderId',
  authenticate,
  validate(orderIdParamSchema, 'params'),
  validate(applyCouponSchema),
  couponController.applyToOrder
);

module.exports = router;