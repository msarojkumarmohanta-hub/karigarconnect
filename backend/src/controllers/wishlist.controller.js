const Wishlist = require('../models/Wishlist');
const { success } = require('../utils/response');
async function add(req, res, next) { try { const wishlist = await Wishlist.findOneAndUpdate({ userId: req.user._id }, { $addToSet: { products: req.params.productId } }, { upsert: true, new: true }).populate('products'); return success(res, wishlist, 'Product added to wishlist'); } catch (error) { next(error); } }
async function remove(req, res, next) { try { return success(res, await Wishlist.findOneAndUpdate({ userId: req.user._id }, { $pull: { products: req.params.productId } }, { new: true }).populate('products'), 'Product removed from wishlist'); } catch (error) { next(error); } }
async function list(req, res, next) { try { return success(res, await Wishlist.findOne({ userId: req.user._id }).populate('products').lean() || { userId: req.user._id, products: [] }, 'Wishlist fetched successfully'); } catch (error) { next(error); } }
module.exports = { add, remove, list };
