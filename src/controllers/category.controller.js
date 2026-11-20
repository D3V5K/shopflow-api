const categoryService = require('../services/category.service');
const asyncHandler = require('../utils/asyncHandler');

const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);

  res.status(201).json({ status: 'success', data: { category } });
});

const listCategories = asyncHandler(async (req, res) => {
  const { items, pagination } = await categoryService.listCategories(req.validated.query);

  res.status(200).json({ status: 'success', data: { categories: items }, pagination });
});

const getCategoryTree = asyncHandler(async (req, res) => {
  const tree = await categoryService.getCategoryTree();

  res.status(200).json({ status: 'success', data: { categories: tree } });
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);

  res.status(200).json({ status: 'success', data: { category } });
});

const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryBySlug(req.params.slug);

  res.status(200).json({ status: 'success', data: { category } });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);

  res.status(200).json({ status: 'success', data: { category } });
});

const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);

  res.status(204).send();
});

module.exports = {
  createCategory,
  listCategories,
  getCategoryTree,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
};
