const express = require('express');
const cartController = require('../controllers/cart.controller');
const {
  validate,
  addItemSchema,
  updateItemSchema,
  itemIdParamSchema,
} = require('../validations/cart.validation');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', cartController.getCart);
router.post('/items', validate(addItemSchema), cartController.addItem);
router.patch(
  '/items/:itemId',
  validate(itemIdParamSchema, 'params'),
  validate(updateItemSchema),
  cartController.updateItemQuantity
);
router.delete(
  '/items/:itemId',
  validate(itemIdParamSchema, 'params'),
  cartController.removeItem
);
router.delete('/', cartController.clearCart);

module.exports = router;
