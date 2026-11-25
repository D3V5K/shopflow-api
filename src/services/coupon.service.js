const couponRepository = require('../repositories/couponRepository');
const orderRepository = require('../repositories/orderRepository');
const AppError = require('../utils/AppError');

const createCoupon = async (adminId, data) => {
  const existing = await couponRepository.findByCode(data.code);
  if (existing) throw new AppError('Coupon code already exists', 409);

  const coupon = await couponRepository.create({
    ...data,
    createdBy: adminId,
  });

  return coupon;
};

const listCoupons = async ({ page = 1, limit = 20 } = {}) => {
  const items = await couponRepository.findAll({ skip: (page - 1) * limit, limit });
  const total = await couponRepository.countAll();

  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };

  return { items, pagination };
};

const getCouponById = async (id) => {
  const coupon = await couponRepository.findById(id);
  if (!coupon) throw new AppError('Coupon not found', 404);
  return coupon;
};

const updateCoupon = async (id, data) => {
  const existing = await couponRepository.findById(id);
  if (!existing) throw new AppError('Coupon not found', 404);

  if (data.code && data.code !== existing.code) {
    const codeExists = await couponRepository.findByCode(data.code);
    if (codeExists) throw new AppError('Coupon code already exists', 409);
  }

  const coupon = await couponRepository.updateById(id, data);
  return coupon;
};

const deleteCoupon = async (id) => {
  const coupon = await couponRepository.findById(id);
  if (!coupon) throw new AppError('Coupon not found', 404);

  await couponRepository.softDeleteById(id);
  return true;
};

const validateCoupon = async (userId, { code, orderSubtotal, items }) => {
  const coupon = await couponRepository.findByCode(code);
  if (!coupon) throw new AppError('Coupon not found', 404);

  const now = new Date();

  if (!coupon.isActive) throw new AppError('Coupon is inactive', 400);
  if (now < coupon.startsAt) throw new AppError('Coupon is not yet active', 400);
  if (coupon.expiresAt && now > coupon.expiresAt) throw new AppError('Coupon has expired', 400);

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    throw new AppError('Coupon usage limit reached', 400);
  }

  const usageCount = await couponRepository.countUsageByUserAndCoupon(
    userId,
    coupon._id
  );
  if (usageCount >= coupon.perUserLimit) {
    throw new AppError('You have reached the usage limit for this coupon', 400);
  }

  if (orderSubtotal < coupon.minOrderAmount) {
    throw new AppError(`Minimum order amount is ${coupon.minOrderAmount}`, 400);
  }

  if (coupon.firstOrderOnly) {
    const { total: orderCount } = await orderRepository.findOrders(
      { userId },
      { page: 1, limit: 1 }
    );
    if (orderCount > 0) {
      throw new AppError('Coupon is valid for first order only', 400);
    }
  }

  let discount = 0;

  if (coupon.discountType === 'PERCENTAGE') {
    discount = Math.floor(orderSubtotal * (coupon.discountValue / 100));
    if (coupon.maxDiscountAmount !== null) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  } else if (coupon.discountType === 'FIXED') {
    discount = Math.min(coupon.discountValue, orderSubtotal);
  }

  return {
    coupon,
    discount,
    finalTotal: orderSubtotal - discount,
  };
};

const applyCouponToOrder = async (userId, orderId, code) => {
  const order = await orderRepository.findOrderByIdAndUser(orderId, userId);
  if (!order) throw new AppError('Order not found', 404);

  if (order.couponId) throw new AppError('Order already has a coupon', 400);

  if (order.status !== 'PENDING') {
    throw new AppError('Coupon can only be applied to pending orders', 400);
  }

  const { coupon, discount } = await validateCoupon(userId, {
    code,
    orderSubtotal: order.subtotal,
    items: [],
  });

  const totalAmount = order.subtotal - discount + order.shippingCost + order.taxAmount;

  const updatedOrder = await orderRepository.updateOrder(
    { _id: orderId },
    {
      couponId: coupon._id,
      couponCode: code,
      discountAmount: discount,
      totalAmount,
    }
  );

  await couponRepository.incrementUsedCount(coupon._id);

  await couponRepository.createUsage({
    couponId: coupon._id,
    userId,
    orderId,
    discountApplied: discount,
  });

  return updatedOrder;
};

module.exports = {
  createCoupon,
  listCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCouponToOrder,
};