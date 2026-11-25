const express = require('express');
const wishlistController = require('../controllers/wishlist.controller');
const {
  validate,
  productIdParamSchema,
} = require('../validations/wishlist.validation');
const authenticate = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', wishlistController.get);

router.post(
  '/:productId',
  validate(productIdParamSchema, 'params'),
  wishlistController.add
);

router.delete(
  '/:productId',
  validate(productIdParamSchema, 'params'),
  wishlistController.remove
);

router.delete('/', wishlistController.clear);

module.exports = router;