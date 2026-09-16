const Product = require('../models/Product');
const Category = require('../models/Category');
const { success, created } = require('../utils/response');
function queryFilters(query) {
  const filter = { status: 'published' };
  if (query.search) {
    const aliases = { dokara: 'dokra', baskt: 'basket', sambalpuri: 'sambalpuri' };
    const rawSearch = String(query.search).trim().toLowerCase();
    const search = aliases[rawSearch] || rawSearch;
    const term = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const expression = new RegExp(term, 'i');
    filter.$or = [
      { title: expression },
      { description: expression },
      { tags: expression },
      { materials: expression },
      { craftType: expression },
      { subcategory: expression },
      { material: expression },
      { 'location.state': expression },
      { 'location.district': expression }
    ];
  }
  if (query.category) filter.categoryId = query.category;
  if (query.craftType) filter.craftType = new RegExp(query.craftType, 'i');
  if (query.material) filter.material = new RegExp(query.material, 'i');
  if (query.artisan) filter['artisanId'] = query.artisan;
  if (query.handmade === 'true') filter.handmade = true;
  if (query.featured === 'true') filter.featured = true;
  if (query.availability) filter.availability = query.availability;
  if (query.minRating) filter.rating = { ...(filter.rating || {}), $gte: Number(query.minRating) };
  if (query.location) filter.$or = [{ 'location.state': new RegExp(query.location, 'i') }, { 'location.district': new RegExp(query.location, 'i') }];
  if (query.minPrice || query.maxPrice) filter.price = {}; if (query.minPrice) filter.price.$gte = Number(query.minPrice); if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  if (query.tags) filter.tags = { $in: query.tags.split(',').map((x) => x.trim().toLowerCase()) };
  return filter;
}
async function list(req, res, next) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const filter = queryFilters(req.query);
    if (req.query.category && !/^[a-f\d]{24}$/i.test(req.query.category)) {
      const value = String(req.query.category);
      const category = await Category.findOne({ $or: [{ slug: value.toLowerCase() }, { name: new RegExp(`^${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }] }).lean();
      if (category) filter.categoryId = category._id;
      else filter.subcategory = new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }
    if (req.query.artisan && !/^[a-f\d]{24}$/i.test(req.query.artisan)) {
      const User = require('../models/User');
      const artisan = await User.findOne({ name: new RegExp(String(req.query.artisan), 'i') }).select('_id').lean();
      filter.artisanId = artisan?._id || null;
    }
    const sort = req.query.sort === 'price_asc' ? { price: 1 } : req.query.sort === 'price_desc' ? { price: -1 } : req.query.sort === 'rating' ? { rating: -1, reviewCount: -1 } : req.query.sort === 'popular' ? { views: -1, likes: -1 } : { createdAt: -1 };
    const [data, total] = await Promise.all([Product.find(filter).populate('artisanId', 'name craftType location').populate('categoryId', 'name slug').sort(sort).skip((page - 1) * limit).limit(limit).lean(), Product.countDocuments(filter)]);
    return success(res, data, 'Products fetched successfully', { page, limit, total, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
}
async function get(req, res, next) { try { const product = await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true }).populate('artisanId', 'name craftType location').populate('categoryId', 'name slug'); if (!product) return next(Object.assign(new Error('Product not found'), { status: 404, code: 'PRODUCT_NOT_FOUND' })); return success(res, product, 'Product fetched successfully'); } catch (error) { next(error); } }
async function create(req, res, next) { try { const product = await Product.create({ ...req.body, artisanId: req.user._id, status: req.user.role === 'admin' ? 'published' : 'draft' }); return created(res, product, 'Product created successfully'); } catch (error) { next(error); } }
async function update(req, res, next) { try { const allowed = ['title', 'description', 'categoryId', 'images', 'price', 'discountPercent', 'currency', 'tags', 'materials', 'dimensions', 'weight', 'stock', 'availability', 'handmade', 'ecoFriendly', 'location', 'status']; const changes = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key))); const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, artisanId: req.user._id }; const product = await Product.findOneAndUpdate(filter, { $set: changes }, { new: true, runValidators: true }); if (!product) return next(Object.assign(new Error('Product not found'), { status: 404, code: 'PRODUCT_NOT_FOUND' })); return success(res, product, 'Product updated successfully'); } catch (error) { next(error); } }
async function remove(req, res, next) { try { const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, artisanId: req.user._id }; const product = await Product.findOneAndUpdate(filter, { status: 'archived' }, { new: true }); if (!product) return next(Object.assign(new Error('Product not found'), { status: 404, code: 'PRODUCT_NOT_FOUND' })); return success(res, product, 'Product archived successfully'); } catch (error) { next(error); } }
async function publish(req, res, next) { try { const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, artisanId: req.user._id }; const product = await Product.findOneAndUpdate(filter, { status: req.user.role === 'admin' ? 'published' : 'pending_review' }, { new: true }); if (!product) return next(Object.assign(new Error('Product not found'), { status: 404, code: 'PRODUCT_NOT_FOUND' })); return success(res, product, 'Product submitted for publication'); } catch (error) { next(error); } }
async function moderate(req, res, next) { try { if (!['published', 'rejected', 'archived'].includes(req.body.status)) return next(Object.assign(new Error('Invalid moderation status'), { status: 422, code: 'INVALID_STATUS' })); const product = await Product.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }); if (!product) return next(Object.assign(new Error('Product not found'), { status: 404, code: 'PRODUCT_NOT_FOUND' })); return success(res, product, 'Product moderation status updated'); } catch (error) { next(error); } }
async function artisanProducts(req, res, next) { try { return success(res, await Product.find({ artisanId: req.params.artisanId, status: 'published' }).sort({ createdAt: -1 }).lean(), 'Artisan products fetched successfully'); } catch (error) { next(error); } }
async function search(req, res, next) { req.query.search = req.query.q || req.query.search; return list(req, res, next); }
async function mine(req, res, next) { req.query.includeAll = 'true'; try { return success(res, await Product.find({ artisanId: req.user._id, status: { $ne: 'archived' } }).sort({ createdAt: -1 }).lean(), 'Your products fetched successfully'); } catch (error) { next(error); } }
async function unpublish(req, res, next) { req.body.status = 'draft'; return update(req, res, next); }
async function stock(req, res, next) { req.body.stock = Number(req.body.stock); return update(req, res, next); }
module.exports = { list, get, create, update, remove, publish, moderate, artisanProducts, search, mine, unpublish, stock };
