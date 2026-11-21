const productService = require('../services/product.service');
const asyncHandler = require('../utils/asyncHandler');

const getProducts = asyncHandler(async (req, res) => {
  const { data, pagination } = await productService.getProducts(req.validated.query);
  res.status(200).json({ success: true, data, pagination });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.validated.params.id);
  res.status(200).json({ success: true, data: product });
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await productService.getProductBySlug(req.validated.params.slug);
  res.status(200).json({ success: true, data: product });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.validated.body);
  res.status(201).json({ success: true, data: product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(
    req.validated.params.id,
    req.validated.body
  );
  res.status(200).json({ success: true, data: product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.validated.params.id);
  res.status(204).send();
});

const adjustStock = asyncHandler(async (req, res) => {
  const product = await productService.adjustStock(
    req.validated.params.id,
    req.validated.body.delta
  );
  res.status(200).json({ success: true, data: product });
});

module.exports = {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
};
