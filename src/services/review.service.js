const reviewRepository = require('../repositories/reviewRepository');
const productRepository = require('../repositories/productRepository');
const AppError = require('../utils/AppError');
const Order = require('../models/order.model');
const OrderItem = require('../models/orderItem.model');
const { Types } = require('mongoose');

const verifyPurchase = async (userId, productId) => {
  // Cast to ObjectId for proper MongoDB comparison
  const parsedUserId = new Types.ObjectId(userId);
  const parsedProductId = new Types.ObjectId(productId);

  // Step 1: Find all order items for this product
  const orderItems = await OrderItem.find({ productId: parsedProductId })
    .select('orderId')
    .lean();

  // Debug log for verification
  console.log('[verifyPurchase]', {
    userId: parsedUserId.toString(),
    productId: parsedProductId.toString(),
    orderItemsCount: orderItems.length,
  });

  if (!orderItems.length) {
    return { verified: false, orderId: null };
  }

  // Step 2: Collect unique order IDs
  const orderIds = [...new Set(orderItems.map((item) => item.orderId))];

  // Step 3: Find a valid order for this user with an allowed status
  const order = await Order.findOne({
    _id: { $in: orderIds },
    userId: parsedUserId,
    status: { $in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
  })
    .select('_id')
    .lean();

  // Debug log for verification
  console.log('[verifyPurchase] orderFound:', !!order, 'orderId:', order?._id);

  if (!order) {
    return { verified: false, orderId: null };
  }

  return { verified: true, orderId: order._id };
};

const createReview = async (userId, productId, data) => {
  const product = await productRepository.findById(productId);
  if (!product) throw new AppError('Product not found', 404);

  const existing = await reviewRepository.findByUserAndProduct(userId, productId);
  if (existing) throw new AppError('You already reviewed this product', 409);

  const { verified, orderId } = await verifyPurchase(userId, productId);

  const review = await reviewRepository.create({
    userId,
    productId,
    orderId: verified ? orderId : null,
    rating: data.rating,
    title: data.title || null,
    comment: data.comment || null,
    images: data.images || [],
    isVerifiedPurchase: verified,
    isApproved: true,
  });

  const stats = await reviewRepository.getRatingStats(productId);
  await productRepository.updateById(productId, {
    averageRating: stats.average || 0,
    reviewCount: stats.count,
  });

  return review;
};

const listReviews = async (productId, { page = 1, limit = 10 } = {}) => {
  const product = await productRepository.findById(productId);
  if (!product) throw new AppError('Product not found', 404);

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    reviewRepository.findByProductId(productId, { skip, limit }),
    reviewRepository.countByProductId(productId),
  ]);

  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };

  return { items, pagination };
};

const updateReview = async (userId, reviewId, data) => {
  const review = await reviewRepository.findById(reviewId);
  if (!review) throw new AppError('Review not found', 404);

  if (review.userId.toString() !== userId.toString()) {
    throw new AppError('You can only update your own reviews', 403);
  }

  const updateData = {};
  if (data.rating !== undefined) updateData.rating = data.rating;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.comment !== undefined) updateData.comment = data.comment;
  if (data.images !== undefined) updateData.images = data.images;

  const updated = await reviewRepository.updateById(reviewId, updateData);

  const stats = await reviewRepository.getRatingStats(review.productId);
  await productRepository.updateById(review.productId, {
    averageRating: stats.average || 0,
    reviewCount: stats.count,
  });

  return updated;
};

const deleteReview = async (userId, userRole, reviewId) => {
  const review = await reviewRepository.findById(reviewId);
  if (!review) throw new AppError('Review not found', 404);

  const isOwner = review.userId.toString() === userId.toString();
  if (!isOwner && userRole !== 'ADMIN') {
    throw new AppError('You can only delete your own reviews', 403);
  }

  await reviewRepository.softDeleteById(reviewId);

  const stats = await reviewRepository.getRatingStats(review.productId);
  await productRepository.updateById(review.productId, {
    averageRating: stats.average || 0,
    reviewCount: stats.count,
  });

  return true;
};

module.exports = {
  verifyPurchase,
  createReview,
  listReviews,
  updateReview,
  deleteReview,
};