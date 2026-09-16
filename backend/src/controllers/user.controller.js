const User = require('../models/User');
const Artisan = require('../models/Artisan');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { success } = require('../utils/response');

async function updateMe(req, res, next) {
  try {
    const allowed = ['name', 'phone', 'avatar', 'bio', 'location', 'craftType', 'language'];
    const changes = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    const user = await User.findByIdAndUpdate(req.user._id, { $set: changes }, { new: true, runValidators: true });
    if (req.user.role === 'artisan' && (changes.craftType || req.body.experience || req.body.workshopName || req.body.story || req.body.skills)) {
      await Artisan.findOneAndUpdate({ userId: req.user._id }, { $set: Object.fromEntries(Object.entries(req.body).filter(([key]) => ['craftType', 'experience', 'workshopName', 'story', 'skills', 'certifications'].includes(key))) }, { upsert: true, new: true });
    }
    return success(res, user.toSafeJSON(), 'Profile updated successfully');
  } catch (error) { next(error); }
}

async function listUsers(req, res, next) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 25, 100);
    const filter = req.query.role ? { role: req.query.role } : {};
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      User.countDocuments(filter)
    ]);
    return success(res, users, 'Users fetched successfully', { page, limit, total, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
}

async function setActive(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: Boolean(req.body.isActive) }, { new: true });
    if (!user) return next(Object.assign(new Error('User not found'), { status: 404, code: 'USER_NOT_FOUND' }));
    return success(res, user.toSafeJSON(), 'User status updated');
  } catch (error) { next(error); }
}

async function analytics(req, res, next) {
  try {
    const [users, products, orders, revenue] = await Promise.all([
      User.countDocuments(), Product.countDocuments(), Order.countDocuments(),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }])
    ]);
    return success(res, { users, products, orders, revenue: revenue[0]?.total || 0 }, 'Platform analytics fetched successfully');
  } catch (error) { next(error); }
}

module.exports = { updateMe, listUsers, setActive, analytics };
