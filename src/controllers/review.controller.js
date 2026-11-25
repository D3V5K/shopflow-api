const reviewService = require('../services/review.service');
const asyncHandler = require('../utils/asyncHandler');

const create = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(
    req.user.userId,
    req.validated.params.productId,
    req.validated.body
  );
  res.status(201).json({ success: true, data: review });
});

const list = asyncHandler(async (req, res) => {
  const { items, pagination } = await reviewService.listReviews(
    req.validated.params.productId,
    req.validated.query
  );
  res.status(200).json({ success: true, data: items, pagination });
});

const update = asyncHandler(async (req, res) => {
  const review = await reviewService.updateReview(
    req.user.userId,
    req.validated.params.id,
    req.validated.body
  );
  res.status(200).json({ success: true, data: review });
});

const remove = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(
    req.user.userId,
    req.user.role,
    req.validated.params.id
  );
  res.status(204).send();
});

module.exports = {
  create,
  list,
  update,
  remove,
};