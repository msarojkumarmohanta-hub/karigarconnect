const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Artisan = require('../models/Artisan');
const { success } = require('../utils/response');

async function dashboard(req, res, next) {
  try {
    const [users, artisans, products, orders, revenue] = await Promise.all([
      User.countDocuments(), Artisan.countDocuments(), Product.countDocuments(), Order.countDocuments(),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }])
    ]);
    return success(res, { users, artisans, products, orders, revenue: revenue[0]?.total || 0 }, 'Admin dashboard fetched successfully');
  } catch (error) { next(error); }
}
async function users(req, res, next) { try { return success(res, await User.find().select('-password -refreshTokenHash -resetTokenHash').sort({ createdAt: -1 }).limit(500).lean(), 'Users fetched successfully'); } catch (error) { next(error); } }
async function artisans(req, res, next) { try { return success(res, await Artisan.find().populate('userId', 'name email phone location isActive').lean(), 'Artisans fetched successfully'); } catch (error) { next(error); } }
async function products(req, res, next) { try { return success(res, await Product.find().populate('artisanId', 'name email').populate('categoryId', 'name').sort({ createdAt: -1 }).limit(500).lean(), 'Products fetched successfully'); } catch (error) { next(error); } }
async function orders(req, res, next) { try { return success(res, await Order.find().populate('buyerId', 'name email').populate('items.productId', 'title').sort({ createdAt: -1 }).limit(500).lean(), 'Orders fetched successfully'); } catch (error) { next(error); } }
async function moderate(req, res, next) { req.body.status = req.body.status || (req.path.endsWith('/approve') ? 'published' : 'rejected'); return require('./product.controller').moderate(req, res, next); }
async function block(req, res, next) { try { const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }); return success(res, user?.toSafeJSON(), 'User blocked successfully'); } catch (error) { next(error); } }
async function unblock(req, res, next) { try { const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true }); return success(res, user?.toSafeJSON(), 'User unblocked successfully'); } catch (error) { next(error); } }
module.exports = { dashboard, users, artisans, products, orders, moderate, block, unblock };
