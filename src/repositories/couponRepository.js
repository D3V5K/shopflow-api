const Coupon = require('../models/coupon.model');
const CouponUsage = require('../models/couponUsage.model');

const create = async (data) => {
  const coupon = await Coupon.create(data);
  return coupon.toObject();
};

const findById = (id) => Coupon.findById(id).lean();

const findByCode = (code) => Coupon.findOne({ code: code.toUpperCase() }).lean();

const findAll = ({ skip = 0, limit = 20 } = {}) => {
  return Coupon.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

const countAll = () => Coupon.countDocuments();

const updateById = (id, data) => {
  return Coupon.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();
};

const softDeleteById = (id) => {
  return Coupon.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true }).lean();
};

const incrementUsedCount = (couponId) => {
  return Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } }, { new: true }).lean();
};

const createUsage = async (data) => {
  const usage = await CouponUsage.create(data);
  return usage.toObject();
};

const countUsageByUserAndCoupon = (userId, couponId) => {
  return CouponUsage.countDocuments({ userId, couponId });
};

const findUsageByUserAndCoupon = (userId, couponId) => {
  return CouponUsage.find({ userId, couponId }).lean();
};

module.exports = {
  create,
  findById,
  findByCode,
  findAll,
  countAll,
  updateById,
  softDeleteById,
  incrementUsedCount,
  createUsage,
  countUsageByUserAndCoupon,
  findUsageByUserAndCoupon,
};