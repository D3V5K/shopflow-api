const couponService = require('../services/coupon.service');
const asyncHandler = require('../utils/asyncHandler');

const create = asyncHandler(async (req, res) => {
  const coupon = await couponService.createCoupon(req.user.userId, req.validated.body);
  res.status(201).json({ success: true, data: coupon });
});

const list = asyncHandler(async (req, res) => {
  const { items, pagination } = await couponService.listCoupons(req.validated.query);
  res.status(200).json({ success: true, data: items, pagination });
});

const getById = asyncHandler(async (req, res) => {
  const coupon = await couponService.getCouponById(req.validated.params.id);
  res.status(200).json({ success: true, data: coupon });
});

const update = asyncHandler(async (req, res) => {
  const coupon = await couponService.updateCoupon(
    req.validated.params.id,
    req.validated.body
  );
  res.status(200).json({ success: true, data: coupon });
});

const remove = asyncHandler(async (req, res) => {
  await couponService.deleteCoupon(req.validated.params.id);
  res.status(204).send();
});

const validate = asyncHandler(async (req, res) => {
  const result = await couponService.validateCoupon(req.user.userId, {
    code: req.validated.body.code,
    orderSubtotal: req.validated.body.orderSubtotal,
  });
  res.status(200).json({ success: true, data: result });
});

const applyToOrder = asyncHandler(async (req, res) => {
  const order = await couponService.applyCouponToOrder(
    req.user.userId,
    req.validated.params.orderId,
    req.validated.body.code
  );
  res.status(200).json({ success: true, data: order });
});

module.exports = {
  create,
  list,
  getById,
  update,
  remove,
  validate,
  applyToOrder,
};