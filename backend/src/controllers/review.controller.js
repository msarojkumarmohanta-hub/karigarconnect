const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { success, created } = require('../utils/response');

async function create(req, res, next) {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return next(Object.assign(new Error('Product not found'), { status: 404, code: 'PRODUCT_NOT_FOUND' }));
    const purchased = await Order.exists({ buyerId: req.user._id, 'items.productId': product._id, orderStatus: 'delivered' });
    if (!purchased) return next(Object.assign(new Error('Only buyers who received this product can review it'), { status: 403, code: 'PURCHASE_REQUIRED' }));
    const review = await Review.create({ buyerId: req.user._id, productId: product._id, artisanId: product.artisanId, rating: req.body.rating, comment: req.body.comment });
    return created(res, review, 'Review submitted successfully');
  } catch (error) { next(error); }
}

async function list(req, res, next) {
  try { return success(res, await Review.find({ productId: req.params.productId }).populate('buyerId', 'name avatar').sort({ createdAt: -1 }).lean(), 'Reviews fetched successfully'); } catch (error) { next(error); }
}

async function update(req, res, next) {
  try {
    const review = await Review.findOneAndUpdate({ _id: req.params.id, buyerId: req.user._id }, { rating: req.body.rating, comment: req.body.comment }, { new: true, runValidators: true });
    if (!review) return next(Object.assign(new Error('Review not found'), { status: 404, code: 'REVIEW_NOT_FOUND' }));
    return success(res, review, 'Review updated successfully');
  } catch (error) { next(error); }
}

async function remove(req, res, next) {
  try {
    const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, buyerId: req.user._id };
    const review = await Review.findOneAndDelete(filter);
    if (!review) return next(Object.assign(new Error('Review not found'), { status: 404, code: 'REVIEW_NOT_FOUND' }));
    return success(res, null, 'Review deleted successfully');
  } catch (error) { next(error); }
}

module.exports = { create, list, update, remove };
