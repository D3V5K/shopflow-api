const express = require('express');

const categoryController = require('../controllers/category.controller');
const authMiddleware = require('../middlewares/auth.middleware'); // بدلو بالمسار/الاسم الحقيقي ديال auth عندكم
const adminMiddleware = require('../middlewares/admin.middleware');
const {
  validate,
  createCategorySchema,
  updateCategorySchema,
  listCategoriesQuerySchema,
  idParamSchema,
  slugParamSchema,
} = require('../validations/category.validation');

const router = express.Router();



router.get('/', validate(listCategoriesQuerySchema, 'query'), categoryController.listCategories);

router.get('/tree', categoryController.getCategoryTree);

router.get('/slug/:slug', validate(slugParamSchema, 'params'), categoryController.getCategoryBySlug);

router.get('/:id', validate(idParamSchema, 'params'), categoryController.getCategoryById);



router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  validate(createCategorySchema),
  categoryController.createCategory
);

router.patch(
  '/:id',
  authMiddleware,
  adminMiddleware,
  validate(idParamSchema, 'params'),
  validate(updateCategorySchema),
  categoryController.updateCategory
);

router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  validate(idParamSchema, 'params'),
  categoryController.deleteCategory
);

module.exports = router;