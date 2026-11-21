const productRepository = require('../repositories/productRepository');
const AppError = require('../utils/AppError');


const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const SORT_MAP = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  rating: { averageRating: -1 },
  popular: { soldCount: -1 },
};

const buildFilter = (query) => {
  const filter = { isActive: true };

  if (query.categoryId) filter.categoryId = query.categoryId;
  if (query.isFeatured !== undefined) filter.isFeatured = query.isFeatured;
  if (query.tags && query.tags.length) filter.tags = { $in: query.tags };
  if (query.inStock) filter.stock = { $gt: 0 };
  if (query.search) filter.$text = { $search: query.search };

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};
    if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
    if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
  }

  return filter;
};

const assertPricing = (price, compareAtPrice) => {
  if (compareAtPrice !== null && compareAtPrice !== undefined && compareAtPrice <= price) {
    throw  new AppError('compareAtPrice must be greater than price', 400);
  }
};

const handleWriteError = (err) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return  new AppError(`A product with this ${field} already exists`, 409);
  }
  return err;
};

const productService = {
  async getProducts(query) {
    const { page = 1, limit = 20, sort = 'newest' } = query;
    const filter = buildFilter(query);

    const [data, total] = await Promise.all([
      productRepository.findAll({
        filter,
        sort: SORT_MAP[sort] || SORT_MAP.newest,
        skip: (page - 1) * limit,
        limit,
      }),
      productRepository.count(filter),
    ]);

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product) throw  new AppError('Product not found', 404);
    return product;
  },

  async getProductBySlug(slug) {
    const product = await productRepository.findBySlug(slug);
    if (!product) throw  new AppError('Product not found', 404);
    return product;
  },

  async createProduct(data) {
    const slug = data.slug || slugify(data.name);
    if (!slug) throw  new AppError('Unable to generate a slug, please provide one', 400);

    const sku = data.sku.toUpperCase();

    const [slugExists, skuExists] = await Promise.all([
      productRepository.findBySlug(slug),
      productRepository.findBySku(sku),
    ]);
    if (slugExists) throw  new AppError('A product with this slug already exists', 409);
    if (skuExists) throw  new AppError('A product with this sku already exists', 409);

    assertPricing(data.price, data.compareAtPrice);

    try {
      return await productRepository.create({ ...data, slug, sku });
    } catch (err) {
      throw handleWriteError(err);
    }
  },

  async updateProduct(id, data) {
    const existing = await productRepository.findById(id);
    if (!existing) throw  new AppError('Product not found', 404);

    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await productRepository.findBySlug(data.slug);
      if (slugExists) throw  new AppError('A product with this slug already exists', 409);
    }

    if (data.sku && data.sku.toUpperCase() !== existing.sku) {
      const skuExists = await productRepository.findBySku(data.sku);
      if (skuExists) throw  new AppError('A product with this sku already exists', 409);
    }

    assertPricing(
      data.price !== undefined ? data.price : existing.price,
      data.compareAtPrice !== undefined ? data.compareAtPrice : existing.compareAtPrice
    );

    try {
      return await productRepository.updateById(id, data);
    } catch (err) {
      throw handleWriteError(err);
    }
  },

  async deleteProduct(id) {
    const product = await productRepository.softDeleteById(id);
    if (!product) throw  new AppError('Product not found', 404);
    return product;
  },

  async adjustStock(id, delta) {
    const product = await productRepository.findById(id);
    if (!product) throw  new AppError('Product not found', 404);
    if (!product.trackInventory) {
      throw  new AppError('Inventory tracking is disabled for this product', 400);
    }

    const updated = await productRepository.adjustStock(id, delta);
    if (!updated) throw  new AppError('Insufficient stock', 409);
    return updated;
  },
};

module.exports = productService;
