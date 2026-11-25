const Review = require('../models/review.model');
const { Types } = require('mongoose');

const create = async (data) => {
  const review = await Review.create(data);
  return review.toObject();
};

const findById = (id) => Review.findById(id).lean();

const findByProductId = (productId, { skip = 0, limit = 10 } = {}) => {
  return Review.find({ productId: new Types.ObjectId(productId), isApproved: true })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'username avatar')
    .lean();
};

const countByProductId = (productId) =>
  Review.countDocuments({ productId: new Types.ObjectId(productId), isApproved: true, deletedAt: null });

const findByUserAndProduct = (userId, productId) =>
  Review.findOne({ userId: new Types.ObjectId(userId), productId: new Types.ObjectId(productId) }).lean();

const updateById = (id, data) =>
  Review.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();

const softDeleteById = (id) =>
  Review.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }, { new: true }).lean();

const getRatingStats = async (productId) => {
  const result = await Review.aggregate([
    { $match: { productId: new Types.ObjectId(productId), isApproved: true, deletedAt: null } },
    {
      $group: {
        _id: null,
        average: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);
  return result[0] || { average: 0, count: 0 };
};

module.exports = {
  create,
  findById,
  findByProductId,
  countByProductId,
  findByUserAndProduct,
  updateById,
  softDeleteById,
  getRatingStats,
};