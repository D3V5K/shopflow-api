const express = require('express');
const reviewController = require('../controllers/review.controller');
const {
  validate,
  createReviewSchema,
  updateReviewSchema,
  productIdParamSchema,
  reviewIdParamSchema,
  listReviewsQuerySchema,
} = require('../validations/review.validation');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.post(
  '/products/:productId',
  authMiddleware,
  validate(productIdParamSchema, 'params'),
  validate(createReviewSchema),
  reviewController.create
);

router.get(
  '/products/:productId',
  validate(productIdParamSchema, 'params'),
  validate(listReviewsQuerySchema, 'query'),
  reviewController.list
);

router.patch(
  '/:id',
  authMiddleware,
  validate(reviewIdParamSchema, 'params'),
  validate(updateReviewSchema),
  reviewController.update
);

router.delete(
  '/:id',
  authMiddleware,
  validate(reviewIdParamSchema, 'params'),
  reviewController.remove
);

module.exports = router;