const Category = require('../models/Category');
const { success, created } = require('../utils/response');
const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
async function list(req, res, next) { try { return success(res, await Category.find({ isActive: true }).sort({ name: 1 }).lean(), 'Categories fetched successfully'); } catch (error) { next(error); } }
async function create(req, res, next) { try { return created(res, await Category.create({ ...req.body, slug: req.body.slug || slugify(req.body.name) }), 'Category created successfully'); } catch (error) { next(error); } }
async function update(req, res, next) { try { return success(res, await Category.findByIdAndUpdate(req.params.id, { ...req.body, ...(req.body.name ? { slug: slugify(req.body.name) } : {}) }, { new: true, runValidators: true }), 'Category updated successfully'); } catch (error) { next(error); } }
async function remove(req, res, next) { try { return success(res, await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }), 'Category removed successfully'); } catch (error) { next(error); } }
module.exports = { list, create, update, remove };
