const Category = require('../models/category.model');

const create = async (data) => Category.create(data);

const findById = async (id) => Category.findById(id);

const findBySlug = async (slug) => Category.findOne({ slug });

const findByParentAndName = async (parentId, name) =>
  Category.findOne({ parentId: parentId ?? null, name });

const findAll = async (filter = {}, { skip = 0, limit = 20, sort = { sortOrder: 1 } } = {}) => {
  const [items, total] = await Promise.all([
    Category.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Category.countDocuments({ ...filter, deletedAt: null }),
  ]);

  return { items, total };
};

const findAllForTree = async (filter = {}) =>
  Category.find(filter).sort({ sortOrder: 1, name: 1 }).lean();

const countChildren = async (parentId) =>
  Category.countDocuments({ parentId, deletedAt: null });

const updateById = async (id, data) =>
  Category.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });

const softDeleteById = async (id) =>
  Category.findByIdAndUpdate(
    id,
    { $set: { deletedAt: new Date(), isActive: false } },
    { new: true }
  );

module.exports = {
  create,
  findById,
  findBySlug,
  findByParentAndName,
  findAll,
  findAllForTree,
  countChildren,
  updateById,
  softDeleteById,
};
