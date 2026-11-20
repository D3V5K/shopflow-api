const categoryRepository = require('../repositories/categoryRepository');
const AppError = require('../utils/AppError');


const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const slugify = (value) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

const sameId = (a, b) => String(a ?? null) === String(b ?? null);


const rethrowDuplicateKey = (err) => {
  if (err && err.code === 11000) {
    const field = Object.keys(err.keyPattern || {}).includes('slug') ? 'slug' : 'name';
    throw new AppError(`Category ${field} already exists`, 409);
  }
  throw err;
};

const buildTree = (nodes) => {
  const map = new Map();
  nodes.forEach((node) => map.set(String(node._id), { ...node, children: [] }));

  const roots = [];
  map.forEach((node) => {
    if (!node.parentId) {
      roots.push(node);
      return;
    }
    const parent = map.get(String(node.parentId));
    if (parent) parent.children.push(node);
  });

  return roots;
};


const ensureCategoryExists = async (id) => {
  const category = await categoryRepository.findById(id);
  if (!category) throw new AppError('Category not found', 404);
  return category;
};

const ensureParentValid = async (parentId, categoryId = null) => {
  const parent = await categoryRepository.findById(parentId);
  if (!parent) throw new AppError('Parent category not found', 404);

  if (!categoryId) return parent;

  const visited = new Set();
  let current = parent;

  while (current) {
    if (sameId(current._id, categoryId)) {
      throw new AppError('A category cannot be moved under itself or its descendants', 400);
    }
    const key = String(current._id);
    if (visited.has(key)) break;
    visited.add(key);

    current = current.parentId ? await categoryRepository.findById(current.parentId) : null;
  }

  return parent;
};

const ensureNameAvailable = async (parentId, name, excludeId = null) => {
  const existing = await categoryRepository.findByParentAndName(parentId, name);
  if (existing && !sameId(existing._id, excludeId)) {
    throw new AppError('A category with this name already exists under the same parent', 409);
  }
};

const ensureSlugAvailable = async (slug, excludeId = null) => {
  const existing = await categoryRepository.findBySlug(slug);
  if (existing && !sameId(existing._id, excludeId)) {
    throw new AppError('A category with this slug already exists', 409);
  }
};

const createCategory = async (data) => {
  const slug = data.slug || slugify(data.name);
  if (!slug) {
    throw new AppError('Unable to generate a slug from the name, please provide one', 400);
  }

  const parentId = data.parentId ?? null;
  if (parentId) await ensureParentValid(parentId);

  await ensureNameAvailable(parentId, data.name);
  await ensureSlugAvailable(slug);

  try {
    return await categoryRepository.create({ ...data, slug, parentId });
  } catch (err) {
    return rethrowDuplicateKey(err);
  }
};

const getCategoryById = async (id) => ensureCategoryExists(id);

const getCategoryBySlug = async (slug) => {
  const category = await categoryRepository.findBySlug(slug);
  if (!category) throw new AppError('Category not found', 404);
  return category;
};

const listCategories = async ({
  page = 1,
  limit = 20,
  parentId,
  isActive,
  search,
  sortBy = 'sortOrder',
  order = 'asc',
} = {}) => {
  const filter = {};

  if (parentId !== undefined) filter.parentId = parentId === 'null' ? null : parentId;
  if (isActive !== undefined) filter.isActive = isActive;
  if (search) filter.name = { $regex: escapeRegex(search), $options: 'i' };

  const sort = { [sortBy]: order === 'desc' ? -1 : 1 };
  if (sortBy !== 'name') sort.name = 1; // ترتيب ثابت فحالة التساوي

  const { items, total } = await categoryRepository.findAll(filter, {
    skip: (page - 1) * limit,
    limit,
    sort,
  });

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

const getCategoryTree = async ({ includeInactive = false } = {}) => {
  const filter = includeInactive ? {} : { isActive: true };
  const nodes = await categoryRepository.findAllForTree(filter);
  return buildTree(nodes);
};

const updateCategory = async (id, data) => {
  const category = await ensureCategoryExists(id);

  const hasParentChange = data.parentId !== undefined && !sameId(data.parentId, category.parentId);
  const hasNameChange = data.name !== undefined && data.name !== category.name;
  const hasSlugChange = data.slug !== undefined && data.slug !== category.slug;

  if (hasParentChange && data.parentId) {
    await ensureParentValid(data.parentId, id);
  }

  if (hasParentChange || hasNameChange) {
    const targetParentId = data.parentId !== undefined ? data.parentId : category.parentId;
    const targetName = data.name !== undefined ? data.name : category.name;
    await ensureNameAvailable(targetParentId, targetName, id);
  }

  if (hasSlugChange) await ensureSlugAvailable(data.slug, id);

  try {
    const updated = await categoryRepository.updateById(id, data);
    if (!updated) throw new AppError('Category not found', 404);
    return updated;
  } catch (err) {
    return rethrowDuplicateKey(err);
  }
};

const deleteCategory = async (id) => {
  await ensureCategoryExists(id);

  const childrenCount = await categoryRepository.countChildren(id);
  if (childrenCount > 0) {
    throw new AppError('Cannot delete a category that has sub-categories', 409);
  }

  const deleted = await categoryRepository.softDeleteById(id);
  if (!deleted) throw new AppError('Category not found', 404);
};

module.exports = {
  createCategory,
  getCategoryById,
  getCategoryBySlug,
  listCategories,
  getCategoryTree,
  updateCategory,
  deleteCategory,
};
