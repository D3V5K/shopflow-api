const express = require('express');

const productController = require('../controllers/product.controller');
const {
  validate,
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
  idParamSchema,
  slugParamSchema,
  adjustStockSchema,
} = require('../validations/product.validation');
const adminMiddleware = require('../middlewares/admin.middleware');
const auth = require('../middlewares/auth.middleware');
const router = express.Router();

// Public
router.get('/', validate(listProductsQuerySchema, 'query'), productController.getProducts);

// Must stay BEFORE '/:id', otherwise "slug" would be read as an id
router.get('/slug/:slug', validate(slugParamSchema, 'params'), productController.getProductBySlug);

router.get('/:id', validate(idParamSchema, 'params'), productController.getProductById);

// Admin only
router.post(
  '/',
  auth,
  adminMiddleware,
  validate(createProductSchema),
  productController.createProduct
);

router.patch(
  '/:id',
  auth,
  adminMiddleware,
  validate(idParamSchema, 'params'),
  validate(updateProductSchema),
  productController.updateProduct
);

router.patch(
  '/:id/stock',
  auth,
  adminMiddleware,
  validate(idParamSchema, 'params'),
  validate(adjustStockSchema),
  productController.adjustStock
);

router.delete(
  '/:id',
  auth,
  adminMiddleware,
  validate(idParamSchema, 'params'),
  productController.deleteProduct
);

module.exports = router;
